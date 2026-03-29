'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Check, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const PASSWORD_MIN_LENGTH = 16
const MAX_REPEATED_CHARS = 3

function validatePassword(pw: string) {
  const checks = [
    { label: `At least ${PASSWORD_MIN_LENGTH} characters`, pass: pw.length >= PASSWORD_MIN_LENGTH },
    { label: 'Uppercase letter (A-Z)', pass: /[A-Z]/.test(pw) },
    { label: 'Lowercase letter (a-z)', pass: /[a-z]/.test(pw) },
    { label: 'Number (0-9)', pass: /[0-9]/.test(pw) },
    { label: 'Symbol (!@#$%...)', pass: /[^A-Za-z0-9]/.test(pw) },
    {
      label: `No more than ${MAX_REPEATED_CHARS} repeated characters in a row`,
      pass: !new RegExp(`(.)\\1{${MAX_REPEATED_CHARS},}`).test(pw),
    },
  ]
  return checks
}

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const passwordChecks = useMemo(() => validatePassword(password), [password])
  const passwordValid = password.length > 0 && passwordChecks.every((c) => c.pass)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!passwordValid) {
      setError('Password does not meet all requirements.')
      return
    }

    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div role="status" className="text-center">
        <p className="mb-2 text-lg font-semibold">Check your email</p>
        <p className="text-sm text-text-secondary">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="display-name" className="mb-1 block text-sm font-medium">
          Name
        </label>
        <input
          id="display-name"
          type="text"
          required
          aria-required="true"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          aria-required="true"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          aria-required="true"
          minLength={PASSWORD_MIN_LENGTH}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          aria-describedby="password-requirements"
          className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
          placeholder="Min 16 chars, mixed case, numbers, symbols"
        />

        {/* Password strength checklist */}
        {password.length > 0 && (
          <ul id="password-requirements" className="mt-2 space-y-1" aria-label="Password requirements">
            {passwordChecks.map((check) => (
              <li key={check.label} className="flex items-center gap-2 text-xs">
                {check.pass ? (
                  <Check className="h-3 w-3 text-success-600 dark:text-success-500" aria-hidden="true" />
                ) : (
                  <X className="h-3 w-3 text-error-500" aria-hidden="true" />
                )}
                <span className={check.pass ? 'text-success-600 dark:text-success-500' : 'text-text-muted'}>
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !passwordValid}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:underline dark:text-primary-400">
          Log in
        </Link>
      </p>
    </form>
  )
}
