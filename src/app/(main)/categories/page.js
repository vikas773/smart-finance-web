import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Tag, Search } from 'lucide-react'
import { addCategory, deleteCategory } from './actions'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: categories } = await supabase
    .from('categories')
    .select(`
      *,
      transactions(count)
    `)
    .eq('user_id', user.id)
    .order('type', { ascending: false })
    .order('name')

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Categories</h1>
        <p className="text-slate-400">Manage your income and expense categories</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD CATEGORY FORM */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              New Category
            </h3>
            
            <form action={addCategory} className="space-y-4">
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
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Category Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="e.g., Entertainment"
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white placeholder-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Color</label>
                <input 
                  type="color" 
                  name="color" 
                  defaultValue="#6366f1"
                  className="w-full h-12 px-2 py-1 bg-slate-800/50 border border-slate-700 focus:border-indigo-500 rounded-xl text-white cursor-pointer"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>

        {/* CATEGORIES LIST */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="text-lg font-semibold text-white">Your Categories</h3>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!categories || categories.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-500">
                  <Search className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                  <p>No categories found.</p>
                </div>
              ) : (
                categories.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-800/30 hover:bg-slate-800/60 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20 shrink-0 shadow-inner"
                        style={{ backgroundColor: `${c.color}22` }}
                      >
                        <Tag className="w-5 h-5" style={{ color: c.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-200">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${c.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {c.type}
                          </span>
                          <span className="text-xs text-slate-500">
                            {c.transactions?.[0]?.count || 0} usage
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button 
                        type="submit"
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </form>
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
