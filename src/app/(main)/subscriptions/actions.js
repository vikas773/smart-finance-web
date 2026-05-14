'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSubscription(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name = formData.get('name')
  const amount = formData.get('amount')
  const billing_cycle = formData.get('billing_cycle')
  const next_renewal = formData.get('next_renewal')
  const category = formData.get('category') || 'Subscription'
  const note = formData.get('note')

  await supabase.from('subscriptions').insert({
    user_id: user.id,
    name,
    amount: Number(amount),
    billing_cycle,
    next_renewal,
    category,
    status: 'active',
    note
  })

  revalidatePath('/subscriptions')
}

export async function toggleSubscriptionStatus(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get('id')
  const currentStatus = formData.get('currentStatus')
  const newStatus = currentStatus === 'active' ? 'paused' : 'active'

  await supabase
    .from('subscriptions')
    .update({ status: newStatus })
    .match({ id, user_id: user.id })

  revalidatePath('/subscriptions')
}

export async function deleteSubscription(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get('id')

  await supabase
    .from('subscriptions')
    .delete()
    .match({ id, user_id: user.id })

  revalidatePath('/subscriptions')
}
