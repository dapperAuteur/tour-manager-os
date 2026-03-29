import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getHelpArticleBySlug } from '@/lib/help/queries'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  try {
    const article = await getHelpArticleBySlug(slug)
    return { title: article.title, robots: { index: false } }
  } catch {
    return { title: 'Article Not Found' }
  }
}

export default async function HelpArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  let article
  try {
    article = await getHelpArticleBySlug(slug)
  } catch {
    notFound()
  }

  // Simple markdown-like rendering for ## headings and paragraphs
  const sections = article.content.split('\n\n').map((block: string, i: number) => {
    if (block.startsWith('## ')) {
      return <h2 key={i} className="mb-3 mt-6 text-lg font-semibold">{block.replace('## ', '')}</h2>
    }
    if (block.startsWith('- ')) {
      const items = block.split('\n').filter((l) => l.startsWith('- '))
      return (
        <ul key={i} className="mb-4 list-disc space-y-1 pl-6 text-sm text-text-secondary">
          {items.map((item, j) => <li key={j}>{item.replace('- ', '')}</li>)}
        </ul>
      )
    }
    return <p key={i} className="mb-4 text-sm text-text-secondary">{block}</p>
  })

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link href="/help" className="mb-6 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary">
        <ArrowLeft className="h-3 w-3" aria-hidden="true" /> Help Center
      </Link>

      <article className="rounded-xl border border-border-default bg-surface-raised p-8">
        <h1 className="mb-2 text-2xl font-bold">{article.title}</h1>
        <div className="mb-6 flex items-center gap-2">
          <span className="rounded bg-surface-alt px-2 py-0.5 text-xs capitalize text-text-muted">{article.category.replace('-', ' ')}</span>
          {article.module_id && (
            <span className="rounded bg-primary-500/10 px-2 py-0.5 text-xs text-primary-600 dark:text-primary-400">{article.module_id}</span>
          )}
        </div>
        <div className="prose-sm">{sections}</div>
      </article>
    </main>
  )
}
