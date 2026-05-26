import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, PieChart, Target, AlertCircle } from 'lucide-react'
import { addBudget, deleteBudget } from './actions'
import { format } from 'date-fns'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const currentMonth = format(new Date(), 'yyyy-MM')

  // Fetch budgets
  const { data: budgetsData } = await supabase
    .from('budgets')
    .select('*, categories(color)')
    .eq('user_id', user.id)
    .order('month', { ascending: false })
    .order('created_at', { ascending: false })

  const budgets = budgetsData || []

  // Fetch transactions to calculate spent amounts
  const { data: transactionsData } = await supabase
    .from('transactions')
    .select('amount, category_id, type, date')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    
  const transactions = transactionsData || []

  // Calculate spent amount for each budget
  const budgetsWithSpent = budgets.map(b => {
    const spent = transactions
      .filter(tx => tx.category_id === b.category_id && tx.date.startsWith(b.month))
      .reduce((sum, tx) => sum + Number(tx.amount), 0)
    return { ...b, spent }
  })

  // Fetch categories for the form
  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .order('name')
    
  const categories = categoriesData || []

  const formatCurrency = (val) => Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header>
        <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.02em] mb-1">Budgets</h1>
        <p className="text-[14px] text-text-secondary">Set limits and track your category spending</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD BUDGET FORM */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border rounded-[16px] p-6 sticky top-6">
            <h3 className="text-[16px] font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Plus className="w-[18px] h-[18px] text-accent-green" />
              New Budget
            </h3>
            
            <form action={addBudget} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Category</label>
                <select 
                  name="category_id" 
                  required
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all appearance-none"
                >
                  <option value="">Select Expense Category...</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Monthly Limit (₹)</label>
                <input 
                  type="number" 
                  name="monthly_limit" 
                  required 
                  step="0.01"
                  min="1"
                  placeholder="e.g., 5000"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted font-mono text-[20px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Month</label>
                <input 
                  type="month" 
                  name="month" 
                  required 
                  defaultValue={currentMonth}
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Alert Threshold (%)</label>
                <input 
                  type="number" 
                  name="alert_threshold" 
                  defaultValue="80"
                  min="1"
                  max="100"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all"
                />
                <p className="text-[12px] text-text-muted mt-1.5">Notify me when I spend this percentage.</p>
              </div>

              <button 
                type="submit"
                className="w-full h-[48px] bg-accent-green hover:brightness-110 active:scale-[0.98] text-[#000000] text-[14px] font-semibold rounded-[10px] transition-all"
              >
                Create Budget
              </button>
            </form>
          </div>
        </div>

        {/* BUDGETS LIST */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {budgetsWithSpent.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center text-center text-text-muted bg-bg-secondary border border-border rounded-[16px]">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <PieChart className="w-8 h-8 text-text-muted" />
                </div>
                <p className="font-medium text-[15px] text-text-primary">No budgets found</p>
                <p className="text-[13px] mt-1">Create one to start tracking your limits.</p>
              </div>
            ) : (
              budgetsWithSpent.map(b => {
                const pct = b.monthly_limit > 0 ? Math.min((b.spent / b.monthly_limit) * 100, 100) : 0
                const isOver = pct >= 100
                const isAlert = !isOver && pct >= b.alert_threshold
                const colorClass = isOver ? 'bg-accent-red' : (isAlert ? 'bg-accent-amber' : 'bg-accent-green')
                const textColor = isOver ? 'text-accent-red' : (isAlert ? 'text-accent-amber' : 'text-accent-green')
                
                return (
                  <div key={b.id} className="bg-bg-secondary border border-border rounded-[16px] p-6 relative group overflow-hidden transition-transform hover:-translate-y-[2px] duration-200">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <form action={deleteBudget}>
                        <input type="hidden" name="id" value={b.id} />
                        <button 
                          type="submit"
                          className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red-muted rounded-lg transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="w-[14px] h-[14px]" />
                        </button>
                      </form>
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-[16px] text-text-primary">{b.category_name}</h3>
                          <span className="text-[10px] font-medium px-2 py-0.5 bg-bg-tertiary text-text-secondary border border-border rounded-full">
                            {format(new Date(b.month + '-01'), 'MMM yyyy')}
                          </span>
                        </div>
                        <p className="text-[12px] text-text-muted">
                          Alert at {b.alert_threshold}%
                        </p>
                      </div>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${isOver ? 'bg-accent-red-muted' : (isAlert ? 'bg-accent-amber/10' : 'bg-bg-tertiary')}`}>
                        {isOver || isAlert ? (
                          <AlertCircle className={`w-[18px] h-[18px] ${isOver ? 'text-accent-red' : 'text-accent-amber'}`} />
                        ) : (
                          <Target className="w-[18px] h-[18px] text-accent-blue" />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                      <div className={`text-[20px] font-bold font-mono ${textColor}`}>
                        {Math.round(pct)}%
                      </div>
                      <div className="flex items-baseline gap-1.5 text-[13px] text-text-secondary font-mono">
                        <span className="font-bold text-[16px] text-accent-red flex items-baseline"><span className="text-[11px] mr-[1px]">₹</span>{formatCurrency(b.spent)}</span>
                        <span>/</span>
                        <span className="flex items-baseline"><span className="text-[11px] mr-[1px]">₹</span>{formatCurrency(b.monthly_limit)}</span>
                      </div>
                    </div>

                    {/* Progress Bar with Marker */}
                    <div className="relative h-[6px] w-full bg-bg-tertiary rounded-full overflow-hidden">
                      <div className={`absolute top-0 left-0 h-full ${colorClass} transition-all duration-700`} style={{ width: `${pct}%` }} />
                      <div className="absolute top-0 bottom-0 w-[2px] bg-bg-primary z-10" style={{ left: `${b.alert_threshold}%` }} title={`Alert threshold: ${b.alert_threshold}%`} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
