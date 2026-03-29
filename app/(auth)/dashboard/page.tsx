import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
        <div className="rounded-xl border border-border-default bg-surface-raised p-6">
          <p className="text-text-secondary">
            Welcome, <strong>{user.user_metadata?.display_name || user.email}</strong>. Your tours will appear here.
          </p>
        </div>
      </main>
    </>
  )
}
