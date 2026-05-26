'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  RefreshCw,
  Target,
  TrendingUp,
  Tag,
  LogOut,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const mainLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', href: '/transactions', icon: ArrowLeftRight },
  { name: 'Budgets', href: '/budgets', icon: PieChart },
]

const planningLinks = [
  { name: 'Subscriptions', href: '/subscriptions', icon: RefreshCw },
  { name: 'Savings Goals', href: '/goals', icon: Target },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
]

const settingsLinks = [
  { name: 'Categories', href: '/categories', icon: Tag },
]

export default function Sidebar({ user }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isLight, setIsLight] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLight(document.documentElement.classList.contains('light'))
  }, [])

  const toggleTheme = () => {
    if (isLight) {
      document.documentElement.classList.remove('light')
      localStorage.setItem('theme', 'dark')
      setIsLight(false)
    } else {
      document.documentElement.classList.add('light')
      localStorage.setItem('theme', 'light')
      setIsLight(true)
    }
  }

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
        className={`flex items-center gap-3 px-3 py-0 h-[44px] rounded-[10px] transition-all duration-150 text-[14px] ${
          isActive
            ? 'bg-accent-green-muted text-accent-green font-semibold border-l-[3px] border-accent-green'
            : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover border-l-[3px] border-transparent'
        }`}
      >
        <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-accent-green' : 'text-text-secondary'}`} />
        {link.name}
      </Link>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-bg-secondary border border-border rounded-lg text-text-primary"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <div
        className={`fixed md:sticky top-0 left-0 z-40 h-screen w-[240px] bg-bg-secondary border-r border-border flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* LOGO */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-border">
          <Image src="/logo.png" alt="SmartFinance" width={32} height={32} className="w-8 h-8 rounded-[8px]" />
          <span className="text-[18px] font-bold text-text-primary tracking-tight">SmartFinance</span>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8 hide-scrollbar">
          <div>
            <p className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2">Main</p>
            <div className="space-y-1">
              {mainLinks.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2">Planning</p>
            <div className="space-y-1">
              {planningLinks.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </div>
          </div>

          <div>
            <p className="px-3 text-[10px] font-semibold text-text-muted uppercase tracking-[0.12em] mb-2">Settings</p>
            <div className="space-y-1">
              {settingsLinks.map((link) => (
                <NavItem key={link.href} link={link} />
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="p-4 border-t border-border flex flex-col gap-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[11px] font-semibold text-text-muted tracking-wider">THEME</span>
            <button 
              onClick={toggleTheme}
              className="w-[36px] h-[36px] rounded-full bg-bg-tertiary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
            >
              {isLight ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-white font-semibold text-sm shrink-0">
              {user?.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-text-primary truncate">
                {user?.user_metadata?.full_name || 'User'}
              </p>
              <p className="text-[12px] text-text-secondary truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors px-1"
          >
            <LogOut className="w-[16px] h-[16px]" />
            Logout
          </button>
        </div>
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bg-primary/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
