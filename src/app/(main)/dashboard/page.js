import { createClient } from '@/utils/supabase/server'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  Target,
  AlertCircle,
  Inbox
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
  const { data: monthTx } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', startMonth)
    .lte('date', endMonth)

  let income = 0
  let expense = 0
  monthTx?.forEach((tx) => {
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
  const { data: recent } = await supabase
    .from('transactions')
    .select('*, categories(name, color)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('id', { ascending: false })
    .limit(8)

  // 4. Budget Alerts
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', currentMonthStr)

  const budgetAlerts = []
  if (budgets && monthTx) {
    budgets.forEach((b) => {
      const spent = monthTx
        .filter((tx) => tx.category_id === b.category_id && tx.type === 'expense')
        .reduce((sum, tx) => sum + Number(tx.amount), 0)
      
      const pct = b.monthly_limit > 0 ? Math.min((spent / b.monthly_limit) * 100, 100) : 0
      if (pct >= b.alert_threshold) {
        budgetAlerts.push({ ...b, spent, pct })
      }
    })
  }

  // 5. Active Goals List
  const { data: goalsList } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(3)

  // 6. Chart Data (Last 6 months)
  const chartData = []
  for (let i = 5; i >= 0; i--) {
    const d = subMonths(now, i)
    const mStart = startOfMonth(d).toISOString()
    const mEnd = endOfMonth(d).toISOString()

    const { data: txs } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id)
      .gte('date', mStart)
      .lte('date', mEnd)

    let mInc = 0
    let mExp = 0
    txs?.forEach((tx) => {
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
  monthTx?.filter(tx => tx.type === 'expense').forEach((tx) => {
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
    
    catData = cats.map(c => ({
      name: c.name,
      color: c.color,
      total: catExpenseMap[c.id]
    })).sort((a, b) => b.total - a.total).slice(0, 6)
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">
          👋 Welcome back, {user.user_metadata?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className="text-slate-400">
          {format(now, 'EEEE, MMMM d, yyyy')} · {format(now, 'MMM yyyy')} overview
        </p>
      </header>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <ArrowDownCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Income</p>
              <h3 className="text-2xl font-bold text-white">₹{income.toLocaleString()}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">This month</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
              <ArrowUpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Total Expenses</p>
              <h3 className="text-2xl font-bold text-white">₹{expense.toLocaleString()}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">This month</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Net Balance</p>
              <h3 className={`text-2xl font-bold ${balance >= 0 ? 'text-indigo-400' : 'text-red-400'}`}>
                ₹{Math.abs(balance).toLocaleString()}
              </h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">{balance >= 0 ? '✓ Surplus' : '⚠ Deficit'}</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">Active Goals</p>
              <h3 className="text-2xl font-bold text-white">{goalsCount || 0}</h3>
            </div>
          </div>
          <p className="text-xs text-slate-500">Savings in progress</p>
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
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  Budget Alerts
                </h3>
                <span className="px-2.5 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-semibold rounded-full border border-yellow-500/20">
                  {budgetAlerts.length} Alert{budgetAlerts.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-6 space-y-5">
                {budgetAlerts.map((b) => {
                  const colorClass = b.pct >= 100 ? 'bg-red-500' : (b.pct >= 80 ? 'bg-yellow-500' : 'bg-green-500')
                  return (
                    <div key={b.id}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium text-slate-200">{b.category_name}</span>
                        <span className="text-slate-400">
                          ₹{b.spent.toLocaleString()} / ₹{Number(b.monthly_limit).toLocaleString()}
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${b.pct}%` }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Savings Goals */}
          {goalsList && goalsList.length > 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  Savings Goals
                </h3>
                <Link href="/goals" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</Link>
              </div>
              <div className="p-6 space-y-6">
                {goalsList.map((g) => {
                  const pct = g.target_amount > 0 ? Math.min((g.saved_amount / g.target_amount) * 100, 100) : 0
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold text-slate-200">{g.title}</span>
                        <span className="text-indigo-400 font-medium">{Math.round(pct)}%</span>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mb-2">
                        <span>₹{Number(g.saved_amount).toLocaleString()} saved</span>
                        <span>₹{Number(g.target_amount).toLocaleString()} goal</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div className="h-full bg-indigo-500 transition-all duration-500 relative overflow-hidden" style={{ width: `${pct}%` }}>
                          <div className="absolute inset-0 bg-white/20 w-1/2 animate-[shimmer_2s_infinite]" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL: Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
            <Link href="/transactions" className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">View All</Link>
          </div>
          
          <div className="flex-1 p-0">
            {!recent || recent.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500">
                <Inbox className="w-12 h-12 mb-3 text-slate-600" />
                <p className="font-medium">No transactions yet</p>
                <p className="text-sm">Add your first transaction</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/50">
                {recent.map((t) => (
                  <div key={t.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/20 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20 shrink-0"
                        style={{ backgroundColor: `${t.categories?.color || '#6366f1'}22` }}
                      >
                        {t.type === 'income' ? (
                          <ArrowDownCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <ArrowUpCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-200">{t.title}</p>
                        <p className="text-xs text-slate-500">
                          {t.categories?.name || 'Uncategorized'} · {format(new Date(t.date), 'dd MMM')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
