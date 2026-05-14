'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addGoal(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const title = formData.get('title')
  const target_amount = formData.get('target_amount')
  const target_date = formData.get('target_date') || null

  await supabase.from('savings_goals').insert({
    user_id: user.id,
    title,
    target_amount: Number(target_amount),
    target_date,
    saved_amount: 0,
    status: 'active'
  })

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

export async function addFunds(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get('id')
  const amount = Number(formData.get('amount'))

  // Fetch current
  const { data: goal } = await supabase
    .from('savings_goals')
    .select('saved_amount, target_amount')
    .eq('id', id)
    .single()

  if (goal) {
    let newSaved = Number(goal.saved_amount) + amount
    let status = 'active'
    if (newSaved >= Number(goal.target_amount)) {
      newSaved = Number(goal.target_amount)
      status = 'completed'
    }

    await supabase
      .from('savings_goals')
      .update({ saved_amount: newSaved, status })
      .match({ id, user_id: user.id })
  }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}

export async function deleteGoal(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get('id')

  await supabase
    .from('savings_goals')
    .delete()
    .match({ id, user_id: user.id })

  revalidatePath('/goals')
  revalidatePath('/dashboard')
}
