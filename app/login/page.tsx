import { Suspense } from 'react'
import type { Metadata } from 'next'
import { LoginForm } from './login-form'
import { DemoLogin } from './demo-login'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Log In',
  robots: { index: false, follow: false },
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ demo?: string }> }) {
  const { demo } = await searchParams
  const isDemo = demo === 'true'

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4" style={{ maxWidth: isDemo ? '40rem' : '28rem' }}>
        {isDemo ? (
          <div className="w-full rounded-xl border border-border-default bg-surface-raised p-8">
            <DemoLogin />
          </div>
        ) : (
          <div className="w-full rounded-xl border border-border-default bg-surface-raised p-8">
            <h1 className="mb-2 text-2xl font-bold">Welcome back</h1>
            <p className="mb-6 text-sm text-text-secondary">
              Log in to manage your tours.
            </p>
            <Suspense fallback={<div className="h-48" />}>
              <LoginForm />
            </Suspense>
          </div>
        )}
      </main>
    </>
  )
}
