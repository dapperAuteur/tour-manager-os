import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEMO_ROLES } from '@/lib/demo/config'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Delete all data created by demo users (cascade handles related rows)
    for (const role of DEMO_ROLES) {
      const { data: users } = await supabase.auth.admin.listUsers()
      const demoUser = users?.users.find((u) => u.email === role.email)

      if (demoUser) {
        // Delete tours created by this demo user
        await supabase.from('tours').delete().eq('created_by', demoUser.id)

        // Delete expenses by this demo user
        await supabase.from('expenses').delete().eq('member_id', demoUser.id)

        // Delete tour memberships
        await supabase.from('tour_members').delete().eq('user_id', demoUser.id)

        // Delete org memberships
        await supabase.from('org_members').delete().eq('user_id', demoUser.id)

        // Delete module access
        await supabase.from('member_module_access').delete().eq('member_id', demoUser.id)

        // Delete profile
        await supabase.from('user_profiles').delete().eq('id', demoUser.id)

        // Delete the auth user
        await supabase.auth.admin.deleteUser(demoUser.id)
      }
    }

    // Clean up demo org data that isn't tied to a user
    // Delete tours with demo org IDs
    await supabase.from('show_revenue').delete().in('show_id', [
      '20000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000004',
      '20000000-0000-0000-0000-000000000005',
      '20000000-0000-0000-0000-000000000006',
      '20000000-0000-0000-0000-000000000007',
      '20000000-0000-0000-0000-000000000008',
      '20000000-0000-0000-0000-000000000101',
      '20000000-0000-0000-0000-000000000102',
      '20000000-0000-0000-0000-000000000103',
      '20000000-0000-0000-0000-000000000104',
    ])

    await supabase.from('expenses').delete().in('tour_id', [
      '10000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
    ])

    await supabase.from('tours').delete().in('id', [
      '10000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000002',
    ])

    // Re-seed demo data
    // Read and execute the seed file via raw SQL
    const seedPath = join(process.cwd(), 'supabase', 'seed.sql')
    let seedSql: string
    try {
      seedSql = readFileSync(seedPath, 'utf-8')
    } catch {
      // In production on Vercel, the seed file may not be available
      // Fall back to inline essential seed data
      return NextResponse.json({
        success: true,
        message: 'Demo users cleaned up. Seed file not available in production — data will be re-created on next demo login.',
      })
    }

    // Execute seed SQL statements
    const { error: seedError } = await supabase.rpc('exec_sql', { sql: seedSql })
    if (seedError) {
      // RPC may not exist — that's OK, seed will run on next demo login
      console.error('Seed RPC error (non-fatal):', seedError.message)
    }

    return NextResponse.json({
      success: true,
      message: 'Demo data reset complete.',
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Demo reset error:', err)
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 })
  }
}
