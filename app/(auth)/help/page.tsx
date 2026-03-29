import type { Metadata } from 'next'
import Link from 'next/link'
import { HelpCircle, Search, BookOpen, MessageSquare } from 'lucide-react'
import { getHelpArticles } from '@/lib/help/queries'
import { HelpSearch } from './help-search'

export const metadata: Metadata = { title: 'Help', robots: { index: false } }

const categoryIcons: Record<string, string> = {
  'getting-started': '🚀',
  'features': '⚙️',
  'general': '📖',
}

export default async function HelpPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const articles = await getHelpArticles(q)

  // Group by category
  const grouped: Record<string, typeof articles> = {}
  for (const article of articles) {
    if (!grouped[article.category]) grouped[article.category] = []
    grouped[article.category].push(article)
  }

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <HelpCircle className="mx-auto mb-3 h-10 w-10 text-primary-600 dark:text-primary-400" aria-hidden="true" />
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="mt-1 text-sm text-text-secondary">Find answers, guides, and tutorials.</p>
      </div>

      <HelpSearch initialQuery={q} />

      {articles.length === 0 ? (
        <div className="mt-8 rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <Search className="mx-auto mb-3 h-10 w-10 text-text-muted" aria-hidden="true" />
          <p className="text-sm text-text-secondary">
            {q ? `No articles found for "${q}". Try a different search.` : 'No help articles available yet.'}
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          {Object.entries(grouped).map(([category, categoryArticles]) => (
            <section key={category}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold capitalize">
                <span>{categoryIcons[category] || '📄'}</span>
                {category.replace('-', ' ')}
              </h2>
              <div className="space-y-3">
                {categoryArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/help/${article.slug}`}
                    className="flex items-center justify-between rounded-xl border border-border-default bg-surface-raised p-4 transition-all hover:border-primary-500/50 hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-text-muted" aria-hidden="true" />
                      <div>
                        <h3 className="font-medium">{article.title}</h3>
                        {article.tags && article.tags.length > 0 && (
                          <div className="mt-1 flex gap-1">
                            {article.tags.slice(0, 3).map((tag: string) => (
                              <span key={tag} className="rounded bg-surface-alt px-1.5 py-0.5 text-xs text-text-muted">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-xl border border-border-default bg-surface-raised p-6 text-center">
        <MessageSquare className="mx-auto mb-3 h-8 w-8 text-text-muted" aria-hidden="true" />
        <p className="mb-3 text-sm text-text-secondary">Can&apos;t find what you need?</p>
        <Link
          href="/feedback/new"
          className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          Send Feedback
        </Link>
      </div>
    </main>
  )
}
