import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { AppNav } from '@/components/layout/app-nav'
import { BrandTheme } from '@/components/layout/brand-theme'
import { DemoBanner } from '@/components/layout/demo-banner'
import { SiteFooter } from '@/components/layout/site-footer'
import { isDemoUser } from '@/lib/demo/config'
import { isSuperAdmin } from '@/lib/auth/super-admin'
import { resolveWitusSsoConfig } from '@/lib/auth/witus-sso-server'

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

  // Check if user is admin (super admin or org owner/admin)
  let isAdmin = isSuperAdmin(user.email)
  if (!isAdmin) {
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['owner', 'admin'])
      .limit(1)
      .single()
    isAdmin = !!orgMember
  }

  // Get unread feedback notification count
  const { count: unreadFeedback } = await supabase
    .from('feedback_notifications')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('read', false)

  // Null unless this is a configured WitUS client on the registered host (never a white-label
  // custom domain), in which case the sidebar shows only the local "Sign out".
  const { signOutEverywhereUrl } = resolveWitusSsoConfig((await headers()).get('host'))

  return (
    <div className="flex min-h-screen">
      <BrandTheme userId={user.id} />
      <AppNav
        userName={displayName}
        isAdmin={isAdmin}
        unreadFeedback={unreadFeedback || 0}
        signOutEverywhereUrl={signOutEverywhereUrl}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        {isDemo && <DemoBanner />}
        <div className="flex-1">{children}</div>
        <SiteFooter />
      </div>
    </div>
  )
}
