import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Sliders, Target, AlertCircle } from 'lucide-react'
import { addBudget, deleteBudget } from './actions'
import { format } from 'date-fns'

export default async function BudgetsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const currentMonth = format(new Date(), 'yyyy-MM')

  // Fetch budgets
  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(color)')
    .eq('user_id', user.id)
    .order('month', { ascending: false })
    .order('created_at', { ascending: false })

  // Fetch transactions to calculate spent amounts
  const { data: transactions } = await supabase
    .from('transactions')
    .select('amount, category_id, type, date')
    .eq('user_id', user.id)
    .eq('type', 'expense')

  // Calculate spent amount for each budget
  const budgetsWithSpent = budgets?.map(b => {
    const spent = transactions
      ?.filter(tx => tx.category_id === b.category_id && tx.date.startsWith(b.month))
      .reduce((sum, tx) => sum + Number(tx.amount), 0) || 0
    return { ...b, spent }
  })

  // Fetch categories for the form
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'expense')
    .order('name')

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Budgets</h1>
        <p className="text-slate-400">Set limits and track your category spending</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD BUDGET FORM */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              New Budget
            </h3>
            
            <form action={addBudget} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
                <select 
                  name="category_id" 
                  required
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                >
                  <option value="">Select Expense Category...</option>
                  {categories?.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Monthly Limit (₹)</label>
                <input 
                  type="number" 
                  name="monthly_limit" 
                  required 
                  step="0.01"
                  min="1"
                  placeholder="e.g., 5000"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Month</label>
                <input 
                  type="month" 
                  name="month" 
                  required 
                  defaultValue={currentMonth}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Alert Threshold (%)</label>
                <input 
                  type="number" 
                  name="alert_threshold" 
                  defaultValue="80"
                  min="1"
                  max="100"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                />
                <p className="text-xs text-slate-500 mt-1">Notify me when I spend this percentage.</p>
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Create Budget
              </button>
            </form>
          </div>
        </div>

        {/* BUDGETS LIST */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {!budgetsWithSpent || budgetsWithSpent.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                <Sliders className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No budgets found.</p>
                <p className="text-sm">Create one to start tracking limits.</p>
              </div>
            ) : (
              budgetsWithSpent.map(b => {
                const pct = b.monthly_limit > 0 ? Math.min((b.spent / b.monthly_limit) * 100, 100) : 0
                const isOver = pct >= 100
                const isAlert = !isOver && pct >= b.alert_threshold
                const colorClass = isOver ? 'bg-red-500' : (isAlert ? 'bg-yellow-500' : 'bg-green-500')
                const textColor = isOver ? 'text-red-400' : (isAlert ? 'text-yellow-400' : 'text-green-400')
                
                return (
                  <div key={b.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <form action={deleteBudget}>
                        <input type="hidden" name="id" value={b.id} />
                        <button 
                          type="submit"
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete budget"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-white">{b.category_name}</h3>
                          <span className="text-xs font-medium px-2 py-0.5 bg-slate-800 text-slate-300 rounded">
                            {format(new Date(b.month + '-01'), 'MMM yyyy')}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400">
                          Threshold at {b.alert_threshold}%
                        </p>
                      </div>
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${isOver ? 'bg-red-500/20' : (isAlert ? 'bg-yellow-500/20' : 'bg-slate-800')}`}>
                        {isOver || isAlert ? (
                          <AlertCircle className={`w-5 h-5 ${isOver ? 'text-red-500' : 'text-yellow-500'}`} />
                        ) : (
                          <Target className="w-5 h-5 text-indigo-400" />
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-end mb-2">
                      <div className={`text-2xl font-bold ${textColor}`}>
                        {Math.round(pct)}%
                      </div>
                      <div className="text-sm text-slate-400">
                        <span className="text-slate-200">₹{b.spent.toLocaleString()}</span> / ₹{Number(b.monthly_limit).toLocaleString()}
                      </div>
                    </div>

                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full ${colorClass} transition-all duration-500`} style={{ width: `${pct}%` }} />
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
