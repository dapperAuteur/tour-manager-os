import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import {
  getContactGroup,
  listOrgMembers,
} from '@/lib/venues/contact-groups'
import { listCandidateContacts } from '@/lib/venues/candidate-contacts'
import { GroupMembers } from './group-members'
import { GroupVisibility } from './group-visibility'

export const metadata: Metadata = {
  title: 'Manage Contact Group',
  robots: { index: false },
}

export default async function ContactGroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const group = await getContactGroup(id)
  if (!group) notFound()

  // Pull a candidate list for add-to-group (capped at 100; client-side
  // search narrows it further).
  const candidateContacts = await listCandidateContacts(100)
  const orgMembers = await listOrgMembers(group.org_id)

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <Link
        href="/settings/contact-groups"
        className="mb-3 inline-flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
      >
        <ArrowLeft className="size-3" aria-hidden /> All groups
      </Link>
      <h1 className="mb-1 text-2xl font-bold">{group.name}</h1>
      {group.description && (
        <p className="mb-6 text-sm text-text-secondary">{group.description}</p>
      )}

      <section className="mb-8 rounded-xl border border-border-default bg-surface-raised p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Contacts in this group ({group.member_count})
        </h2>
        <GroupMembers
          groupId={group.id}
          members={group.members}
          candidates={candidateContacts}
        />
      </section>

      <section className="rounded-xl border border-border-default bg-surface-raised p-5">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-text-muted">
          Who can see these contacts
        </h2>
        <p className="mb-4 text-xs text-text-muted">
          Org owners and admins always have access. The group creator
          ({group.is_creator ? 'you' : 'another member'}) always has access.
          Check additional band members below to grant visibility.
        </p>
        <GroupVisibility
          groupId={group.id}
          visibility={group.visibility}
          orgMembers={orgMembers}
        />
      </section>
    </main>
  )
}
