#!/usr/bin/env bash
# Apply new supabase/migrations/NNN_name.sql files to production, recording each one in a ledger.
#
# Run by .github/workflows/migrate-production.yml. Full runbook: docs/01-operations.md,
# "Production migrations". Written for bash 3.2 too, so `MODE=plan` runs on a stock Mac.
#
# Why a ledger of our own: this project never had Supabase's migration history table
# (supabase_migrations.schema_migrations), so `supabase db push` would replay every file from 001.
# The ledger is witus_ops.schema_migrations, one row per applied (or baselined) file.
#
# Every networked run (MODE=migrate or rotate-only) first sets a NEW random Postgres password through
# the Supabase Management API, then connects with it. Nothing stores the password: the next run sets
# another one. The app never reads it (it uses supabase-js with API keys), so a rotation breaks nothing.
#
# Environment:
#   MODE                  migrate (default) | rotate-only | plan (no network; prints what would run)
#   BASELINE_THROUGH      optional migration number N: record unrecorded files numbered <= N as applied
#                         WITHOUT running them. One-time, for files applied by hand before the ledger.
#   SUPABASE_ACCESS_TOKEN Supabase personal access token (not needed for MODE=plan)
#   SUPABASE_PROJECT_REF  project ref (public: it is in the site's JS bundle)
#   POOLER_HOST_FALLBACK  Supavisor host, used if the API does not return one
#   MIGRATIONS_DIR        default supabase/migrations
#   LEDGER_REPO           ledger key, default tour-manager-os (lets two repos share one database)
#   RUN_URL               link stored with each ledger row
#   APPLIED_TSV           MODE=plan only: a "filename<TAB>sha256" file standing in for the ledger
#
# A file that cannot run inside a transaction (CREATE INDEX CONCURRENTLY, VACUUM, its own BEGIN/COMMIT)
# must carry the line `-- witus:no-transaction`. Such a file runs statement by statement and is recorded
# after it succeeds; if it fails part way, fix the database by hand and record it with BASELINE_THROUGH.
# Every other file runs with --single-transaction together with its ledger insert, so it is applied and
# recorded atomically, or not at all.
set -euo pipefail
export LC_ALL=C

MODE="${MODE:-migrate}"
MIGRATIONS_DIR="${MIGRATIONS_DIR:-supabase/migrations}"
LEDGER_REPO="${LEDGER_REPO:-tour-manager-os}"
BASELINE_THROUGH="${BASELINE_THROUGH:-}"
RUN_URL="${RUN_URL:-local}"
SUMMARY="${GITHUB_STEP_SUMMARY:-/dev/stdout}"
RUNBOOK='docs/01-operations.md, "Production migrations"'
API="https://api.supabase.com/v1/projects"
NO_TXN_MARKER='-- witus:no-transaction'

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

say() { printf '%s\n' "$@" >> "$SUMMARY"; } # one line per argument
die() {
  echo "::error::$*"
  if [ "$SUMMARY" != "/dev/stdout" ]; then say "" "**Failed:** $*"; fi
  exit 1
}

