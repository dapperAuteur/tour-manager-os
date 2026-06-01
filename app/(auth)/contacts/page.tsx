import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, Phone, Search, Star, UserRound } from 'lucide-react'
import { searchContacts } from '@/lib/venues/contacts-search'

export const metadata: Metadata = {
  title: 'Contacts',
  robots: { index: false },
}

const ROLE_LABELS: Record<string, string> = {
  booker: 'Booker',
  production: 'Production',
  hospitality: 'Hospitality',
  sound: 'Sound',
  lighting: 'Lighting',
  merch: 'Merch',
  security: 'Security',
  house: 'House Manager',
  other: 'Other',
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = '' } = await searchParams
  const hits = await searchContacts(q, 100)

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Contacts</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Search every contact across every venue you can see. Useful when
          you remember a name but not which venue.
        </p>
      </header>

      <form
        method="get"
        role="search"
        className="mb-6 flex items-center gap-2 rounded-lg border border-border-default bg-surface-raised p-2"
      >
        <Search className="ml-1 size-4 text-text-muted" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Search by name, phone, email, or role…"
          aria-label="Search contacts"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
        />
        <button
          type="submit"
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700"
        >
          Search
        </button>
      </form>

      <p className="mb-3 text-xs text-text-muted">
        {q ? (
          <>
            {hits.length} result{hits.length === 1 ? '' : 's'} for &ldquo;{q}&rdquo;
          </>
        ) : (
          <>{hits.length} most-recent contact{hits.length === 1 ? '' : 's'}</>
        )}
      </p>

      {hits.length === 0 ? (
        <div className="rounded-xl border border-border-default bg-surface-raised p-8 text-center">
          <UserRound
            className="mx-auto mb-3 size-8 text-text-muted"
            aria-hidden
          />
          <p className="text-sm text-text-secondary">
            {q
              ? 'No contacts matched. Try a different name, phone fragment, or role.'
              : 'No contacts yet. Add some on any venue’s profile page.'}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {hits.map((c) => (
            <li
              key={c.id}
              className="rounded-md border border-border-default bg-surface-raised p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 font-medium">
                    {c.name}
                    <span className="text-xs font-normal text-text-muted">
                      &middot; {ROLE_LABELS[c.role] || c.role}
                    </span>
                    {c.is_primary && (
                      <span
                        className="inline-flex items-center gap-1 rounded-full bg-warning-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-warning-700 dark:text-warning-400"
                        title="Primary contact for this role at this venue"
                      >
                        <Star className="size-2.5 fill-current" aria-hidden /> Primary
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-text-muted">
                    <Link
                      href={`/venues/${c.venue_id}`}
                      className="font-medium text-primary-700 hover:underline dark:text-primary-400"
                    >
                      {c.venue_name}
                    </Link>
                    {c.phone && (
                      <a
                        href={`tel:${c.phone}`}
                        className="inline-flex items-center gap-1 hover:text-text-secondary"
                      >
                        <Phone className="size-3" aria-hidden /> {c.phone}
                      </a>
                    )}
                    {c.email && (
                      <a
                        href={`mailto:${c.email}`}
                        className="inline-flex items-center gap-1 hover:text-text-secondary"
                      >
                        <Mail className="size-3" aria-hidden /> {c.email}
                      </a>
                    )}
                  </div>
                  {c.notes && (
                    <p className="mt-1 whitespace-pre-wrap text-xs text-text-secondary">
                      {c.notes}
                    </p>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
