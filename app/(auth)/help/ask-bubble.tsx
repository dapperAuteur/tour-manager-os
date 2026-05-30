'use client'

import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useMemo, useState } from 'react'
import { Loader2, Send, Sparkles, X } from 'lucide-react'

interface AskBubbleProps {
  defaultQuery?: string
}

export function AskBubble({ defaultQuery }: AskBubbleProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState(defaultQuery || '')

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/help/ask' }),
    [],
  )
  const { messages, sendMessage, status, error, stop } = useChat({
    transport,
  })

  const isBusy = status === 'submitted' || status === 'streaming'

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || isBusy) return
    sendMessage({ text: input.trim() })
    setInput('')
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-6 inline-flex items-center gap-2 rounded-lg border border-primary-500/30 bg-primary-500/5 px-4 py-2 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-500/10 dark:text-primary-300"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        Ask the help agent
      </button>
    )
  }

  return (
    <section
      aria-label="Help agent chat"
      className="mt-6 rounded-2xl border border-primary-500/30 bg-surface-raised"
    >
      <header className="flex items-center justify-between border-b border-border-default px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary-600 dark:text-primary-400" aria-hidden="true" />
          <h2 className="text-sm font-semibold">Help agent</h2>
          <span className="text-xs text-text-muted">Grounded in your help articles</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-text-muted hover:bg-surface-alt"
          aria-label="Close chat"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </header>

      <div
        role="log"
        aria-live="polite"
        className="max-h-96 space-y-3 overflow-y-auto px-4 py-3 text-sm"
      >
        {messages.length === 0 ? (
          <p className="text-text-muted">
            Ask anything about Tour Manager OS — advance sheets, finances,
            show day, ticketing, fan photos. The agent only answers using
            published help articles and cites its sources.
          </p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-lg px-3 py-2 ${
                m.role === 'user'
                  ? 'ml-8 bg-primary-500/10'
                  : 'mr-8 bg-surface-alt'
              }`}
            >
              <div className="mb-1 text-xs font-medium uppercase tracking-wide text-text-muted">
                {m.role === 'user' ? 'You' : 'Agent'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed">
                {m.parts.map((part, i) =>
                  part.type === 'text' ? (
                    <span key={i}>{part.text}</span>
                  ) : null,
                )}
              </div>
            </div>
          ))
        )}
        {error && (
          <div
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-200"
          >
            {error.message || 'Agent unavailable. Try search instead.'}
          </div>
        )}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-border-default p-3"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            isBusy
              ? 'Streaming…'
              : 'How do I set up tickets for a show?'
          }
          disabled={isBusy}
          className="flex-1 rounded-md border border-border-default bg-surface-base px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-60"
        />
        {isBusy ? (
          <button
            type="button"
            onClick={stop}
            className="inline-flex items-center gap-1 rounded-md border border-border-default px-3 py-2 text-xs font-medium hover:bg-surface-alt"
          >
            <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="inline-flex items-center gap-1 rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-3 w-3" aria-hidden="true" />
            Ask
          </button>
        )}
      </form>
    </section>
  )
}
