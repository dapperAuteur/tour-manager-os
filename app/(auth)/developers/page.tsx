import type { Metadata } from 'next'
import Link from 'next/link'
import { Code2, Key, Webhook } from 'lucide-react'

export const metadata: Metadata = { title: 'API Documentation', robots: { index: false } }

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/tours',
    description: 'List all tours for your organization.',
    scope: 'read',
    params: 'None',
    response: '{ data: Tour[], count: number }',
  },
  {
    method: 'GET',
    path: '/api/v1/shows',
    description: 'List all shows. Optionally filter by tour.',
    scope: 'read',
    params: 'tour_id (optional)',
    response: '{ data: Show[], count: number }',
  },
  {
    method: 'GET',
    path: '/api/v1/itineraries',
    description: 'Get itinerary days with schedule items and flights.',
    scope: 'read',
    params: 'tour_id (required)',
    response: '{ data: ItineraryDay[], count: number }',
  },
]

export default function DevelopersPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Code2 className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          API Documentation
        </h1>
        <p className="mt-1 text-sm text-text-secondary">Integrate Tour Manager OS with your tools and workflows.</p>
      </div>

      {/* Getting started */}
      <section className="mb-10" aria-labelledby="getting-started">
        <h2 id="getting-started" className="mb-4 text-lg font-semibold">Getting Started</h2>
        <div className="rounded-xl border border-border-default bg-surface-raised p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Key className="mt-0.5 h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold">1. Get an API Key</h3>
              <p className="text-sm text-text-secondary">
                Go to <Link href="/admin/api-keys" className="text-primary-600 hover:underline dark:text-primary-400">Admin → API Keys</Link> and create a key.
                API access includes a free tier for testing.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Code2 className="mt-0.5 h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold">2. Make Requests</h3>
              <p className="text-sm text-text-secondary">Include your key in the Authorization header:</p>
              <code className="mt-2 block rounded-lg bg-surface-alt p-3 text-xs font-mono">
                curl -H &quot;Authorization: Bearer tm_live_your_key_here&quot; \<br />
                &nbsp;&nbsp;https://tour.witus.online/api/v1/tours
              </code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Webhook className="mt-0.5 h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
            <div>
              <h3 className="text-sm font-semibold">3. Set Up Webhooks (Optional)</h3>
              <p className="text-sm text-text-secondary">
                Receive real-time notifications when events happen (shows created, advance sheets completed, etc).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auth */}
      <section className="mb-10" aria-labelledby="authentication">
        <h2 id="authentication" className="mb-4 text-lg font-semibold">Authentication</h2>
        <div className="rounded-xl border border-border-default bg-surface-raised p-6">
          <p className="mb-3 text-sm text-text-secondary">All API requests require a Bearer token in the Authorization header:</p>
          <code className="block rounded-lg bg-surface-alt p-3 text-xs font-mono">Authorization: Bearer tm_live_xxxxxxxxxxxxxxxx</code>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>Rate Limit:</strong> 1,000 requests per hour (configurable per key).</p>
            <p><strong>Free Tier:</strong> Available for testing. Full access requires a paid subscription.</p>
            <p><strong>Scopes:</strong> <code className="rounded bg-surface-alt px-1.5 py-0.5 text-xs">read</code> <code className="rounded bg-surface-alt px-1.5 py-0.5 text-xs">write</code> <code className="rounded bg-surface-alt px-1.5 py-0.5 text-xs">finances</code></p>
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="mb-10" aria-labelledby="endpoints">
        <h2 id="endpoints" className="mb-4 text-lg font-semibold">Endpoints</h2>
        <div className="space-y-4">
          {endpoints.map((ep) => (
            <div key={ep.path} className="rounded-xl border border-border-default bg-surface-raised p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded bg-success-500/20 px-2 py-0.5 text-xs font-bold text-success-600 dark:text-success-500">{ep.method}</span>
                <code className="text-sm font-mono font-semibold">{ep.path}</code>
              </div>
              <p className="mb-3 text-sm text-text-secondary">{ep.description}</p>
              <div className="grid gap-2 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-text-muted">Scope:</span>{' '}
                  <code className="rounded bg-surface-alt px-1.5 py-0.5">{ep.scope}</code>
                </div>
                <div>
                  <span className="text-text-muted">Params:</span> {ep.params}
                </div>
                <div>
                  <span className="text-text-muted">Response:</span>{' '}
                  <code className="rounded bg-surface-alt px-1.5 py-0.5">{ep.response}</code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Errors */}
      <section aria-labelledby="errors">
        <h2 id="errors" className="mb-4 text-lg font-semibold">Error Codes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default text-left text-xs text-text-muted">
                <th className="pb-2 pr-4" scope="col">Code</th>
                <th className="pb-2 pr-4" scope="col">Meaning</th>
                <th className="pb-2" scope="col">Fix</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border-default">
                <td className="py-2 pr-4 font-mono">401</td>
                <td className="py-2 pr-4">Invalid or missing API key</td>
                <td className="py-2 text-text-muted">Check your Authorization header</td>
              </tr>
              <tr className="border-b border-border-default">
                <td className="py-2 pr-4 font-mono">403</td>
                <td className="py-2 pr-4">Insufficient scope</td>
                <td className="py-2 text-text-muted">Create a key with the required scope</td>
              </tr>
              <tr className="border-b border-border-default">
                <td className="py-2 pr-4 font-mono">400</td>
                <td className="py-2 pr-4">Missing required parameter</td>
                <td className="py-2 text-text-muted">Check the endpoint documentation</td>
              </tr>
              <tr className="border-b border-border-default">
                <td className="py-2 pr-4 font-mono">429</td>
                <td className="py-2 pr-4">Rate limit exceeded</td>
                <td className="py-2 text-text-muted">Wait and retry, or request a higher limit</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 font-mono">500</td>
                <td className="py-2 pr-4">Server error</td>
                <td className="py-2 text-text-muted">Contact support via feedback</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
