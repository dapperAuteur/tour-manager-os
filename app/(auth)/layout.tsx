import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/layout/app-nav'
import { DemoBanner } from '@/components/layout/demo-banner'
import { isDemoUser } from '@/lib/demo/config'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName = user.user_metadata?.display_name || user.email?.split('@')[0] || 'User'
  const isDemo = isDemoUser(user.email)

  return (
    <div className="flex min-h-screen">
      <AppNav userName={displayName} />
      <div className="flex-1">
        {isDemo && <DemoBanner />}
        {children}
      </div>
    </div>
  )
}
