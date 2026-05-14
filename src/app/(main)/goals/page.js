import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Target, Trophy, PlusCircle, AlertCircle } from 'lucide-react'
import { addGoal, deleteGoal, addFunds } from './actions'
import { format, differenceInDays } from 'date-fns'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: goals } = await supabase
    .from('savings_goals')
    .select('*')
    .eq('user_id', user.id)
    .order('status', { ascending: true }) // active first, then completed
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Savings Goals</h1>
        <p className="text-slate-400">Set targets and watch your savings grow</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD GOAL FORM */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              New Goal
            </h3>
            
            <form action={addGoal} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Goal Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g., Vacation, Emergency Fund"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Target Amount (₹)</label>
                <input 
                  type="number" 
                  name="target_amount" 
                  required 
                  step="0.01"
                  min="1"
                  placeholder="e.g., 100000"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Target Date (Optional)</label>
                <input 
                  type="date" 
                  name="target_date" 
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Create Goal
              </button>
            </form>
          </div>
        </div>

        {/* GOALS LIST */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {!goals || goals.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
                <Target className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p>No savings goals.</p>
                <p className="text-sm">Start saving for your future.</p>
              </div>
            ) : (
              goals.map(g => {
                const pct = g.target_amount > 0 ? Math.min((g.saved_amount / g.target_amount) * 100, 100) : 0
                const isCompleted = g.status === 'completed'
                const targetDate = g.target_date ? new Date(g.target_date) : null
                const daysLeft = targetDate ? differenceInDays(targetDate, new Date()) : null
                
                return (
                  <div key={g.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group overflow-hidden flex flex-col">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <form action={deleteGoal}>
                        <input type="hidden" name="id" value={g.id} />
                        <button 
                          type="submit"
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </form>
                    </div>

                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg text-white">{g.title}</h3>
                          {isCompleted && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 flex items-center gap-1">
                              <Trophy className="w-3 h-3" /> Done
                            </span>
                          )}
                        </div>
                        {targetDate && !isCompleted && (
                          <p className="text-sm text-slate-400 flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" />
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Past due'}
                          </p>
                        )}
                      </div>
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full shrink-0 shadow-inner ${isCompleted ? 'bg-gradient-to-br from-green-400 to-emerald-600 shadow-green-500/20' : 'bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-indigo-500/20'}`}>
                        {isCompleted ? <Trophy className="w-6 h-6 text-white" /> : <Target className="w-6 h-6 text-white" />}
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-end">
                      <div className="flex justify-between items-end mb-2">
                        <div className={`text-3xl font-extrabold tracking-tight ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                          {Math.round(pct)}%
                        </div>
                        <div className="text-sm text-slate-400 text-right">
                          <div className="text-slate-200 font-medium">₹{Number(g.saved_amount).toLocaleString()}</div>
                          <div>of ₹{Number(g.target_amount).toLocaleString()}</div>
                        </div>
                      </div>

                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner mb-6">
                        <div className={`h-full transition-all duration-1000 relative overflow-hidden ${isCompleted ? 'bg-green-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }}>
                          {!isCompleted && <div className="absolute inset-0 bg-white/20 w-1/2 animate-[shimmer_2s_infinite]" />}
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
                            placeholder="Amount..."
                            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all text-sm"
                          />
                          <button 
                            type="submit"
                            className="px-3 py-2 bg-slate-800 hover:bg-indigo-600 text-white font-medium rounded-xl transition-all border border-slate-700 hover:border-indigo-500 flex items-center justify-center shrink-0"
                            title="Add funds"
                          >
                            <PlusCircle className="w-5 h-5" />
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
