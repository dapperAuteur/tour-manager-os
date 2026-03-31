'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { LifeBuoy, X, MessageSquare, HelpCircle, Bug, Upload, Send } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type Tab = 'menu' | 'feedback' | 'bug'

export function HelpBubble() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('menu')
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<'bug' | 'feature' | 'question'>('question')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function reset() {
    setTab('menu')
    setSubject('')
    setContent('')
    setCategory('question')
    setFiles([])
    setSent(false)
  }

  function handleClose() {
    setOpen(false)
    setTimeout(reset, 200)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject.trim() || !content.trim()) return

    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    // Get org
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    // Create thread
    const { data: thread, error } = await supabase
      .from('feedback_threads')
      .insert({
        user_id: user.id,
        org_id: orgMember?.org_id || null,
        subject,
        category,
        priority: category === 'bug' ? 'high' : 'normal',
      })
      .select('id')
      .single()

    if (error || !thread) {
      setLoading(false)
      return
    }

    // Build message with file info
    let message = content
    if (files.length > 0) {
      message += '\n\n---\nAttachments: ' + files.map((f) => `${f.name} (${(f.size / 1024).toFixed(0)} KB)`).join(', ')
      message += '\n(Upload to Cloudinary or Supabase Storage to attach files — feature coming soon)'
    }

    // Add message
    await supabase.from('feedback_messages').insert({
      thread_id: thread.id,
      sender_id: user.id,
      sender_role: 'user',
      content: message,
    })

    setSent(true)
    setLoading(false)
  }

  return (
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
        aria-label={open ? 'Close help menu' : 'Get help, leave feedback, or report a bug'}
      >
        {open ? <X className="h-6 w-6" aria-hidden="true" /> : <LifeBuoy className="h-6 w-6" aria-hidden="true" />}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 overflow-hidden rounded-2xl border border-border-default bg-surface shadow-2xl sm:w-96"
          role="dialog"
          aria-label="Help and feedback"
        >
          {/* Header */}
          <div className="border-b border-border-default bg-surface-alt px-5 py-3">
            <h2 className="text-sm font-semibold">
              {tab === 'menu' && 'How can we help?'}
              {tab === 'feedback' && 'Send Feedback'}
              {tab === 'bug' && 'Report a Bug'}
            </h2>
          </div>

          {/* Menu */}
          {tab === 'menu' && (
            <div className="p-4 space-y-2">
              <button
                type="button"
                onClick={() => router.push('/help')}
                className="flex w-full items-center gap-3 rounded-xl border border-border-default p-4 text-left transition-colors hover:bg-surface-alt"
              >
                <HelpCircle className="h-5 w-5 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Help Center</p>
                  <p className="text-xs text-text-muted">Search articles, guides, and tutorials</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setTab('feedback'); setCategory('question') }}
                className="flex w-full items-center gap-3 rounded-xl border border-border-default p-4 text-left transition-colors hover:bg-surface-alt"
              >
                <MessageSquare className="h-5 w-5 text-success-600 dark:text-success-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Send Feedback</p>
                  <p className="text-xs text-text-muted">Feature requests, questions, or praise</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => { setTab('bug'); setCategory('bug') }}
                className="flex w-full items-center gap-3 rounded-xl border border-border-default p-4 text-left transition-colors hover:bg-surface-alt"
              >
                <Bug className="h-5 w-5 text-error-500" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Report a Bug</p>
                  <p className="text-xs text-text-muted">Something broken? Let us know</p>
                </div>
              </button>
            </div>
          )}

          {/* Feedback / Bug form */}
          {(tab === 'feedback' || tab === 'bug') && !sent && (
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label htmlFor="bubble-subject" className="mb-1 block text-xs font-medium">
                  {tab === 'bug' ? 'What happened?' : 'Subject'}
                </label>
                <input
                  id="bubble-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
                  placeholder={tab === 'bug' ? 'Brief description of the bug' : 'What\'s on your mind?'}
                />
              </div>

              {tab === 'feedback' && (
                <div>
                  <label htmlFor="bubble-category" className="mb-1 block text-xs font-medium">Category</label>
                  <select
                    id="bubble-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as 'question' | 'feature')}
                    className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
                  >
                    <option value="question">Question</option>
                    <option value="feature">Feature Request</option>
                  </select>
                </div>
              )}

              <div>
                <label htmlFor="bubble-content" className="mb-1 block text-xs font-medium">Details</label>
                <textarea
                  id="bubble-content"
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
                  placeholder={tab === 'bug' ? 'Steps to reproduce, what you expected, what happened instead...' : 'Tell us more...'}
                />
              </div>

              {/* File upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Upload screenshots or screen recordings"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 rounded-lg border border-border-default px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-alt"
                >
                  <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                  {files.length > 0 ? `${files.length} file${files.length > 1 ? 's' : ''} selected` : 'Screenshots or recordings'}
                </button>
                {files.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {files.map((f, i) => (
                      <p key={i} className="text-xs text-text-muted">{f.name} ({(f.size / 1024).toFixed(0)} KB)</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button type="button" onClick={() => setTab('menu')} className="text-xs text-text-muted hover:text-text-secondary">
                  &larr; Back
                </button>
                <button
                  type="submit"
                  disabled={loading || !subject.trim() || !content.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
                >
                  <Send className="h-3.5 w-3.5" aria-hidden="true" />
                  {loading ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          )}

          {/* Success */}
          {sent && (
            <div className="p-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-success-500/10">
                <MessageSquare className="h-6 w-6 text-success-600 dark:text-success-500" aria-hidden="true" />
              </div>
              <p className="mb-1 font-semibold">Thank you!</p>
              <p className="mb-4 text-sm text-text-secondary">
                We&apos;ll review your {category === 'bug' ? 'bug report' : 'feedback'} and respond soon.
              </p>
              <button type="button" onClick={handleClose} className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
