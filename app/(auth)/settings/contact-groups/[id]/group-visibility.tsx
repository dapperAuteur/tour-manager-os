'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setGroupVisibility } from '@/lib/venues/contact-group-actions'

interface Member {
  user_id: string
  display_name: string | null
}

export function GroupVisibility({
  groupId,
  visibility,
  orgMembers,
}: {
  groupId: string
  visibility: Member[]
  orgMembers: Member[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [selected, setSelected] = useState<Set<string>>(
    new Set(visibility.map((v) => v.user_id)),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)

  function toggle(userId: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(userId)) next.delete(userId)
      else next.add(userId)
      return next
    })
  }

  async function save() {
    setSaving(true)
    setError(null)
    const result = await setGroupVisibility(groupId, [...selected])
    setSaving(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    setSavedAt(Date.now())
    startTransition(() => router.refresh())
  }

  return (
    <div>
      {orgMembers.length === 0 ? (
        <p className="text-sm text-text-muted">
          No other org members to grant visibility to.
        </p>
      ) : (
        <ul className="space-y-1">
          {orgMembers.map((m) => (
            <li key={m.user_id}>
              <label className="flex items-center gap-2 rounded-md p-2 text-sm hover:bg-surface-alt">
                <input
                  type="checkbox"
                  checked={selected.has(m.user_id)}
                  onChange={() => toggle(m.user_id)}
                  className="rounded accent-primary-600"
                />
                {m.display_name || (
                  <span className="text-text-muted">Member without display name</span>
                )}
              </label>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save visibility'}
        </button>
        {error && (
          <span role="alert" className="text-xs text-error-600 dark:text-error-500">
            {error}
          </span>
        )}
        {savedAt && !error && (
          <span className="text-xs text-success-600 dark:text-success-500">
            Saved.
          </span>
        )}
      </div>
    </div>
  )
}
