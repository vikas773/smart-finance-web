'use client'

import { useState, Suspense, useEffect } from 'react'
import Image from 'next/image'
import { Mail, Lock, User, ArrowRight, AlertCircle, Sun, Moon } from 'lucide-react'
import { login, signup } from './actions'
import { useSearchParams } from 'next/navigation'

function LoginContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [isLight, setIsLight] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary p-4 transition-colors duration-300">
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-bg-secondary border border-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors"
      >
        {isLight ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="relative w-full max-w-[420px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-[72px] h-[72px] rounded-[16px] shadow-lg mb-6 bg-white p-2">
            <Image src="/logo.png" alt="SmartFinance Logo" width={56} height={56} className="w-full h-full object-contain rounded-[8px]" />
          </div>
          <h1 className="text-[32px] font-bold text-text-primary mb-2 tracking-tight">SmartFinance</h1>
          <p className="text-[15px] text-text-secondary font-medium">Track · Budget · Achieve Goals</p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-[24px] shadow-sm p-8 transition-all duration-300">
          <div className="flex p-1 bg-bg-tertiary rounded-[12px] mb-8">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[10px] transition-all duration-200 ${
                isLogin
                  ? 'bg-bg-secondary text-text-primary shadow-sm border border-border'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 text-[14px] font-semibold rounded-[10px] transition-all duration-200 ${
                !isLogin
                  ? 'bg-bg-secondary text-text-primary shadow-sm border border-border'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>

          {error && (
            <div className="mb-6 flex items-center gap-3 p-4 text-[13px] text-accent-red bg-accent-red-muted border border-accent-red/20 rounded-[12px]">
              <AlertCircle className="w-[18px] h-[18px] flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form action={isLogin ? login : signup} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Full Name</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-green transition-colors">
                    <User className="w-[18px] h-[18px]" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Your full name"
                    className="w-full pl-11 pr-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[12px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-green transition-colors">
                  <Mail className="w-[18px] h-[18px]" />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="you@email.com"
                  className="w-full pl-11 pr-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[12px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted group-focus-within:text-accent-green transition-colors">
                  <Lock className="w-[18px] h-[18px]" />
                </div>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  placeholder={isLogin ? 'Enter password' : 'Min 6 characters'}
                  className="w-full pl-11 pr-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[12px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-[48px] mt-2 bg-accent-green hover:brightness-110 active:scale-[0.98] text-[#000000] font-semibold rounded-[12px] flex items-center justify-center gap-2 group transition-all duration-200 text-[15px]"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {isLogin && (
            <div className="mt-8 pt-6 border-t border-border-subtle text-center">
              <p className="text-[13px] text-text-muted">
                Demo Account
              </p>
              <p className="text-[13px] text-text-primary mt-1 font-medium font-mono bg-bg-tertiary py-2 px-3 rounded-lg inline-block border border-border">
                demo@finance.com <span className="text-text-muted mx-1">/</span> demo1234
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary">Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
