'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Send, Trash2 } from 'lucide-react'
import {
  deletePackageMessage,
  postPackageMessage,
} from '@/lib/packages/message-actions'

interface Message {
  id: string
  sender_user_id: string | null
  sender_name: string | null
  sender_act_label: string | null
  body: string
  created_at: string
  edited_at: string | null
}

interface Act {
  id: string
  act_name: string
}

export function MessageFeed({
  packageId,
  currentUserId,
  messages,
  actsCurrentUserCanSpeakAs,
}: {
  packageId: string
  currentUserId: string
  messages: Message[]
  actsCurrentUserCanSpeakAs: Act[]
}) {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function action(formData: FormData) {
    setError(null)
    setBusy(true)
    const result = await postPackageMessage(packageId, formData)
    setBusy(false)
    if ('error' in result) {
      setError(result.error)
      return
    }
    // Clear the textarea by remounting via key bump.
    setFormKey((k) => k + 1)
    startTransition(() => router.refresh())
  }

  const [formKey, setFormKey] = useState(0)

  return (
    <div>
      <ul className="mb-6 space-y-3">
        {messages.length === 0 ? (
          <li className="rounded-xl border border-border-default bg-surface-raised p-8 text-center text-sm text-text-muted">
            No messages yet. Start the conversation.
          </li>
        ) : (
          messages.map((m) => {
            const mine = m.sender_user_id === currentUserId
            const when = new Date(m.created_at)
            return (
              <li
                key={m.id}
                className={`rounded-xl border p-4 ${
                  mine
                    ? 'border-primary-500/30 bg-primary-500/5'
                    : 'border-border-default bg-surface-raised'
                }`}
              >
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">
                    {m.sender_act_label || m.sender_name || 'Someone'}
                    {m.sender_act_label && m.sender_name && (
                      <span className="ml-1 font-normal text-text-muted">
                        ({m.sender_name})
                      </span>
                    )}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted">
                      {when.toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    {mine && (
                      <DeleteButton
                        packageId={packageId}
                        messageId={m.id}
                        onDone={() => startTransition(() => router.refresh())}
                      />
                    )}
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-sm text-text-secondary">
                  {m.body}
                </p>
              </li>
            )
          })
        )}
      </ul>

      <form
        key={formKey}
        action={action}
        className="space-y-3 rounded-xl border border-border-default bg-surface-raised p-4"
      >
        {actsCurrentUserCanSpeakAs.length > 0 && (
          <label className="block">
            <span className="mb-1 block text-xs font-medium">
              Post as (optional)
            </span>
            <select
              name="act_id"
              defaultValue=""
              className="w-full rounded-md border border-border-default bg-surface px-2 py-1.5 text-sm"
            >
              <option value="">Just my name</option>
              {actsCurrentUserCanSpeakAs.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.act_name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="block">
          <span className="sr-only">Message</span>
          <textarea
            name="body"
            required
            rows={3}
            maxLength={4000}
            placeholder="Write to the rest of the bill — load-in changes, soundcheck swaps, anything"
            className="w-full rounded-md border border-border-default bg-surface px-3 py-2 text-sm"
          />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-50"
          >
            <Send className="size-3" aria-hidden />
            {busy ? 'Posting…' : 'Post'}
          </button>
          {error && (
            <p role="alert" className="text-xs text-error-600 dark:text-error-500">
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  )
}

function DeleteButton({
  packageId,
  messageId,
  onDone,
}: {
  packageId: string
  messageId: string
  onDone: () => void
}) {
  const [busy, setBusy] = useState(false)
  async function go() {
    if (!window.confirm('Delete this message?')) return
    setBusy(true)
    const result = await deletePackageMessage(packageId, messageId)
    setBusy(false)
    if ('error' in result) {
      window.alert(result.error)
      return
    }
    onDone()
  }
  return (
    <button
      type="button"
      onClick={go}
      disabled={busy}
      aria-label="Delete message"
      className="rounded p-1 text-error-600 hover:bg-error-500/10 disabled:opacity-50 dark:text-error-400"
    >
      <Trash2 className="size-3" aria-hidden />
    </button>
  )
}
