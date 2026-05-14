import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, CreditCard, PauseCircle, PlayCircle, Clock } from 'lucide-react'
import { addSubscription, deleteSubscription, toggleSubscriptionStatus } from './actions'
import { format, differenceInDays } from 'date-fns'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: subscriptions } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('next_renewal', { ascending: true })

  const today = new Date()

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subscriptions</h1>
        <p className="text-slate-400">Track recurring payments and renewals</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD SUBSCRIPTION FORM */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              New Subscription
            </h3>
            
            <form action={addSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="e.g., Netflix, Spotify"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    required 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5">Billing Cycle</label>
                  <select 
                    name="billing_cycle" 
                    className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Next Renewal</label>
                <input 
                  type="date" 
                  name="next_renewal" 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  defaultValue="Subscription"
                  placeholder="e.g., Streaming, Software"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Add Subscription
              </button>
            </form>
          </div>
        </div>

        {/* SUBSCRIPTIONS LIST */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">Your Services</h3>
            </div>

            <div className="divide-y divide-slate-800/50">
              {!subscriptions || subscriptions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p>No active subscriptions.</p>
                </div>
              ) : (
                subscriptions.map(s => {
                  const renewalDate = new Date(s.next_renewal)
                  const daysLeft = differenceInDays(renewalDate, today)
                  const isSoon = daysLeft >= 0 && daysLeft <= 7
                  const isOverdue = daysLeft < 0

                  return (
                    <div key={s.id} className={`p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${s.status === 'paused' ? 'opacity-50' : 'hover:bg-slate-800/20'}`}>
                      <div className="flex items-start sm:items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${s.status === 'paused' ? 'bg-slate-800' : 'bg-gradient-to-br from-indigo-500 to-fuchsia-600'}`}>
                          <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-200 text-lg">{s.name}</h4>
                            {s.status === 'paused' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400">Paused</span>
                            )}
                          </div>
                          
                          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                            <span className="text-slate-300">₹{Number(s.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            <span>·</span>
                            <span className="capitalize">{s.billing_cycle}</span>
                          </p>
                          
                          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
                            {s.status === 'active' && (
                              <>
                                <Clock className={`w-3.5 h-3.5 ${isOverdue ? 'text-red-500' : (isSoon ? 'text-yellow-500' : 'text-slate-500')}`} />
                                <span className={isOverdue ? 'text-red-400' : (isSoon ? 'text-yellow-400' : 'text-slate-400')}>
                                  {isOverdue 
                                    ? `Overdue by ${Math.abs(daysLeft)} days` 
                                    : (daysLeft === 0 ? 'Renews today' : `Renews in ${daysLeft} days`)}
                                </span>
                                <span className="text-slate-600">({format(renewalDate, 'MMM d, yyyy')})</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 self-end sm:self-center border-t border-slate-800/50 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0 w-full sm:w-auto justify-end">
                        <form action={toggleSubscriptionStatus}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="currentStatus" value={s.status} />
                          <button 
                            type="submit"
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                            title={s.status === 'active' ? 'Pause subscription' : 'Resume subscription'}
                          >
                            {s.status === 'active' ? <PauseCircle className="w-5 h-5" /> : <PlayCircle className="w-5 h-5" />}
                          </button>
                        </form>
                        
                        <form action={deleteSubscription}>
                          <input type="hidden" name="id" value={s.id} />
                          <button 
                            type="submit"
                            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title="Delete subscription"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
