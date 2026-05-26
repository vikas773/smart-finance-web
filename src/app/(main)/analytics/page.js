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
  const { data: allExpensesData } = await supabase
    .from('transactions')
    .select('amount, category_id, categories(name, color)')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    
  const allExpenses = allExpensesData || []

  const catMap = {}
  allExpenses.forEach(tx => {
    if (tx.category_id && tx.categories) {
      if (!catMap[tx.category_id]) {
        catMap[tx.category_id] = { name: tx.categories.name, color: tx.categories.color, total: 0 }
      }
      catMap[tx.category_id].total += Number(tx.amount)
    }
  })
  const catBreak = Object.values(catMap).sort((a, b) => b.total - a.total).slice(0, 8)

  // 3. Income sources (all time income)
  const { data: allIncomeData } = await supabase
    .from('transactions')
    .select('amount, category_id, categories(name, color)')
    .eq('user_id', user.id)
    .eq('type', 'income')
    
  const allIncome = allIncomeData || []

  const incMap = {}
  allIncome.forEach(tx => {
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
  const { data: currentMonthExpensesData } = await supabase
    .from('transactions')
    .select('amount, date')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .gte('date', mStart)
    .lte('date', mEnd)

  const currentMonthExpenses = currentMonthExpensesData || []

  const daysInMonth = getDaysInMonth(now)
  const dailyLabels = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const dailyDataMap = {}
  currentMonthExpenses.forEach(tx => {
    const day = new Date(tx.date).getDate()
    dailyDataMap[day] = (dailyDataMap[day] || 0) + Number(tx.amount)
  })
  const dailyData = dailyLabels.map(d => dailyDataMap[d] || 0)

  const formatCurrency = (val) => Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header>
        <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.02em] mb-1">Analytics</h1>
        <p className="text-[14px] text-text-secondary">Graphical dashboards, trend analysis & spending breakdown</p>
      </header>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200">
          <p className="text-[14px] font-medium text-text-secondary mb-1">Avg Monthly Income</p>
          <h3 className="text-[28px] font-medium font-mono text-text-primary">₹{formatCurrency(avgIncome)}</h3>
          <p className="text-[13px] text-text-muted mt-2">12-month average</p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200">
          <p className="text-[14px] font-medium text-text-secondary mb-1">Avg Monthly Expense</p>
          <h3 className="text-[28px] font-medium font-mono text-text-primary">₹{formatCurrency(avgExpense)}</h3>
          <p className="text-[13px] text-text-muted mt-2">12-month average</p>
        </div>
        <div className="bg-bg-secondary border border-border rounded-[16px] p-6 transition-transform hover:-translate-y-[2px] duration-200">
          <p className="text-[14px] font-medium text-text-secondary mb-1">Savings Rate</p>
          <h3 className="text-[28px] font-medium font-mono text-accent-blue">{savingsRate.toFixed(1)}%</h3>
          <p className="text-[13px] text-text-muted mt-2">Income saved on avg</p>
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
