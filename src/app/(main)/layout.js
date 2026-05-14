import Sidebar from '@/components/Sidebar'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function MainLayout({ children }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar user={user} />
      <main className="flex-1 overflow-x-hidden min-w-0">
        {children}
      </main>
    </div>
  )
}
