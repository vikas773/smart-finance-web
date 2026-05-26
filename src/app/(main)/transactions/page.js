import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, TrendingUp, TrendingDown, Search } from 'lucide-react'
import { addTransaction, deleteTransaction } from './actions'
import { format } from 'date-fns'
import ImportCsvModal from '@/components/ImportCsvModal'

export default async function TransactionsPage({ searchParams }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const typeFilter = searchParams?.type || 'all'
  
  let query = supabase
    .from('transactions')
    .select('*, categories(name, color)')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .order('id', { ascending: false })

  if (typeFilter !== 'all') {
    query = query.eq('type', typeFilter)
  }

  const { data: transactionsData } = await query
  const transactions = transactionsData || []

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('type')
    .order('name')
    
  const categories = categoriesData || []

  const formatCurrency = (val) => Number(val).toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 })

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.02em] mb-1">
            Transactions
          </h1>
          <p className="text-[14px] text-text-secondary">
            Manage your income and expenses
          </p>
        </div>
        <ImportCsvModal categories={categories} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD TRANSACTION FORM */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border rounded-[16px] p-6 sticky top-6">
            <h3 className="text-[16px] font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Plus className="w-[18px] h-[18px] text-accent-green" />
              New Transaction
            </h3>
            
            <form action={addTransaction} className="space-y-5">
              <div className="grid grid-cols-2 gap-2 bg-bg-tertiary p-1 rounded-[12px]">
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="expense" className="peer sr-only" defaultChecked />
                  <div className="py-2 text-center text-[13px] font-medium rounded-[10px] text-text-muted peer-checked:bg-bg-secondary peer-checked:text-accent-red peer-checked:shadow-sm transition-all">
                    Expense
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="income" className="peer sr-only" />
                  <div className="py-2 text-center text-[13px] font-medium rounded-[10px] text-text-muted peer-checked:bg-bg-secondary peer-checked:text-accent-green peer-checked:shadow-sm transition-all">
                    Income
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g., Groceries"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount" 
                  required 
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted font-mono text-[20px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Category</label>
                <select 
                  name="category_id" 
                  required
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary text-[14px] outline-none transition-all appearance-none"
                >
                  <option value="">Select Category...</option>
                  <optgroup label="Expenses">
                    {categories.filter(c => c.type === 'expense').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Income">
                    {categories.filter(c => c.type === 'income').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Notes (Optional)</label>
                <textarea 
                  name="note" 
                  rows="2"
                  placeholder="Additional details..."
                  className="w-full p-4 bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full h-[48px] bg-accent-green hover:brightness-110 active:scale-[0.98] text-[#000000] text-[14px] font-semibold rounded-[10px] transition-all"
              >
                Add Transaction
              </button>
            </form>
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary border border-border rounded-[16px] overflow-hidden flex flex-col min-h-[500px]">
            <div className="px-6 py-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-bg-secondary sticky top-0 z-10">
              <h3 className="text-[16px] font-semibold text-text-primary">History</h3>
              
              <div className="flex bg-bg-tertiary p-1 rounded-[10px]">
                <a 
                  href="/transactions" 
                  className={`px-4 py-1.5 text-[13px] font-medium rounded-[8px] transition-colors ${typeFilter === 'all' ? 'bg-bg-secondary text-text-primary shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                >
                  All
                </a>
                <a 
                  href="/transactions?type=income" 
                  className={`px-4 py-1.5 text-[13px] font-medium rounded-[8px] transition-colors ${typeFilter === 'income' ? 'bg-bg-secondary text-accent-green shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                >
                  Income
                </a>
                <a 
                  href="/transactions?type=expense" 
                  className={`px-4 py-1.5 text-[13px] font-medium rounded-[8px] transition-colors ${typeFilter === 'expense' ? 'bg-bg-secondary text-accent-red shadow-sm' : 'text-text-muted hover:text-text-primary'}`}
                >
                  Expense
                </a>
              </div>
            </div>

            <div className="flex-1 divide-y divide-border-subtle">
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-text-muted">
                  <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="font-medium text-[15px] text-text-primary">No transactions found</p>
                  <p className="text-[13px] mt-1">Try adjusting your filters or adding a new transaction.</p>
                </div>
              ) : (
                transactions.map(t => (
                  <div key={t.id} className="p-6 hover:bg-bg-hover transition-colors flex flex-col sm:flex-row sm:items-center justify-between group gap-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-opacity-10 shrink-0 border"
                        style={{ 
                          backgroundColor: `${t.categories?.color || '#8b95a9'}15`,
                          borderColor: `${t.categories?.color || '#8b95a9'}30`,
                          color: t.categories?.color || '#8b95a9'
                        }}
                      >
                        {t.type === 'income' ? (
                          <TrendingUp className="w-[22px] h-[22px]" />
                        ) : (
                          <TrendingDown className="w-[22px] h-[22px]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-[16px] text-text-primary leading-tight">{t.title}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-bg-tertiary text-text-secondary border border-border">
                            {t.categories?.name || 'Uncategorized'}
                          </span>
                        </div>
                        <p className="text-[13px] text-text-secondary">
                          {format(new Date(t.date), 'dd MMM yyyy')}
                        </p>
                        {t.note && <p className="text-[13px] text-text-muted mt-1 italic">{t.note}</p>}
                      </div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                      <div className={`font-mono font-medium text-[16px] ${t.type === 'income' ? 'text-accent-green' : 'text-text-primary'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{formatCurrency(t.amount)}
                      </div>
                      <form action={deleteTransaction} className="sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <input type="hidden" name="id" value={t.id} />
                        <button 
                          type="submit"
                          className="px-2 py-1.5 text-[12px] font-medium text-text-muted hover:text-accent-red hover:bg-accent-red-muted rounded-md transition-all flex items-center gap-1.5"
                        >
                          <Trash2 className="w-[14px] h-[14px]" /> Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
