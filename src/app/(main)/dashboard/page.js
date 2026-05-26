import { createClient } from '@/utils/supabase/server'
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  Target,
  AlertCircle,
  Inbox,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import DashboardCharts from './DashboardCharts'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const now = new Date()
  const startMonth = startOfMonth(now).toISOString()
  const endMonth = endOfMonth(now).toISOString()
  const currentMonthStr = format(now, 'yyyy-MM')

  // 1. Transactions for current month
  const { data: monthTxData } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startMonth)
    .lte('date', endMonth)
  
  const monthTx = monthTxData || []

  let income = 0
  let expense = 0
  monthTx.forEach((tx) => {
    if (tx.type === 'income') income += Number(tx.amount)
    if (tx.type === 'expense') expense += Number(tx.amount)
  })
  const balance = income - expense

  // 2. Active Savings Goals
  const { count: goalsCount } = await supabase
    .from('savings_goals')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'active')

  // 3. Recent Transactions
  const { data: recentData } = await supabase
    .from('transactions')
    .select('*, categories(name, color)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(8)
    
  const recent = recentData || []

  // 4. Budget Alerts
  const { data: budgetsData } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', currentMonthStr)

  const budgets = budgetsData || []
  const budgetAlerts = []
  
  budgets.forEach((b) => {
    const spent = monthTx
      .filter((tx) => tx.category_id === b.category_id && tx.type === 'expense')
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    
    const pct = b.monthly_limit > 0 ? Math.min((spent / b.monthly_limit) * 100, 100) : 0
    if (pct >= b.alert_threshold) {
      budgetAlerts.push({ ...b, spent, pct })
    }
  })

  // 5. Active Goals List
  const { data: goalsListData } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(3)
    
  const goalsList = goalsListData || []

  // 6. Chart Data (Last 6 months)
  const chartData = []
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i)
    const mStart = startOfMonth(d).toISOString()
    const mEnd = endOfMonth(d).toISOString()

    const { data: txsData } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('date', mStart)
      .lte('date', mEnd)

    const txs = txsData || []
    let mInc = 0
    let mExp = 0
    txs.forEach((tx) => {
      if (tx.type === 'income') mInc += Number(tx.amount)
      if (tx.type === 'expense') mExp += Number(tx.amount)
    })

    chartData.push({
      month: format(d, 'MMM'),
      income: mInc,
      expense: mExp,
    })
  }

  // 7. Category Expense Data (Current Month)
  const catExpenseMap = {}
  monthTx.filter(tx => tx.type === 'expense').forEach((tx) => {
    if (!catExpenseMap[tx.category_id]) {
      catExpenseMap[tx.category_id] = 0
    }
    catExpenseMap[tx.category_id] += Number(tx.amount)
  })

  // We need the category details for the doughnut chart
  const catIds = Object.keys(catExpenseMap)
  let catData = []
  if (catIds.length > 0) {
    const { data: cats } = await supabase
      .from('categories')
      .select('id, name, color')
      .in('id', catIds)
    
    if (cats) {
      catData = cats.map(c => ({
        name: c.name,
        color: c.color,
        total: catExpenseMap[c.id]
      })).sort((a, b) => b.total - a.total).slice(0, 6)
    }
  }

  const formatCurrency = (val) => Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.02em] mb-1">
            Dashboard
          </h1>
          <p className="text-[14px] text-text-secondary">
            Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'User'}. Here is your financial overview.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-bg-secondary border border-border rounded-full text-sm font-medium text-text-primary">
            {format(now, 'MMM yyyy')}
          </div>
        </div>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-bg-secondary border border-border rounded-[16px] p-5 lg:p-6 transition-transform hover:-translate-y-[2px] duration-200">
          <div className="w-10 h-10 rounded-full bg-accent-green-muted flex items-center justify-center text-accent-green mb-4">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-[14px] font-medium text-text-secondary mb-1">Total Income</p>
          <h3 className="font-bold font-mono text-accent-green flex items-baseline">
            <span className="text-[20px] mr-[2px]">₹</span>
            <span className="text-[32px] leading-none">{formatCurrency(income)}</span>
          </h3>
          <p className="text-[13px] text-text-muted mt-2">This month</p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-[16px] p-5 lg:p-6 transition-transform hover:-translate-y-[2px] duration-200">
          <div className="w-10 h-10 rounded-full bg-accent-red-muted flex items-center justify-center text-accent-red mb-4">
            <TrendingDown className="w-5 h-5" />
          </div>
          <p className="text-[14px] font-medium text-text-secondary mb-1">Total Expenses</p>
          <h3 className="font-bold font-mono text-accent-red flex items-baseline">
            <span className="text-[20px] mr-[2px]">₹</span>
            <span className="text-[32px] leading-none">{formatCurrency(expense)}</span>
          </h3>
          <p className="text-[13px] text-text-muted mt-2">This month</p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-[16px] p-5 lg:p-6 transition-transform hover:-translate-y-[2px] duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-full bg-accent-blue/10 flex items-center justify-center text-accent-blue">
              <Wallet className="w-5 h-5" />
            </div>
            {balance >= 0 ? (
              <span className="px-2.5 py-1 bg-accent-green-muted text-accent-green text-xs font-semibold rounded-full border border-accent-green/20">
                ↑ Surplus
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-accent-red-muted text-accent-red text-xs font-semibold rounded-full border border-accent-red/20">
                ↓ Deficit
              </span>
            )}
          </div>
          <p className="text-[14px] font-medium text-text-secondary mb-1">Net Balance</p>
          <h3 className="font-bold font-mono text-text-primary flex items-baseline">
            <span className="text-[20px] mr-[2px]">₹</span>
            <span className="text-[32px] leading-none">{formatCurrency(Math.abs(balance))}</span>
          </h3>
          <p className="text-[13px] text-text-muted mt-2">This month</p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-[16px] p-5 lg:p-6 transition-transform hover:-translate-y-[2px] duration-200">
          <div className="w-10 h-10 rounded-full bg-accent-amber/10 flex items-center justify-center text-accent-amber mb-4">
            <Target className="w-5 h-5" />
          </div>
          <p className="text-[14px] font-medium text-text-secondary mb-1">Active Goals</p>
          <h3 className="font-bold font-mono text-text-primary text-[32px] leading-none">{goalsCount || 0}</h3>
          <p className="text-[13px] text-text-muted mt-2">Savings in progress</p>
        </div>
      </div>

      {/* CHARTS */}
      <DashboardCharts chartData={chartData} catData={catData} />

      {/* TWO COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COL: Alerts & Goals */}
        <div className="space-y-8">
          
          {/* Budget Alerts */}
          {budgetAlerts.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
                  <AlertCircle className="w-[18px] h-[18px] text-accent-amber" />
                  Budget Alerts
                </h3>
              </div>
              <div className="space-y-6">
                {budgetAlerts.map((b) => {
                  const colorClass = b.pct >= 100 ? 'bg-accent-red' : (b.pct >= 80 ? 'bg-accent-amber' : 'bg-accent-green')
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-text-primary">{b.category_name}</span>
                        <span className="text-text-secondary font-mono text-[13px]">
                          ₹{formatCurrency(b.spent)} / ₹{formatCurrency(b.monthly_limit)}
                        </span>
                      </div>
                      <div className="h-[6px] w-full bg-bg-tertiary rounded-full overflow-hidden">
                        <div className={`h-full ${colorClass} transition-all duration-700`} style={{ width: `${b.pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Savings Goals */}
          {goalsList.length > 0 && (
            <div className="bg-bg-secondary border border-border rounded-[16px] p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[16px] font-semibold text-text-primary flex items-center gap-2">
                  <Target className="w-[18px] h-[18px] text-accent-blue" />
                  Savings Goals
                </h3>
                <Link href="/goals" className="text-[13px] text-text-secondary hover:text-text-primary font-medium flex items-center gap-1">
                  View All <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-6">
                {goalsList.map((g) => {
                  const pct = g.target_amount > 0 ? Math.min((g.saved_amount / g.target_amount) * 100, 100) : 0
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between text-[14px] mb-2">
                        <span className="font-medium text-text-primary">{g.title}</span>
                        <span className="text-text-secondary font-mono">{Math.round(pct)}%</span>
                      </div>
                      <div className="h-[8px] w-full bg-bg-tertiary rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-accent-green transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-[12px] text-text-muted font-mono">
                        <span>₹{formatCurrency(g.saved_amount)}</span>
                        <span>₹{formatCurrency(g.target_amount)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL: Recent Transactions */}
        <div className="bg-bg-secondary border border-border rounded-[16px] overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-border flex items-center justify-between">
            <h3 className="text-[16px] font-semibold text-text-primary">Recent Transactions</h3>
            <Link href="/transactions" className="text-[13px] text-text-secondary hover:text-text-primary font-medium flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          
          <div className="flex-1 p-0">
            {recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-16 text-text-muted">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Inbox className="w-8 h-8 text-text-muted" />
                </div>
                <p className="font-medium text-[15px] text-text-primary">No transactions yet</p>
                <p className="text-[13px] mt-1">Your recent activity will appear here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recent.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-bg-hover transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-10 shrink-0 border"
                        style={{ 
                          backgroundColor: `${t.categories?.color || '#8b95a9'}15`,
                          borderColor: `${t.categories?.color || '#8b95a9'}30`,
                          color: t.categories?.color || '#8b95a9'
                        }}
                      >
                        {t.type === 'income' ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[15px] text-text-primary">{t.title}</p>
                        <p className="text-[12px] text-text-secondary mt-0.5">
                          {format(new Date(t.date), 'dd MMM yyyy')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono font-medium text-[15px] ${t.type === 'income' ? 'text-accent-green' : 'text-text-primary'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{formatCurrency(t.amount)}
                      </div>
                      <p className="text-[12px] text-text-muted mt-0.5">{t.categories?.name || 'Uncategorized'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
