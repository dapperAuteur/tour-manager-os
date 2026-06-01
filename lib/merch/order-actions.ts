'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type Result = { ok: true } | { error: string }

export async function markOrderFulfilled(
  orderId: string,
  tracking: string,
): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('merch_orders')
    .update({
      status: 'fulfilled',
      tracking_number: tracking.trim() || null,
      fulfilled_at: new Date().toISOString(),
    })
    .eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath('/merch/orders')
  return { ok: true }
}

export async function reopenOrder(orderId: string): Promise<Result> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('merch_orders')
    .update({
      status: 'paid',
      fulfilled_at: null,
      tracking_number: null,
    })
    .eq('id', orderId)
  if (error) return { error: error.message }
  revalidatePath('/merch/orders')
  return { ok: true }
}
