# Operations runbook

How Tour Manager OS (tour.witus.online) is run after a deploy. Sections are added as steps are automated.

## Production migrations

Production is Supabase project `rwssychlnwynokqswidl` (its own project, not the one CentenarianOS and
Work.WitUS share). Schema changes are numbered files in `supabase/migrations/NNN_name.sql`.

**Never run `supabase db push` (or `npm run db:push`, which now refuses).** This project never had
Supabase's migration history table, so `db push` would replay every file from `001`. Many older files are
not idempotent (they create policies and seed rows), so a replay fails part way or duplicates data.

### What the workflow does

`.github/workflows/migrate-production.yml` runs `scripts/migrate-production.sh`:

- **When:** on a push to `main` that changes `supabase/migrations/**`; on demand from the Actions tab
  ("Migrate production database" -> Run workflow); and on the 1st of each month in `rotate-only` mode.
- **Password:** every run generates a new random Postgres password, masks it in the log, and sets it with
  the Supabase Management API (`PATCH /v1/projects/{ref}/database/password`). It then connects with that
  password through the Session pooler (Supavisor, port 5432, user `postgres.rwssychlnwynokqswidl`),
  retrying for up to 150 seconds while the pooler picks the new password up. Nothing stores the password;
  the next run sets another. GitHub runners have no IPv6, so the job never uses `db.<ref>.supabase.co`.
- **Ledger:** `witus_ops.schema_migrations` (created on the first `migrate` run) has one row per file:
  `repo`, `filename`, `sha256`, `method` (`applied` or `baseline`), `applied_at`, `run_url`. The `repo`
  column lets the same runner serve a database two repos share. `anon` and `authenticated` get no
  privileges on the `witus_ops` schema (this project has no global default privileges; checked
  2026-10-30), the Data API serves only the schemas listed in the dashboard's API settings, and the table
  has row-level security on with no policies.
- **Apply:** pending files (on disk, not in the ledger) run in filename order. Each runs with
  `psql -v ON_ERROR_STOP=1 --single-transaction` together with its ledger insert, so a file is applied and
  recorded together or not at all. The first failure stops the job; later files do not run.
- **Checks:** a file whose content changed after it was applied gets a warning (the change is not run).
  A pending file that cannot run inside a transaction stops the job before anything is applied (see below).
- **Summary:** the run page shows the mode, where the pooler host came from, what was baselined, what was
  applied, and any warnings.
- **Safe to run twice:** a second run finds nothing pending and applies nothing (it still rotates the
  password).

`rotate-only` sets the new password, proves it connects, and lists pending files without applying them.

### One-time setup

1. Create a Supabase personal access token and store it as the repository secret `SUPABASE_ACCESS_TOKEN`
   (operator task `plans/user-tasks/53`):

   ```bash
   # Copy the token from Supabase (Account -> Access Tokens), then:
   pbpaste | gh secret set SUPABASE_ACCESS_TOKEN --repo dapperAuteur/tour-manager-os
   pbcopy < /dev/null   # clear the clipboard
   ```

   A personal access token can manage **every project in the Supabase account**, not only this one.
   Revoke it (Supabase -> Account -> Access Tokens) if this repository or its Actions are ever compromised,
   then create a new one.
2. Run the workflow once with **`baseline_through` = `97`**. That records files `001` to `097` as applied
   without running them, then applies anything newer. `97` was chosen by read-only queries on 2026-10-30:
   the tables, columns, functions, policies and help-article rows of every file from `001` to `097` exist in
   production, including `public.witus_identities` (096) and the `sign-in-with-witus` help article (097).
   (There is no `026`; it was removed from the repo long ago.) If a file newer than `097` reaches `main`
   before this run, check whether it was applied by hand before choosing the number.

Until the baseline exists, a `migrate` run stops with "The ledger is empty" instead of replaying `001`.

### Adding a migration

- Add the next number: `supabase/migrations/098_short_name.sql`. Never edit a file that has already run;
  put the change in a new file.
- Keep it additive (new tables, nullable columns, `if not exists`) so the code Vercel is deploying in
  parallel and the code it replaces both work while the job runs.
