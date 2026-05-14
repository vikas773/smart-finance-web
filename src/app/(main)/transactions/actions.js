'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const type = formData.get('type')
  const date = formData.get('date')
  const title = formData.get('title')
  const amount = formData.get('amount')
  const category_id = formData.get('category_id')
  const note = formData.get('note')

  await supabase.from('transactions').insert({
    user_id: user.id,
    type,
    date,
    title,
    amount: Number(amount),
    category_id: category_id ? Number(category_id) : null,
    note
  })

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/analytics')
}

export async function deleteTransaction(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get('id')

  await supabase
    .from('transactions')
    .delete()
    .match({ id, user_id: user.id })

  revalidatePath('/transactions')
  revalidatePath('/dashboard')
  revalidatePath('/analytics')
}