case "$MODE" in migrate | rotate-only | plan) ;; *) die "Unknown MODE '$MODE' (use migrate, rotate-only or plan)." ;; esac
[[ "$LEDGER_REPO" =~ ^[a-z0-9-]+$ ]] || die "LEDGER_REPO must be lowercase letters, digits and hyphens."
[[ "$RUN_URL" =~ ^[A-Za-z0-9:/._-]+$ ]] || RUN_URL="unknown"
if [ -n "$BASELINE_THROUGH" ]; then
  [[ "$BASELINE_THROUGH" =~ ^[0-9]{1,3}$ ]] ||
    die "baseline_through must be a migration number such as 97 (got '$BASELINE_THROUGH'). See $RUNBOOK."
  BASELINE_THROUGH=$((10#$BASELINE_THROUGH))
fi

sha_of() {
  if command -v sha256sum > /dev/null 2>&1; then sha256sum "$1" | cut -d' ' -f1; else shasum -a 256 "$1" | cut -d' ' -f1; fi
}
num_of() { echo $((10#${1:0:3})); }

# ---- 1. The files on disk, in filename order (no network) ------------------------------------------
FILES="$WORK/files"
find "$MIGRATIONS_DIR" -maxdepth 1 -type f -name '*.sql' -exec basename {} \; | sort > "$WORK/all"
grep -E '^[0-9]{3}_[A-Za-z0-9_]+\.sql$' "$WORK/all" > "$FILES" || true
if grep -vqE '^[0-9]{3}_[A-Za-z0-9_]+\.sql$' "$WORK/all"; then
  die "These files in $MIGRATIONS_DIR do not match NNN_name.sql and would be skipped: $(grep -vE '^[0-9]{3}_[A-Za-z0-9_]+\.sql$' "$WORK/all" | tr '\n' ' ')"
fi
[ -s "$FILES" ] || die "No NNN_name.sql files found in $MIGRATIONS_DIR."
DUPES="$(cut -c1-3 "$FILES" | uniq -d | tr '\n' ' ')"
[ -z "$DUPES" ] || echo "::warning::Two or more files share a number: $DUPES. They run in filename order; baseline_through counts by number."
HIGHEST="$(num_of "$(tail -n 1 "$FILES")")"
if [ -n "$BASELINE_THROUGH" ] && [ "$BASELINE_THROUGH" -gt "$HIGHEST" ]; then
  die "baseline_through=$BASELINE_THROUGH is above the highest file number ($HIGHEST)."
fi

# ---- 2. Rotate the password and connect -----------------------------------------------------------
HDR="$WORK/auth-header"
api_headers() {
  [ -n "${SUPABASE_ACCESS_TOKEN:-}" ] || die "Set the repository secret SUPABASE_ACCESS_TOKEN (see $RUNBOOK)."
  [[ "${SUPABASE_PROJECT_REF:-}" =~ ^[a-z]{20}$ ]] || die "SUPABASE_PROJECT_REF must be the 20-letter project ref."
  # Header in a file, so the token never appears in a process list.
  printf 'Authorization: Bearer %s\n' "$SUPABASE_ACCESS_TOKEN" > "$HDR"
}

rotate_password() {
  NEW_PW="$(openssl rand -hex 32)"
  # Mask before anything else can print it.
  echo "::add-mask::$NEW_PW"
  local code
  # printf is a shell builtin, so the password is not in any process's arguments either.
  code="$(printf '{"password":"%s"}' "$NEW_PW" | curl -sS -o "$WORK/patch.json" -w '%{http_code}' -X PATCH \
    -H @"$HDR" -H 'Content-Type: application/json' --data-binary @- \
    "$API/$SUPABASE_PROJECT_REF/database/password")" || die "Could not reach the Supabase Management API."
  case "$code" in
    2??) echo "Password rotated (HTTP $code)." ;;
    401 | 403) die "Supabase refused SUPABASE_ACCESS_TOKEN (HTTP $code): expired, revoked, or not on this project's account. See $RUNBOOK." ;;
    *) die "Password change failed (HTTP $code): $(jq -r '.message // .error // empty' "$WORK/patch.json" 2> /dev/null | head -c 300)" ;;
  esac
}

resolve_host() {
  # The pooler host is read from the API (authoritative); the fallback was copied from the
  # Session pooler string in Supabase's Connect panel (2026-10-30). Not a secret.
  HOST_SOURCE="Supabase API (config/database/pooler)"
  PGHOST="$(curl -sS -f -H @"$HDR" "$API/$SUPABASE_PROJECT_REF/config/database/pooler" 2> /dev/null |
    jq -r '[.[] | select(.database_type == "PRIMARY")][0].db_host // empty' 2> /dev/null || true)"
  if [ -z "$PGHOST" ]; then
    PGHOST="${POOLER_HOST_FALLBACK:-}"
    HOST_SOURCE="fallback POOLER_HOST_FALLBACK (the API returned no pooler host)"
    echo "::warning::Using the fallback pooler host; the API did not return one."
  fi
  [ -n "$PGHOST" ] || die "No pooler host: set POOLER_HOST_FALLBACK in the workflow."
  if [ -n "${POOLER_HOST_FALLBACK:-}" ] && [ "$PGHOST" != "$POOLER_HOST_FALLBACK" ]; then
    echo "::notice::The API's pooler host ($PGHOST) differs from POOLER_HOST_FALLBACK; update the workflow's fallback."
  fi
}

connect() {
  # Session pooler (Supavisor, port 5432): GitHub runners have no IPv6, and db.<ref>.supabase.co is IPv6-only.
  export PGHOST
  export PGPORT=5432 PGUSER="postgres.$SUPABASE_PROJECT_REF" PGPASSWORD="$NEW_PW" PGDATABASE=postgres
  export PGSSLMODE=require PGCONNECT_TIMEOUT=10 PGAPPNAME=witus-migrate-production
  local deadline=$((SECONDS + 150)) err
  until err="$(psql -X -tAc 'select 1' 2>&1 > /dev/null)"; do
    [ "$SECONDS" -lt "$deadline" ] || die "The pooler did not accept the new password within 150 s. Last error: $err"
    echo "Waiting for the pooler to accept the new password: $err"
    sleep 10
  done
  echo "Connected to $PGHOST as $PGUSER."
}

q() { psql -X -v ON_ERROR_STOP=1 -tA "$@"; }

LEDGER="$WORK/ledger.tsv"
if [ "$MODE" = "plan" ]; then
  if [ -n "${APPLIED_TSV:-}" ]; then cp "$APPLIED_TSV" "$LEDGER"; else : > "$LEDGER"; fi
  HOST_SOURCE="(plan mode: no connection)"
else
  api_headers
  rotate_password
  resolve_host
  connect
fi

{
  echo "### Production migrations ($MODE)"
  echo
  echo "- Password: $([ "$MODE" = "plan" ] && echo "not rotated (plan mode)" || echo "rotated at $(date -u '+%Y-%m-%d %H:%M UTC'); nothing stores it")"
  echo "- Pooler host from: $HOST_SOURCE"
  echo "- Files on disk: $(wc -l < "$FILES" | tr -d ' ') (highest $HIGHEST)"
} >> "$SUMMARY"

# ---- 3. The ledger -----------------------------------------------------------------------------
read_ledger() {
  q -F $'\t' -c "select filename, sha256 from witus_ops.schema_migrations where repo = '$LEDGER_REPO' order by filename" > "$LEDGER"
}

if [ "$MODE" = "migrate" ]; then
  q -q <<'SQL'
create schema if not exists witus_ops;
revoke all on schema witus_ops from public;
create table if not exists witus_ops.schema_migrations (
  repo       text not null,
  filename   text not null,
  sha256     text not null,
  method     text not null default 'applied' check (method in ('applied', 'baseline')),
  applied_at timestamptz not null default now(),
  run_url    text,
  primary key (repo, filename)
);
comment on table witus_ops.schema_migrations is
  'Migration ledger written by .github/workflows/migrate-production.yml (docs/01-operations.md).';
alter table witus_ops.schema_migrations enable row level security;
SQL
  read_ledger
elif [ "$MODE" = "rotate-only" ]; then
  if [ "$(q -c "select to_regclass('witus_ops.schema_migrations') is not null")" = "t" ]; then
    read_ledger
  else
    say "- Ledger: witus_ops.schema_migrations does not exist yet. Run mode=migrate with baseline_through once (see $RUNBOOK)."
    exit 0
  fi
fi

applied_sha() { awk -F'\t' -v f="$1" '$1 == f { print $2; exit }' "$LEDGER"; }

# One-time baseline: record files numbered <= N that the ledger does not have, without running them.
if [ -n "$BASELINE_THROUGH" ]; then
  [ "$MODE" != "rotate-only" ] || die "baseline_through needs mode=migrate."
  BASELINED=""
  while IFS= read -r f; do
    [ "$(num_of "$f")" -le "$BASELINE_THROUGH" ] || continue
    [ -z "$(applied_sha "$f")" ] || continue
    sha="$(sha_of "$MIGRATIONS_DIR/$f")"
    if [ "$MODE" = "migrate" ]; then
      q -q -c "insert into witus_ops.schema_migrations (repo, filename, sha256, method, run_url)
               values ('$LEDGER_REPO', '$f', '$sha', 'baseline', '$RUN_URL') on conflict do nothing"
    fi
    printf '%s\t%s\n' "$f" "$sha" >> "$LEDGER"
    BASELINED="$BASELINED $f"
  done < "$FILES"
  if [ -n "$BASELINED" ]; then
    say "" "**Baselined through $BASELINE_THROUGH (recorded as applied, not run):** $(echo "$BASELINED" | wc -w | tr -d ' ') files, $(echo "$BASELINED" | awk '{print $1 " to " $NF}')."
  else
    say "" "baseline_through=$BASELINE_THROUGH: every file up to it was already in the ledger; nothing recorded."
  fi
fi

if [ "$MODE" = "migrate" ] || [ "$MODE" = "plan" ]; then
  [ -s "$LEDGER" ] || die "The ledger is empty, so every file from 001 would run again. Run the workflow once with baseline_through set to the last file already in production. See $RUNBOOK."
fi

# ---- 4. Compare disk with the ledger ------------------------------------------------------------
PENDING="$WORK/pending"
: > "$PENDING"
DRIFT=""
while IFS= read -r f; do
  have="$(applied_sha "$f")"
  if [ -z "$have" ]; then
    echo "$f" >> "$PENDING"
  elif [ "$have" != "$(sha_of "$MIGRATIONS_DIR/$f")" ]; then
    echo "::warning file=$MIGRATIONS_DIR/$f::Changed after it was applied. The change was NOT run; put new SQL in a new numbered file."
    DRIFT="$DRIFT $f"
  fi
done < "$FILES"
GONE="$(cut -f1 "$LEDGER" | while IFS= read -r f; do [ -f "$MIGRATIONS_DIR/$f" ] || printf '%s ' "$f"; done)"
[ -z "$DRIFT" ] || say "- **Changed since applied (warning, not run):**$DRIFT"
[ -z "$GONE" ] || say "- In the ledger but no longer on disk: $GONE"

if [ "$MODE" = "rotate-only" ]; then
  if [ -s "$PENDING" ]; then
    say "- Pending (not applied in rotate-only mode): $(tr '\n' ' ' < "$PENDING")"
  else
    say "- Pending: none"
  fi
  exit 0
fi

if [ ! -s "$PENDING" ]; then
  say "" "Nothing to apply: every file is in the ledger."
  exit 0
fi

# ---- 5. Preflight the pending files, before running any of them ---------------------------------
NOTXN_RE='\bconcurrently\b|^[[:space:]]*vacuum\b|create[[:space:]]+database|alter[[:space:]]+system|^[[:space:]]*(begin|commit|rollback|start[[:space:]]+transaction)[[:space:]]*;'
while IFS= read -r f; do
  if ! grep -qF -- "$NO_TXN_MARKER" "$MIGRATIONS_DIR/$f" &&
    sed 's/--.*$//' "$MIGRATIONS_DIR/$f" | grep -Eiq "$NOTXN_RE"; then
    die "$f has a statement that cannot run inside a transaction (CONCURRENTLY, VACUUM, CREATE DATABASE, ALTER SYSTEM, or its own BEGIN/COMMIT). Add the line '$NO_TXN_MARKER' to it so it runs outside one, or rewrite it. Nothing was applied. See $RUNBOOK."
  fi
done < "$PENDING"

# ---- 6. Apply ------------------------------------------------------------------------------------
say "" "| File | How | Result |" "|---|---|---|"
while IFS= read -r f; do
  sha="$(sha_of "$MIGRATIONS_DIR/$f")"
  record="insert into witus_ops.schema_migrations (repo, filename, sha256, method, run_url)
          values ('$LEDGER_REPO', '$f', '$sha', 'applied', '$RUN_URL')"
  if grep -qF -- "$NO_TXN_MARKER" "$MIGRATIONS_DIR/$f"; then
    how="no transaction (marker)"
    run=(psql -X -v ON_ERROR_STOP=1 -f "$MIGRATIONS_DIR/$f")
  else
    how="single transaction"
    run=(psql -X -v ON_ERROR_STOP=1 --single-transaction -f "$MIGRATIONS_DIR/$f" -c "$record")
  fi
  if [ "$MODE" = "plan" ]; then
    echo "would apply: $f ($how)"
    say "| $f | $how | would apply (plan) |"
    continue
  fi
  echo "::group::$f ($how)"
  if ! "${run[@]}"; then
    echo "::endgroup::"
    say "| $f | $how | **failed** |"
    die "$f failed. $([ "$how" = "single transaction" ] && echo "It was rolled back and not recorded." || echo "It ran outside a transaction, so part of it may be applied: check the database, finish it by hand, then record it with baseline_through=$(num_of "$f").") Later files were not run. See $RUNBOOK."
  fi
  [ "$how" = "single transaction" ] || q -q -c "$record"
  echo "::endgroup::"
  say "| $f | $how | applied |"
done < "$PENDING"

say "" "$([ "$MODE" = "plan" ] && echo "Would apply" || echo "Applied") $(wc -l < "$PENDING" | tr -d ' ') file(s)."
