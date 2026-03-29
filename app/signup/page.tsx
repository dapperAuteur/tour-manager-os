import type { Metadata } from 'next'
import { SignupForm } from './signup-form'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Sign Up',
}

export default function SignupPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-md flex-col items-center justify-center px-4">
        <div className="w-full rounded-xl border border-border-default bg-surface-raised p-8">
          <h1 className="mb-2 text-2xl font-bold">Create your account</h1>
          <p className="mb-6 text-sm text-text-secondary">
            Start managing tours in minutes.
          </p>
          <SignupForm />
        </div>
      </main>
    </>
  )
}
