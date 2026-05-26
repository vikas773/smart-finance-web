import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Target, Trophy, PlusCircle, AlertCircle } from 'lucide-react'
import { addGoal, deleteGoal, addFunds } from './actions'
import { format, differenceInDays } from 'date-fns'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: goalsData } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('status', { ascending: true }) // active first, then completed
    .order('created_at', { ascending: false })

  const goals = goalsData || []

  const formatCurrency = (val) => Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header>
        <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.02em] mb-1">Savings Goals</h1>
        <p className="text-[14px] text-text-secondary">Set targets and watch your savings grow</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD GOAL FORM */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border rounded-[16px] p-6 sticky top-6">
            <h3 className="text-[16px] font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Plus className="w-[18px] h-[18px] text-accent-green" />
              New Goal
            </h3>
            
            <form action={addGoal} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Goal Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g., Vacation, Emergency Fund"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Target Amount (₹)</label>
                <input 
                  type="number" 
                  name="target_amount" 
                  required 
                  step="0.01"
                  min="1"
                  placeholder="e.g., 100000"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted font-mono text-[20px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Target Date (Optional)</label>
                <input 
                  type="date" 
                  name="target_date" 
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-[48px] bg-accent-green hover:brightness-110 active:scale-[0.98] text-[#000000] text-[14px] font-semibold rounded-[10px] transition-all"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>

        {/* GOALS LIST */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {goals.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-text-muted bg-bg-secondary border border-border rounded-[16px]">
                <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-text-muted" />
                </div>
                <p className="font-medium text-[15px] text-text-primary">No savings goals</p>
                <p className="text-[13px] mt-1">Start saving for your future.</p>
              </div>
            ) : (
              goals.map(g => {
                const pct = g.target_amount > 0 ? Math.min((g.saved_amount / g.target_amount) * 100, 100) : 0
                const isCompleted = g.status === 'completed'
                const targetDate = g.target_date ? new Date(g.target_date) : null
                const daysLeft = targetDate ? differenceInDays(targetDate, new Date()) : null
                const isOverdue = targetDate && !isCompleted && daysLeft < 0
                
                return (
                  <div key={g.id} className={`bg-bg-secondary border border-border rounded-[16px] p-6 relative group overflow-hidden flex flex-col transition-transform hover:-translate-y-[2px] duration-200 ${isCompleted ? 'border-accent-green/30' : ''}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <form action={deleteGoal}>
                        <input type="hidden" name="id" value={g.id} />
                        <button 
                          type="submit"
                          className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red-muted rounded-[8px] transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="w-[14px] h-[14px]" />
                        </button>
                      </form>
                    </div>

                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? 'bg-accent-green-muted text-accent-green' : 'bg-accent-blue/10 text-accent-blue'}`}>
                          {isCompleted ? <Trophy className="w-[18px] h-[18px]" /> : <Target className="w-[18px] h-[18px]" />}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[16px] text-text-primary mb-0.5">{g.title}</h3>
                          {targetDate && (
                            <p className="text-[12px] text-text-secondary">
                              Target: {format(targetDate, 'dd MMM yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {isCompleted && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-green-muted text-accent-green border border-accent-green/20">
                          Done
                        </span>
                      )}
                      {isOverdue && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent-amber/10 text-accent-amber border border-accent-amber/20">
                          Overdue
                        </span>
                      )}
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                      {/* Progress Bar */}
                      <div className="h-[8px] w-full bg-bg-tertiary rounded-full overflow-hidden mb-4">
                        <div className={`h-full transition-all duration-1000 ${isCompleted ? 'bg-accent-green' : 'bg-accent-green'}`} style={{ width: `${pct}%` }} />
                      </div>

                      {/* Bottom Row */}
                      <div className="flex justify-between items-end mb-5">
                        <div className="text-[13px] text-text-secondary font-mono">
                          <span className="text-text-primary font-medium text-[15px]">₹{formatCurrency(g.saved_amount)}</span>
                          <span className="mx-1">/</span>
                          <span>₹{formatCurrency(g.target_amount)}</span>
                        </div>
                        <div className={`text-[16px] font-bold font-mono ${isCompleted ? 'text-accent-green' : 'text-text-primary'}`}>
                          {Math.round(pct)}%
                        </div>
                      </div>

                      {!isCompleted && (
                        <form action={addFunds} className="mt-auto flex gap-2">
                          <input type="hidden" name="id" value={g.id} />
                          <input 
                            type="number" 
                            name="amount" 
                            required 
                            min="1"
                            step="0.01"
                            placeholder="Add funds..."
                            className="w-full px-3 h-[40px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted outline-none transition-all text-[13px]"
                          />
                          <button 
                            type="submit"
                            className="w-[40px] h-[40px] bg-bg-tertiary hover:bg-bg-hover text-text-primary border border-border rounded-[10px] transition-colors flex items-center justify-center shrink-0"
                            title="Add funds"
                          >
                            <PlusCircle className="w-[18px] h-[18px]" />
                          </button>
                        </form>
                      )}
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
