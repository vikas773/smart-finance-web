import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, ArrowUpCircle, ArrowDownCircle, Search } from 'lucide-react'
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

  const { data: transactions } = await query

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('type')
    .order('name')

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Transactions</h1>
          <p className="text-slate-400">Manage your income and expenses</p>
        </div>
        <ImportCsvModal categories={categories} />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD TRANSACTION FORM */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              New Transaction
            </h3>
            
            <form action={addTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="expense" className="peer sr-only" defaultChecked />
                  <div className="py-2.5 px-4 text-center text-sm font-medium rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 peer-checked:border-red-500/50 peer-checked:bg-red-500/10 peer-checked:text-red-400 transition-all">
                    Expense
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="income" className="peer sr-only" />
                  <div className="py-2.5 px-4 text-center text-sm font-medium rounded-xl border border-slate-700 bg-slate-800/50 text-slate-400 peer-checked:border-green-500/50 peer-checked:bg-green-500/10 peer-checked:text-green-400 transition-all">
                    Income
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  required 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Title</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  placeholder="e.g., Groceries"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Amount (₹)</label>
                <input 
                  type="number" 
                  name="amount" 
                  required 
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label>
                <select 
                  name="category_id" 
                  required
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white outline-none transition-all"
                >
                  <option value="">Select Category...</option>
                  <optgroup label="Expenses">
                    {categories?.filter(c => c.type === 'expense').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Income">
                    {categories?.filter(c => c.type === 'income').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Notes (Optional)</label>
                <textarea 
                  name="note" 
                  rows="2"
                  placeholder="Additional details..."
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all resize-none"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Save Transaction
              </button>
            </form>
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">History</h3>
              
              <div className="flex bg-slate-800/50 p-1 rounded-lg">
                <a 
                  href="/transactions" 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                  All
                </a>
                <a 
                  href="/transactions?type=income" 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === 'income' ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Income
                </a>
                <a 
                  href="/transactions?type=expense" 
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${typeFilter === 'expense' ? 'bg-red-500/20 text-red-400' : 'text-slate-400 hover:text-white'}`}
                >
                  Expense
                </a>
              </div>
            </div>

            <div className="divide-y divide-slate-800/50">
              {!transactions || transactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p>No transactions found.</p>
                </div>
              ) : (
                transactions.map(t => (
                  <div key={t.id} className="p-6 hover:bg-slate-800/20 transition-colors flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-opacity-20 shrink-0"
                        style={{ backgroundColor: `${t.categories?.color || '#6366f1'}22` }}
                      >
                        {t.type === 'income' ? (
                          <ArrowDownCircle className="w-6 h-6 text-green-500" />
                        ) : (
                          <ArrowUpCircle className="w-6 h-6 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200 text-lg leading-tight">{t.title}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 mr-2">
                            {t.categories?.name || 'Uncategorized'}
                          </span>
                          {format(new Date(t.date), 'MMM d, yyyy')}
                        </p>
                        {t.note && <p className="text-sm text-slate-400 mt-1">{t.note}</p>}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      <div className={`font-bold text-lg ${t.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'income' ? '+' : '-'}₹{Number(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <form action={deleteTransaction}>
                        <input type="hidden" name="id" value={t.id} />
                        <button 
                          type="submit"
                          className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete transaction"
                        >
                          <Trash2 className="w-4 h-4" />
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
