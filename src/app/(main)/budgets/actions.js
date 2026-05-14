'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addBudget(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const category_id = formData.get('category_id')
  const monthly_limit = formData.get('monthly_limit')
  const month = formData.get('month')
  const alert_threshold = formData.get('alert_threshold') || 80

  const { data: category } = await supabase
    .from('categories')
    .select('name')
    .eq('id', category_id)
    .single()

  await supabase.from('budgets').insert({
    user_id: user.id,
    category_id: Number(category_id),
    category_name: category?.name || 'Unknown',
    monthly_limit: Number(monthly_limit),
    month,
    alert_threshold: Number(alert_threshold)
  })

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
}

export async function deleteBudget(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get('id')

  await supabase
    .from('budgets')
    .delete()
    .match({ id, user_id: user.id })

  revalidatePath('/budgets')
  revalidatePath('/dashboard')
}
