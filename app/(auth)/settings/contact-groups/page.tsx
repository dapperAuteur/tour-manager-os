import type { Metadata } from 'next'
import Link from 'next/link'
import { Users, Eye } from 'lucide-react'
import { listContactGroups } from '@/lib/venues/contact-groups'
import { CreateGroupForm } from './create-group-form'
import { DeleteGroupButton } from './delete-group-button'

export const metadata: Metadata = {
  title: 'Contact Groups',
  robots: { index: false },
}

export default async function ContactGroupsPage() {
  const groups = await listContactGroups()

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <Link
          href="/settings"
          className="text-sm text-text-muted hover:text-text-secondary"
        >
          &larr; Settings
        </Link>
        <h1 className="mt-2 text-2xl font-bold">Contact Groups</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Bundle venue contacts and decide which band members can see them.
          Contacts not in any group stay visible to everyone (the current
          default). A contact in a group is visible only to org
          owners/admins, the group creator, and people you explicitly grant
          visibility.
        </p>
      </header>

      <section className="mb-8 rounded-xl border border-border-default bg-surface-raised p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          New group
        </h2>
        <CreateGroupForm />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Your groups ({groups.length})
        </h2>
        {groups.length === 0 ? (
          <p className="text-sm text-text-muted">
            No groups yet. Use the form above to create one.
          </p>
        ) : (
          <ul className="space-y-2">
            {groups.map((g) => (
              <li
                key={g.id}
                className="rounded-md border border-border-default bg-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/settings/contact-groups/${g.id}`}
                      className="font-semibold hover:underline"
                    >
                      {g.name}
                    </Link>
                    {g.description && (
                      <p className="mt-0.5 text-xs text-text-secondary">
                        {g.description}
                      </p>
                    )}
                    <div className="mt-2 flex gap-3 text-xs text-text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" aria-hidden /> {g.member_count} contact{g.member_count === 1 ? '' : 's'}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Eye className="size-3" aria-hidden />
                        {g.visibility_count > 0
                          ? `${g.visibility_count} viewer${g.visibility_count === 1 ? '' : 's'}`
                          : 'admins + creator only'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Link
                      href={`/settings/contact-groups/${g.id}`}
                      className="rounded-md border border-border-default px-2.5 py-1 text-xs font-medium hover:bg-surface-alt"
                    >
                      Manage
                    </Link>
                    <DeleteGroupButton groupId={g.id} name={g.name} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
