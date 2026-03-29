import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/header'
import { CreateTourForm } from './create-tour-form'

export const metadata: Metadata = {
  title: 'Create Tour',
}

export default async function NewTourPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <>
      <Header />
      <main id="main-content" className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
        <h1 className="mb-6 text-2xl font-bold">Create a New Tour</h1>
        <div className="rounded-xl border border-border-default bg-surface-raised p-6">
          <CreateTourForm />
        </div>
      </main>
    </>
  )
}