- Merge to `main`; the workflow applies it. Check the run's summary.
- A file that cannot run inside a transaction (`CREATE INDEX CONCURRENTLY`, `VACUUM`, `CREATE DATABASE`,
  `ALTER SYSTEM`, or its own `BEGIN`/`COMMIT`) must contain the line `-- witus:no-transaction`. It then runs
  statement by statement and is recorded after it succeeds. Without the marker the job stops before
  applying anything. If a marked file fails part way, finish it by hand and record it (below). The check
  reads the SQL with `--` comments removed, so a word like "concurrently" inside a seeded article's text
  can trip it; add the marker or reword.

### Manual fallback (the workflow is broken)

The password changes on every workflow run, so any saved connection string is probably stale. Get a fresh
one first: Supabase dashboard -> project -> **Connect** -> **Session pooler** (it shows the string; reset
the password from Project Settings -> Database if you need a known one).

**A. SQL editor (no laptop setup).** Paste the file into the Supabase SQL editor and run it, then record it:

```sql
insert into witus_ops.schema_migrations (repo, filename, sha256, method, run_url)
values ('tour-manager-os', '098_short_name.sql', '<sha256 of the file>', 'applied', 'manual');
```

Get the hash with `shasum -a 256 supabase/migrations/098_short_name.sql`. Or skip the insert and, once the
workflow works again, run it with `baseline_through` = that file's number.

**B. psql from the laptop.**

```bash
cd /path/to/tour-manager-os
# Paste the Session pooler string (with the password filled in) into .env.local as POSTGRES_URL_NON_POOLING.
export DB_URL="$(grep '^POSTGRES_URL_NON_POOLING=' .env.local | cut -d= -f2- | sed 's/^"//;s/"$//')"
psql "$DB_URL" -X -v ON_ERROR_STOP=1 --single-transaction \
  -f supabase/migrations/098_short_name.sql \
  -c "insert into witus_ops.schema_migrations (repo, filename, sha256, method, run_url) values ('tour-manager-os', '098_short_name.sql', '$(shasum -a 256 supabase/migrations/098_short_name.sql | cut -d' ' -f1)', 'applied', 'manual')"
unset DB_URL
```

**C. The workflow's script from the laptop** (rotates the password, like the workflow):

```bash
SUPABASE_ACCESS_TOKEN="$(pbpaste)" SUPABASE_PROJECT_REF=rwssychlnwynokqswidl \
  POOLER_HOST_FALLBACK=aws-1-us-east-1.pooler.supabase.com bash scripts/migrate-production.sh
pbcopy < /dev/null
```

**Preview without a database:** `MODE=plan BASELINE_THROUGH=97 bash scripts/migrate-production.sh` lists
the files and what would run. `APPLIED_TSV=<file of "filename<TAB>sha256" lines>` stands in for the ledger.

### Reading production without writing

Through the pooler, `PGOPTIONS='-c default_transaction_read_only=on'` does **not** reach the server
(Supavisor drops startup options; checked 2026-10-30: `show default_transaction_read_only` returned `off`).
Wrap read-only checks in a read-only transaction instead:

```sql
begin transaction read only;
select filename, method, applied_at from witus_ops.schema_migrations order by filename desc limit 10;
rollback;
```

### What goes stale after a rotation (and why that is fine)

- **`.env.local`'s `POSTGRES_*` values** on any laptop. Only manual psql uses them; refresh from the
  dashboard when needed.
- **The Supabase-Vercel integration's `POSTGRES_*` variables** on the Vercel project. The app never reads
  them (it uses `@supabase/supabase-js` with the project URL and API keys; no source file reads a
  `POSTGRES_` variable, they appear only in `.env.example`), so a stale value breaks nothing. Do not start reading them in code; use the API keys.
- The API keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are not affected.

### Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Set the repository secret SUPABASE_ACCESS_TOKEN` | Secret missing: One-time setup, step 1. |
| `Supabase refused SUPABASE_ACCESS_TOKEN (HTTP 401/403)` | Token expired or revoked. Create a new one and set the secret again. |
| `The pooler did not accept the new password within 150 s` | Supavisor slow to pick it up, or a Supabase incident. Re-run; check status.supabase.com. |
| `The ledger is empty` | Baseline never ran. One-time setup, step 2. |
| `<file> failed ... rolled back` | Fix the SQL in that unapplied file (it never ran), merge, and the next run applies it. |
| `Changed after it was applied` warning | Someone edited an applied file. Revert the edit and put the change in a new file. |
| Monthly run stopped appearing | GitHub disables schedules in a public repo after 60 days without commits. Re-enable on the Actions tab. |

The witus.online admin will list this workflow with a Run button (post-deploy rule); until then, use the
Actions tab.
