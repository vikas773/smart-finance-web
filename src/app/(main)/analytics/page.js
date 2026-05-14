import { createClient } from '@/utils/supabase/server'
import { format, subMonths, startOfMonth, endOfMonth, getDaysInMonth } from 'date-fns'
import AnalyticsCharts from './AnalyticsCharts'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const now = new Date()

  // 1. Monthly trend (12 months)
  const monthly = []
  let totalIncome12m = 0
  let totalExpense12m = 0
  let monthsWithData = 0

  for (let i = 11; i >= 0; i--) {
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

    if (mInc > 0 || mExp > 0) monthsWithData++
    totalIncome12m += mInc
    totalExpense12m += mExp

    monthly.push({
      month: format(d, 'MMM yy'),
      income: mInc,
      expense: mExp,
    })
  }

  const avgIncome = monthsWithData > 0 ? totalIncome12m / monthsWithData : 0
  const avgExpense = monthsWithData > 0 ? totalExpense12m / monthsWithData : 0
  const savingsRate = avgIncome > 0 ? ((avgIncome - avgExpense) / avgIncome) * 100 : 0

  // 2. Category breakdown (all time expense)
  const { data: allExpenses } = await supabase
    .from('transactions')
    .select('amount, category_id, categories(name, color)')
    .eq('user_id', user.id)
    .eq('type', 'expense')

  const catMap = {}
  allExpenses?.forEach(tx => {
    if (tx.category_id && tx.categories) {
      if (!catMap[tx.category_id]) {
        catMap[tx.category_id] = { name: tx.categories.name, color: tx.categories.color, total: 0 }
      }
      catMap[tx.category_id].total += Number(tx.amount)
    }
  })
  const catBreak = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 8)

  // 3. Income sources (all time income)
  const { data: allIncome } = await supabase
    .from('transactions')
    .select('amount, category_id, categories(name, color)')
    .eq('user_id', user.id)
    .eq('type', 'income')

  const incMap = {}
  allIncome?.forEach(tx => {
    if (tx.category_id && tx.categories) {
      if (!incMap[tx.category_id]) {
        incMap[tx.category_id] = { name: tx.categories.name, color: tx.categories.color, total: 0 }
      }
      incMap[tx.category_id].total += Number(tx.amount)
    }
  })
  const incSrc = Object.values(incMap).sort((a, b) => b.total - a.total).slice(0, 6)

  // 4. Daily spending this month
  const mStart = startOfMonth(now).toISOString()
  const mEnd = endOfMonth(now).toISOString()
  const { data: currentMonthExpenses } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', mStart)
    .lte('date', mEnd)

  const daysInMonth = getDaysInMonth(now)
  const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const dailyDataMap = {}
  currentMonthExpenses?.forEach(tx => {
    const day = new Date(tx.date).getDate()
    dailyDataMap[day] = (dailyDataMap[day] || 0) + Number(tx.amount)
  })
  const dailyData = dailyLabels.map(d => dailyDataMap[d] || 0)

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Analytics & Insights</h1>
        <p className="text-slate-400">Graphical dashboards, trend analysis & spending breakdown</p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <p className="text-sm font-medium text-slate-400 mb-2">Avg Monthly Income</p>
          <h3 className="text-3xl font-bold text-green-400 mb-1">₹{avgIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          <p className="text-xs text-slate-500">12-month average</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <p className="text-sm font-medium text-slate-400 mb-2">Avg Monthly Expense</p>
          <h3 className="text-3xl font-bold text-red-400 mb-1">₹{avgExpense.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
          <p className="text-xs text-slate-500">12-month average</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
          <p className="text-sm font-medium text-slate-400 mb-2">Savings Rate</p>
          <h3 className="text-3xl font-bold text-indigo-400 mb-1">{savingsRate.toFixed(1)}%</h3>
          <p className="text-xs text-slate-500">Income saved on avg</p>
        </div>
      </div>

      <AnalyticsCharts 
        monthly={monthly} 
        catBreak={catBreak} 
        incSrc={incSrc} 
        dailyLabels={dailyLabels} 
        dailyData={dailyData} 
      />
    </div>
  )
}
