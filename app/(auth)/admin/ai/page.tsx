import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, AlertTriangle, Bot, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { getAdminAiOverview } from '@/lib/admin/ai'
import { AiControls } from './ai-controls'

export const metadata: Metadata = {
  title: 'AI Management',
  robots: { index: false },
}

const KEY_LABELS: Record<string, string> = {
  chat_model: 'Conversational agent',
  embedding_model: 'Embeddings',
  vision_model: 'Vision (receipt OCR — not yet wired)',
}

const SOURCE_TONE: Record<string, string> = {
  db: 'bg-primary-500/10 text-primary-700 dark:text-primary-300',
  env: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
  default: 'bg-surface-alt text-text-muted',
}

export default async function AdminAiPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !isSuperAdmin(user.email)) {
    redirect('/')
  }

  const overview = await getAdminAiOverview()

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex items-center gap-2 text-sm uppercase tracking-wide text-text-muted">
        <Bot className="size-4" aria-hidden /> AI Management
      </div>
      <h1 className="text-2xl font-bold sm:text-3xl">AI</h1>
      <p className="mt-2 text-sm text-text-muted">
        Switch models, watch usage, and probe provider health. Changes write to
        the <code className="font-mono text-xs">ai_config</code> table and take
        effect within 30 seconds (per-instance cache).
      </p>

      <AiControls
        initial={overview.config}
        embeddings={overview.embeddings}
        providerKeys={overview.providerKeys}
        langsmith={overview.langsmith}
        keyLabels={KEY_LABELS}
        sourceTone={SOURCE_TONE}
      />

      <section
        aria-label="Recent agent activity"
        className="mt-8 rounded-2xl border border-border-default bg-surface-raised"
      >
        <header className="flex items-center justify-between border-b border-border-default px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-text-muted">
            <Activity className="size-4" aria-hidden /> Recent agent activity
          </h2>
          <span className="text-xs text-text-muted">last 20</span>
        </header>
        {overview.recent.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-text-muted">
            No agent queries yet.
          </div>
        ) : (
          <ol className="divide-y divide-border-default">
            {overview.recent.map((row) => {
              const total = row.total_tokens ?? 0
              return (
                <li key={row.id} className="px-4 py-3 text-sm">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <p className="flex-1 min-w-0 truncate font-medium">
                      {row.error ? (
                        <AlertTriangle
                          className="mr-1 inline size-3 text-red-500"
                          aria-hidden
                        />
                      ) : null}
                      {row.question}
                    </p>
                    <time
                      dateTime={row.created_at}
                      className="text-xs text-text-muted"
                    >
                      {new Date(row.created_at).toLocaleString(undefined, {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </time>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted">
                    <span className="font-mono">{row.model || '—'}</span>
                    {row.response_time_ms != null && (
                      <span>{row.response_time_ms} ms</span>
                    )}
                    {total > 0 && <span>{total} tokens</span>}
                    {row.top_similarity != null && (
                      <span>top sim {row.top_similarity.toFixed(3)}</span>
                    )}
                    {row.retrieved_article_ids?.length ? (
                      <span>{row.retrieved_article_ids.length} articles</span>
                    ) : (
                      <span>no articles</span>
                    )}
                  </div>
                  {row.error && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                      {row.error}
                    </p>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <p className="mt-6 text-xs text-text-muted">
        <Sparkles className="mr-1 inline size-3" aria-hidden />
        Tokens and per-call traces are also captured in LangSmith if
        <code className="ml-1 font-mono text-xs">LANGSMITH_TRACING=true</code>{' '}
        and an API key is set.{' '}
        <Link
          href="/admin"
          className="underline hover:text-text-secondary"
        >
          Back to admin
        </Link>
      </p>
    </main>
  )
}
