import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, RefreshCw, PauseCircle, PlayCircle, Clock } from 'lucide-react'
import { addSubscription, deleteSubscription, toggleSubscriptionStatus } from './actions'
import { format, differenceInDays } from 'date-fns'

export default async function SubscriptionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: subscriptionsData } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('next_renewal', { ascending: true })

  const subscriptions = subscriptionsData || []
  const today = new Date()

  const formatCurrency = (val) => Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header>
        <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.02em] mb-1">Subscriptions</h1>
        <p className="text-[14px] text-text-secondary">Track recurring payments and renewals</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD SUBSCRIPTION FORM */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border rounded-[16px] p-6 sticky top-6">
            <h3 className="text-[16px] font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Plus className="w-[18px] h-[18px] text-accent-green" />
              New Subscription
            </h3>
            
            <form action={addSubscription} className="space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Service Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="e.g., Netflix, Spotify"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Amount (₹)</label>
                  <input 
                    type="number" 
                    name="amount" 
                    required 
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted font-mono text-[20px] outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Billing Cycle</label>
                  <select 
                    name="billing_cycle" 
                    className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all appearance-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Next Renewal</label>
                <input 
                  type="date" 
                  name="next_renewal" 
                  required 
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Category</label>
                <input 
                  type="text" 
                  name="category" 
                  defaultValue="Subscription"
                  placeholder="e.g., Streaming, Software"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-[48px] bg-accent-green hover:brightness-110 active:scale-[0.98] text-[#000000] text-[14px] font-semibold rounded-[10px] transition-all"
              >
                Add Subscription
              </button>
            </form>
          </div>
        </div>

        {/* SUBSCRIPTIONS GRID */}
        <div className="lg:col-span-2">
          {subscriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-muted bg-bg-secondary border border-border rounded-[16px]">
              <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                <RefreshCw className="w-8 h-8 text-text-muted" />
              </div>
              <p className="font-medium text-[15px] text-text-primary">No active subscriptions</p>
              <p className="text-[13px] mt-1">Add your recurring services to track them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptions.map(s => {
                const renewalDate = new Date(s.next_renewal)
                const daysLeft = differenceInDays(renewalDate, today)
                const isSoon = daysLeft >= 0 && daysLeft <= 7
                const isOverdue = daysLeft < 0

                return (
                  <div key={s.id} className={`bg-bg-secondary border border-border rounded-[16px] p-5 flex flex-col justify-between transition-transform hover:-translate-y-[2px] duration-200 ${s.status === 'paused' ? 'opacity-50 grayscale' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-12 h-12 rounded-[12px] bg-bg-tertiary border border-border flex items-center justify-center shrink-0">
                        <span className="font-bold text-[18px] text-text-primary">{s.name.charAt(0).toUpperCase()}</span>
                      </div>
                      <div className="flex gap-1.5">
                        <form action={toggleSubscriptionStatus}>
                          <input type="hidden" name="id" value={s.id} />
                          <input type="hidden" name="currentStatus" value={s.status} />
                          <button 
                            type="submit"
                            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-tertiary rounded-[8px] transition-colors"
                            title={s.status === 'active' ? 'Pause' : 'Resume'}
                          >
                            {s.status === 'active' ? <PauseCircle className="w-[16px] h-[16px]" /> : <PlayCircle className="w-[16px] h-[16px]" />}
                          </button>
                        </form>
                        <form action={deleteSubscription}>
                          <input type="hidden" name="id" value={s.id} />
                          <button 
                            type="submit"
                            className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red-muted rounded-[8px] transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-[16px] h-[16px]" />
                          </button>
                        </form>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-[16px] text-text-primary truncate">{s.name}</h4>
                        {s.status === 'active' ? (
                          <div className="w-2 h-2 rounded-full bg-accent-green shadow-[0_0_8px_var(--accent-green)]" title="Active" />
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-bg-tertiary text-text-muted border border-border">Paused</span>
                        )}
                      </div>
                      
                      <div className="flex items-end gap-2 mb-4">
                        <span className="font-bold text-[22px] font-mono text-accent-red flex items-baseline leading-none"><span className="text-[14px] mr-[2px]">₹</span>{formatCurrency(s.amount)}</span>
                        <span className="text-[12px] text-text-secondary capitalize px-2 py-0.5 rounded-full bg-bg-tertiary border border-border">{s.billing_cycle}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-border-subtle flex items-center gap-1.5 text-[12px] font-medium">
                      {s.status === 'active' && (
                        <>
                          <Clock className={`w-[14px] h-[14px] ${isOverdue ? 'text-accent-red' : (isSoon ? 'text-accent-amber' : 'text-text-muted')}`} />
                          <span className={isOverdue ? 'text-accent-red' : (isSoon ? 'text-accent-amber' : 'text-text-muted')}>
                            {isOverdue 
                              ? `Overdue by ${Math.abs(daysLeft)} days` 
                              : (daysLeft === 0 ? 'Renews today' : `Renews in ${daysLeft} d`)}
                          </span>
                          <span className="text-text-secondary ml-auto">({format(renewalDate, 'MMM d')})</span>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
