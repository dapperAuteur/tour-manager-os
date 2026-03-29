'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const displayName = formData.get('display_name') as string
  const bio = formData.get('bio') as string
  const phone = formData.get('phone') as string

  // Upsert profile
  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      display_name: displayName || null,
      bio: bio || null,
      phone: phone || null,
    })

  if (error) return { error: error.message }

  // Update auth metadata display name
  await supabase.auth.updateUser({
    data: { display_name: displayName },
  })

  revalidatePath('/settings')
  return { success: true }
}

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const timezone = formData.get('timezone') as string
  const theme = formData.get('theme') as string
  const homePage = formData.get('home_page') as string
  const emailNotifications = formData.get('email_notifications') === 'on'
  const pushNotifications = formData.get('push_notifications') === 'on'

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      timezone: timezone || 'America/New_York',
      theme: theme || 'system',
      home_page: homePage || '/dashboard',
      email_notifications: emailNotifications,
      push_notifications: pushNotifications,
    })

  if (error) return { error: error.message }

  revalidatePath('/settings')
  return { success: true }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
}
