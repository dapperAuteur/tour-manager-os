import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getDemoRole } from '@/lib/demo/config'

const DEMO_PASSWORD = 'DemoUser2026!SecurePass'

export async function POST(request: Request) {
  const { role } = await request.json()
  const demoRole = getDemoRole(role)

  if (!demoRole) {
    return NextResponse.json({ error: 'Invalid demo role' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Check if demo user exists, create if not
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  let user = existingUsers?.users.find((u) => u.email === demoRole.email)

  if (!user) {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: demoRole.email,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: {
        display_name: demoRole.displayName,
        is_demo: true,
      },
    })

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 500 })
    }

    user = newUser.user

    // Create profile
    await supabase.from('user_profiles').upsert({
      id: user.id,
      display_name: demoRole.displayName,
      timezone: 'America/New_York',
      theme: 'system',
    })

    // Add to demo org
    await supabase.from('org_members').upsert({
      org_id: '00000000-0000-0000-0000-000000000001',
      user_id: user.id,
      role: demoRole.orgRole,
      is_paid: demoRole.isPaid,
    })

    // Add to demo tours as tour member
    const tourIds = [
      '10000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
    ]
    for (const tourId of tourIds) {
      // Update tours to have created_by set to demo manager
      if (demoRole.id === 'manager') {
        await supabase.from('tours').update({ created_by: user.id }).eq('id', tourId)
      }

      await supabase.from('tour_members').upsert({
        tour_id: tourId,
        user_id: user.id,
        role: demoRole.tourRole,
        display_name: demoRole.displayName,
      })
    }

    // Activate all modules for paid demo users
    if (demoRole.isPaid) {
      const { data: modules } = await supabase.from('modules').select('id')
      if (modules) {
        await supabase.from('member_module_access').upsert(
          modules.map((m) => ({
            member_id: user!.id,
            org_id: '00000000-0000-0000-0000-000000000001',
            module_id: m.id,
            status: 'active' as const,
            granted_by: user!.id,
            granted_at: new Date().toISOString(),
          }))
        )
      }
    }
  }

  // Sign in as the demo user using admin-generated token
  const { data: session, error: signInError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email: demoRole.email,
  })

  if (signInError || !session) {
    return NextResponse.json({ error: signInError?.message || 'Failed to create session' }, { status: 500 })
  }

  // Return the email and a one-time token for client-side sign in
  return NextResponse.json({
    email: demoRole.email,
    password: DEMO_PASSWORD,
  })
}
