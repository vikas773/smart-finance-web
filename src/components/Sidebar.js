'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  TrendingUp,
  Grid,
  Repeat,
  Sliders,
  CreditCard,
  Target,
  BarChart2,
  Tag,
  LogOut,
  Menu,
  X,
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const mainLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: Grid },
  { name: 'Transactions', href: '/transactions', icon: Repeat },
  { name: 'Budgets', href: '/budgets', icon: Sliders },
]

const planningLinks = [
  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Savings Goals', href: '/goals', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: BarChart2 },
]

const settingsLinks = [
  { name: 'Categories', href: '/categories', icon: Tag },
]

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const NavItem = ({ link }) => {
    const isActive = pathname.startsWith(link.href)
    const Icon = link.icon

    return (
      <Link
        href={link.href}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-medium'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`}
      >
        <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
        {link.name}
      </Link>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg text-white"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-3 px-6 py-8 border-b border-slate-800/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">SmartFinance</span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 scrollbar-thin scrollbar-thumb-slate-800">
          <div>
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Main</p>
            <div className="space-y-1">
              {mainLinks.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Planning</p>
            <div className="space-y-1">
              {planningLinks.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Settings</p>
            <div className="space-y-1">
              {settingsLinks.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-white font-bold shrink-0">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
