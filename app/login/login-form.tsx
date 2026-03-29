'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type AuthMode = 'password' | 'otp-send' | 'otp-verify'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpCode, setOtpCode] = useState('')
  const [mode, setMode] = useState<AuthMode>('password')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  async function handlePasswordLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setMode('otp-verify')
    setLoading(false)
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'email',
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push(redirect)
    router.refresh()
  }

  // OTP verification step
  if (mode === 'otp-verify') {
    return (
      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
        {error && (
          <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
            {error}
          </div>
        )}

        <p className="text-sm text-text-secondary">
          We sent a 6-digit code to <strong>{email}</strong>. Enter it below.
        </p>

        <div>
          <label htmlFor="otp-code" className="mb-1 block text-sm font-medium">
            Verification code
          </label>
          <input
            id="otp-code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            required
            aria-required="true"
            autoFocus
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-center text-lg font-mono tracking-widest transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
            placeholder="000000"
          />
        </div>

        <button
          type="submit"
          disabled={loading || otpCode.length !== 6}
          className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
        >
          {loading ? 'Verifying...' : 'Verify code'}
        </button>

        <button
          type="button"
          onClick={() => { setMode('otp-send'); setOtpCode(''); setError('') }}
          className="text-sm text-text-secondary hover:text-text-primary"
        >
          Didn&apos;t receive a code? Try again
        </button>
      </form>
    )
  }

  // Password or OTP send step
  return (
    <form onSubmit={mode === 'password' ? handlePasswordLogin : handleSendOtp} className="flex flex-col gap-4">
      {error && (
        <div role="alert" className="rounded-lg bg-error-500/10 p-3 text-sm text-error-600 dark:text-error-500">
          {error}
        </div>
      )}

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

      {mode === 'password' && (
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            aria-required="true"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:bg-surface-alt"
            placeholder="Your password"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:focus:ring-offset-surface"
      >
        {loading
          ? (mode === 'password' ? 'Logging in...' : 'Sending code...')
          : (mode === 'password' ? 'Log in' : 'Send verification code')
        }
      </button>

      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border-default" />
        </div>
        <span className="relative bg-surface-raised px-3 text-xs text-text-muted">or</span>
      </div>

      <button
        type="button"
        onClick={() => { setMode(mode === 'password' ? 'otp-send' : 'password'); setError('') }}
        className="rounded-lg border border-border-default px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-alt focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface"
      >
        {mode === 'password' ? 'Log in with email code instead' : 'Log in with password instead'}
      </button>

      <p className="text-center text-sm text-text-secondary">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-primary-600 hover:underline dark:text-primary-400">
          Sign up
        </Link>
      </p>
    </form>
  )
}
