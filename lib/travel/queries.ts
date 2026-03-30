import { createClient } from '@/lib/supabase/server'

export async function getTravelArrangements(tourId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('travel_arrangements')
    .select('*')
    .eq('tour_id', tourId)
    .order('check_in', { ascending: true })

  if (error) throw error
  return data || []
}
