'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createProduct(orgId: string, formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const sku = formData.get('sku') as string
  const category = formData.get('category') as string
  const price = formData.get('price') as string
  const costBasis = formData.get('cost_basis') as string

  if (!name || !price) return { error: 'Name and price are required' }

  const { error } = await supabase
    .from('merch_products')
    .insert({
      org_id: orgId,
      name,
      description: description || null,
      sku: sku || null,
      category: category || null,
      price: parseFloat(price),
      cost_basis: costBasis ? parseFloat(costBasis) : null,
    })

  if (error) return { error: error.message }

  revalidatePath('/merch')
  redirect('/merch')
}

export async function updateInventory(productId: string, tourId: string, formData: FormData) {
  const supabase = await createClient()

  const quantityStart = Number(formData.get('quantity_start'))
  const quantityRemaining = Number(formData.get('quantity_remaining'))

  const { error } = await supabase
    .from('merch_inventory')
    .upsert({
      product_id: productId,
      tour_id: tourId,
      quantity_start: quantityStart,
      quantity_remaining: quantityRemaining,
    })

  if (error) return { error: error.message }

  revalidatePath('/merch')
  return { success: true }
}

export async function recordSale(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const productId = formData.get('product_id') as string
  const showId = formData.get('show_id') as string
  const tourId = formData.get('tour_id') as string
  const quantity = Number(formData.get('quantity'))
  const unitPrice = Number(formData.get('unit_price'))

  if (!productId || !tourId || !quantity || !unitPrice) {
    return { error: 'Product, tour, quantity, and price are required' }
  }

  const { error } = await supabase
    .from('merch_sales')
    .insert({
      product_id: productId,
      show_id: showId || null,
      tour_id: tourId,
      quantity,
      unit_price: unitPrice,
      sold_by: user?.id || null,
    })

  if (error) return { error: error.message }

  // Update inventory
  if (showId) {
    const { data: inv } = await supabase
      .from('merch_inventory')
      .select('quantity_remaining')
      .eq('product_id', productId)
      .eq('tour_id', tourId)
      .single()

    if (inv) {
      await supabase
        .from('merch_inventory')
        .update({ quantity_remaining: inv.quantity_remaining - quantity })
        .eq('product_id', productId)
        .eq('tour_id', tourId)
    }
  }

  revalidatePath('/merch')
  redirect('/merch')
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('merch_products').delete().eq('id', productId)
  if (error) return { error: error.message }
  revalidatePath('/merch')
  return { success: true }
}
