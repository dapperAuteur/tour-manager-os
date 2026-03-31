import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { RoleSelect } from './role-select'

export const metadata: Metadata = {
  title: 'Welcome — Choose Your Role',
  robots: { index: false },
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Check if already onboarded
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_type')
    .eq('id', user.id)
    .single()

  if (profile?.user_type) {
    redirect('/dashboard')
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'there'

  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome, {displayName}!</h1>
          <p className="mt-2 text-text-secondary">
            How will you use Tour Manager OS? This helps us tailor your experience.
          </p>
        </div>
        <RoleSelect userId={user.id} />
      </div>
    </main>
  )
}
