-- ============================================================
-- HELP ARTICLE: Managing AI from the admin dashboard
-- Per the docs-update-after-task rule: new user-facing flow needs
-- an instruction page.
-- ============================================================

insert into help_articles (
  id, title, slug, content, category, sort_order, published
) values (
  '80000000-0000-0000-0000-000000000002',
  'Managing AI from the admin dashboard',
  'admin-ai-management',
  '# Managing AI from the admin dashboard

The `/admin/ai` page lets a super-admin manage the AI stack without redeploying. It''s a single page covering four areas.

## 1. Model configuration

Each AI call site (`chat_model`, `embedding_model`, `vision_model`) shows three values:

- **resolved** — what the code is using right now
- **env** — what the environment variable says
- **default** — the hardcoded fallback in code

Precedence: **DB override → env var → default**. Set an override from the dropdown (preset) or the text field (custom `provider/model` string), then click **Save override**. Reads cache for 30 seconds per-instance, so changes propagate within half a minute.

Click **Clear override** to fall back to env / default.

## 2. Provider keys

A simple presence list — green check if the env var is set, gray otherwise. Values are never displayed. Includes:

- `OPENROUTER_API_KEY` / `CEREBRAS_API_KEY` / `TOGETHER_API_KEY` / `MISTRAL_API_KEY` — direct provider keys
- `AI_GATEWAY_API_KEY` — Vercel AI Gateway (optional when deployed on Vercel)
- `LANGSMITH_API_KEY` — required for tracing to actually reach LangSmith

The LangSmith row also shows the configured project and whether `LANGSMITH_TRACING` is enabled.

## 3. Embeddings + backfill

Four counters: total published articles, embedded, unembedded, and stale (embedding was made with a model different from the current `embedding_model`).

Click **Backfill missing / stale** to re-embed everything not on the current model. Idempotent — safe to click again.

## 4. Provider health checks

Click **Run checks** to ping each provider with a small probe (one embedding or eight-token completion). Costs a few tokens per provider. Shows latency + ok/fail per provider so you can spot a flaky key or routing issue.

## 5. Recent agent activity

The bottom section lists the last 20 questions asked through the help agent with:

- the model used for that call
- response time + total tokens
- top-similarity score from retrieval (so you can see how well the embedding matched)
- the article ids that grounded the answer
- the error message if the call failed

Each row writes to the `ai_chat_logs` table. Users see their own rows (under a future "history" feature); super-admins see everyone''s here.

## When to use this

- A new provider is misbehaving → run health checks, swap the model
- After changing `AI_EMBEDDING_MODEL` → check stale count, click backfill
- Users report odd answers → check recent activity, look at the retrieved article ids and top similarity to diagnose grounding
- Cost spike → tokens column shows which model + which question burned the budget

## Limits

Only the user listed as super-admin can open this page (currently `bam@awews.com`). Other admins hit a redirect.',
  'features',
  101,
  true
)
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();
