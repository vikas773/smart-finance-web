import { createClient } from '@/utils/supabase/server'
import { Plus, Trash2, Tag, Search } from 'lucide-react'
import { addCategory, deleteCategory } from './actions'

export default async function CategoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: categoriesData } = await supabase
    .from('categories')
    .select(`
      *,
      transactions(count)
    `)
    .eq('user_id', user.id)
    .order('type', { ascending: false })
    .order('name')

  const categories = categoriesData || []

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      <header>
        <h1 className="text-[28px] font-semibold text-text-primary tracking-[-0.02em] mb-1">Categories</h1>
        <p className="text-[14px] text-text-secondary">Manage your income and expense categories</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD CATEGORY FORM */}
        <div className="lg:col-span-1">
          <div className="bg-bg-secondary border border-border rounded-[16px] p-6 sticky top-6">
            <h3 className="text-[16px] font-semibold text-text-primary mb-6 flex items-center gap-2">
              <Plus className="w-[18px] h-[18px] text-accent-green" />
              New Category
            </h3>
            
            <form action={addCategory} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="expense" className="peer sr-only" defaultChecked />
                  <div className="py-2.5 px-4 text-center text-[13px] font-medium rounded-[10px] border border-border bg-bg-tertiary text-text-secondary peer-checked:border-accent-red peer-checked:bg-accent-red-muted peer-checked:text-accent-red transition-all">
                    Expense
                  </div>
                </label>
                <label className="cursor-pointer">
                  <input type="radio" name="type" value="income" className="peer sr-only" />
                  <div className="py-2.5 px-4 text-center text-[13px] font-medium rounded-[10px] border border-border bg-bg-tertiary text-text-secondary peer-checked:border-accent-green peer-checked:bg-accent-green-muted peer-checked:text-accent-green transition-all">
                    Income
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Category Name</label>
                <input 
                  type="text" 
                  name="name" 
                  required 
                  placeholder="e.g., Entertainment"
                  className="w-full px-4 h-[48px] bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary placeholder:text-text-muted text-[14px] outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-text-secondary mb-1.5">Color</label>
                <input 
                  type="color" 
                  name="color" 
                  defaultValue="#00d09c"
                  className="w-full h-12 px-2 py-1 bg-bg-tertiary border border-border focus:border-accent-green focus:shadow-[0_0_0_3px_var(--accent-green-muted)] rounded-[10px] text-text-primary cursor-pointer transition-all"
                />
              </div>

              <button 
                type="submit"
                className="w-full h-[48px] bg-accent-green hover:brightness-110 active:scale-[0.98] text-[#000000] text-[14px] font-semibold rounded-[10px] transition-all"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>

        {/* CATEGORIES LIST */}
        <div className="lg:col-span-2">
          <div className="bg-bg-secondary border border-border rounded-[16px] overflow-hidden">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-[16px] font-semibold text-text-primary">Your Categories</h3>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.length === 0 ? (
                <div className="col-span-full py-16 flex flex-col items-center justify-center text-text-muted bg-bg-secondary border border-border rounded-[16px]">
                  <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-text-muted" />
                  </div>
                  <p className="font-medium text-[15px] text-text-primary">No categories found</p>
                </div>
              ) : (
                categories.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-4 rounded-[12px] border border-border bg-bg-tertiary hover:bg-bg-hover transition-colors group">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 border border-border-subtle shadow-sm bg-white"
                      >
                        <Tag className="w-5 h-5" style={{ color: c.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-[15px] text-text-primary">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${c.type === 'income' ? 'bg-accent-green-muted text-accent-green border-accent-green/20' : 'bg-accent-red-muted text-accent-red border-accent-red/20'}`}>
                            {c.type}
                          </span>
                          <span className="text-[12px] text-text-muted">
                            {c.transactions?.[0]?.count || 0} usage
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={c.id} />
                      <button 
                        type="submit"
                        className="p-2 text-text-muted hover:text-accent-red hover:bg-accent-red-muted rounded-[8px] opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete category"
                      >
                        <Trash2 className="w-[16px] h-[16px]" />
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
