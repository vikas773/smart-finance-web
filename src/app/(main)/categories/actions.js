'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addCategory(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const type = formData.get('type')
  const name = formData.get('name')
  const color = formData.get('color') || '#6366f1'

  await supabase.from('categories').insert({
    user_id: user.id,
    type,
    name,
    color,
    icon: 'tag' // default icon
  })

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/budgets')
}

export async function deleteCategory(formData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get('id')

  await supabase
    .from('categories')
    .delete()
    .match({ id, user_id: user.id })

  revalidatePath('/categories')
  revalidatePath('/transactions')
  revalidatePath('/budgets')
}
