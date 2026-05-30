-- ============================================================
-- HELP ARTICLE: how to use the conversational help agent
-- Per the docs-update-after-task rule: when a user-facing flow ships,
-- add or revise an in-app help article so users have instructions.
-- ============================================================

insert into help_articles (
  id, title, slug, content, category, sort_order, published
) values (
  '80000000-0000-0000-0000-000000000001',
  'Using the help agent',
  'help-agent',
  '# Using the help agent

The help agent is an AI-powered assistant that answers your questions about Tour Manager OS using the published help articles as context. It''s grounded — it will only answer using what''s in the help center, and it cites which articles it used.

## How to ask

1. Open the **Help** page (in the nav, or at `/help`).
2. Click **Ask the help agent** under the search bar.
3. Type your question. Try things like:
   - "How do I create an advance sheet?"
   - "How does the door scanner work?"
   - "What happens when a ticket is refunded?"
4. The agent will stream its answer. At the bottom you''ll see a `Sources:` line listing the article slugs it pulled from — click those for the full article.

## What it can and can''t do

It **can**:

- Answer factual questions about features
- Walk you through flows step-by-step
- Cite which article it''s drawing from
- Say "I don''t know" when the context doesn''t cover your question

It **can''t**:

- See your data (your tours, finances, tickets — those are off-limits to keep your account private)
- Take actions on your behalf
- Answer questions outside the help center

## If the agent doesn''t help

Send feedback via the in-app feedback tool. Your question becomes a request the team can triage — and if it''s a common one, we''ll add a help article so the agent learns the answer next time.

## How it works under the hood

When you ask a question, the system:

1. Converts your question into a vector (an embedding) via Mistral''s embedding model
2. Finds the most semantically similar published help articles using pgvector cosine similarity
3. Sends those articles + your question to Cerebras Llama 3.3 70B for a streamed answer
4. Routes the call through the Vercel AI Gateway, with LangSmith capturing the prompt, model, latency, and output for evaluation

Everything goes through `lib/ai/gateway.ts` and `lib/ai/chat.ts` — see the Academy lesson "Codebase Tour" for the full directory map.',
  'features',
  100,
  true
)
on conflict (id) do update set
  title = excluded.title,
  content = excluded.content,
  sort_order = excluded.sort_order,
  published = excluded.published,
  updated_at = now();
