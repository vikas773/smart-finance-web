'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react'
import { bulkAddTransactions } from '@/app/(main)/transactions/actions'

export default function ImportCsvModal({ categories }) {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState(null)
  const [parsedData, setParsedData] = useState([])
  const [insights, setInsights] = useState(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState(null)

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0]
    if (!selectedFile) return
    
    setFile(selectedFile)
    setError(null)
    
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      complete: (results) => {
        try {
          analyzeData(results.data)
        } catch (err) {
          setError("Error analyzing data: " + err.message)
        }
      },
      error: (error) => {
        setError("Error parsing CSV: " + error.message)
      }
    })
  }

  const analyzeData = (data) => {
    let validRows = []
    let totalIncome = 0
    let totalExpense = 0
    let invalidCount = 0

    data.forEach(row => {
      if (!row.date || !row.title || !row.amount || !row.type) {
        invalidCount++
        return
      }

      const amount = parseFloat(row.amount)
      if (isNaN(amount)) {
        invalidCount++
        return
      }

      const type = row.type.toLowerCase().trim()
      if (type !== 'income' && type !== 'expense') {
        invalidCount++
        return
      }

      let category_id = null
      if (row.category) {
        const catName = row.category.trim().toLowerCase()
        const matchedCat = (categories || []).find(c => c.name.toLowerCase() === catName && c.type === type)
        if (matchedCat) {
          category_id = matchedCat.id
        }
      }

      let parsedDate = row.date
      if (new Date(parsedDate).toString() === 'Invalid Date') {
          invalidCount++
          return
      }

      validRows.push({
        date: new Date(parsedDate).toISOString().split('T')[0],
        title: row.title.trim(),
        amount: amount,
        type: type,
        category_id: category_id,
        note: row.note ? row.note.trim() : null
      })

      if (type === 'income') totalIncome += amount
      else totalExpense += amount
    })

    setParsedData(validRows)
    setInsights({
      totalValid: validRows.length,
      invalidCount,
      totalIncome,
      totalExpense
    })
  }

  const handleImport = async () => {
    if (parsedData.length === 0) return
    setIsImporting(true)
    setError(null)

    try {
      const result = await bulkAddTransactions(parsedData)
      if (result?.error) {
        throw new Error(result.error)
      }
      setIsOpen(false)
      setFile(null)
      setParsedData([])
      setInsights(null)
    } catch (err) {
      setError("Failed to import: " + err.message)
    } finally {
      setIsImporting(false)
    }
  }

  const formatCurrency = (val) => Number(val).toLocaleString('en-IN')

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-bg-secondary hover:bg-bg-hover text-text-primary font-medium rounded-[10px] border border-border transition-all h-[44px]"
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-primary/80 backdrop-blur-sm">
          <div className="bg-bg-secondary border border-border rounded-[16px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent-green" />
                Import Transactions
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-primary transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6 bg-bg-tertiary p-4 rounded-[12px] border border-border">
                <h4 className="text-[14px] font-semibold text-text-primary mb-2">Required CSV Format</h4>
                <p className="text-[13px] text-text-secondary mb-3">Your CSV file must include headers matching exactly:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[13px] text-text-secondary border-collapse">
                    <thead>
                      <tr className="border-b border-border text-text-primary">
                        <th className="py-2 px-2">Date</th>
                        <th className="py-2 px-2">Title</th>
                        <th className="py-2 px-2">Amount</th>
                        <th className="py-2 px-2">Type</th>
                        <th className="py-2 px-2">Category</th>
                        <th className="py-2 px-2">Note</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2 px-2 border-b border-border-subtle">YYYY-MM-DD</td>
                        <td className="py-2 px-2 border-b border-border-subtle">Groceries</td>
                        <td className="py-2 px-2 border-b border-border-subtle font-mono">150.50</td>
                        <td className="py-2 px-2 border-b border-border-subtle">expense</td>
                        <td className="py-2 px-2 border-b border-border-subtle">Food &amp; Dining</td>
                        <td className="py-2 px-2 border-b border-border-subtle">Walmart</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-border hover:border-accent-green bg-bg-tertiary/50 rounded-[12px] p-8 text-center transition-colors">
                    <Upload className="w-8 h-8 text-text-muted mx-auto mb-3" />
                    <p className="text-[14px] text-text-primary font-medium mb-1">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-[13px] text-text-muted">CSV files only</p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-accent-red-muted border border-accent-red/20 rounded-[12px] flex gap-3 text-accent-red text-[14px]">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {insights && (
                <div className="bg-accent-green-muted border border-accent-green/20 rounded-[12px] p-5 mb-4">
                  <h4 className="text-[14px] font-semibold text-accent-green mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Preview Insights
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[12px] text-text-secondary mb-1">Valid Rows</p>
                      <p className="text-[18px] font-bold text-text-primary font-mono">{insights.totalValid}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-text-secondary mb-1">Invalid Rows</p>
                      <p className="text-[18px] font-bold text-accent-red font-mono">{insights.invalidCount}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-text-secondary mb-1">Total Income</p>
                      <p className="text-[18px] font-bold text-accent-green font-mono">₹{formatCurrency(insights.totalIncome)}</p>
                    </div>
                    <div>
                      <p className="text-[12px] text-text-secondary mb-1">Total Expense</p>
                      <p className="text-[18px] font-bold text-accent-red font-mono">₹{formatCurrency(insights.totalExpense)}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            <div className="px-6 py-4 border-t border-border bg-bg-secondary flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsOpen(false)
                  setFile(null)
                  setInsights(null)
                }}
                className="px-4 h-[44px] text-[14px] font-medium text-text-primary bg-bg-tertiary border border-border hover:bg-bg-hover rounded-[10px] transition-colors"
                disabled={isImporting}
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={!insights || insights.totalValid === 0 || isImporting}
                className="px-6 h-[44px] text-[14px] font-medium text-[#000000] bg-accent-green hover:brightness-110 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed rounded-[10px] transition-all"
              >
                {isImporting ? 'Importing...' : `Import ${insights?.totalValid || 0} Transactions`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
