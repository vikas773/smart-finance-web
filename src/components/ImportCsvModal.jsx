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
      complete: (results) => {
        analyzeData(results.data)
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
      // Required columns: Date, Title, Amount, Type
      if (!row.Date || !row.Title || !row.Amount || !row.Type) {
        invalidCount++
        return
      }

      const amount = parseFloat(row.Amount)
      if (isNaN(amount)) {
        invalidCount++
        return
      }

      const type = row.Type.toLowerCase().trim()
      if (type !== 'income' && type !== 'expense') {
        invalidCount++
        return
      }

      // Find matching category
      let category_id = null
      if (row.Category) {
        const catName = row.Category.trim().toLowerCase()
        const matchedCat = categories.find(c => c.name.toLowerCase() === catName && c.type === type)
        if (matchedCat) {
          category_id = matchedCat.id
        }
      }

      let parsedDate = row.Date
      // basic date check
      if (new Date(parsedDate).toString() === 'Invalid Date') {
          invalidCount++
          return
      }

      validRows.push({
        date: new Date(parsedDate).toISOString().split('T')[0], // ensure valid YYYY-MM-DD
        title: row.Title.trim(),
        amount: amount,
        type: type,
        category_id: category_id,
        note: row.Note ? row.Note.trim() : null
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
      await bulkAddTransactions(parsedData)
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

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-all"
      >
        <Upload className="w-4 h-4" />
        Import CSV
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                Import Transactions
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="mb-6 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                <h4 className="text-sm font-semibold text-slate-300 mb-2">Required CSV Format</h4>
                <p className="text-xs text-slate-400 mb-3">Your CSV file must include headers matching exactly:</p>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-400 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-300">
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
                        <td className="py-2 px-2 border-b border-slate-700/50">YYYY-MM-DD</td>
                        <td className="py-2 px-2 border-b border-slate-700/50">Groceries</td>
                        <td className="py-2 px-2 border-b border-slate-700/50">150.50</td>
                        <td className="py-2 px-2 border-b border-slate-700/50">expense</td>
                        <td className="py-2 px-2 border-b border-slate-700/50">Food &amp; Dining</td>
                        <td className="py-2 px-2 border-b border-slate-700/50">Walmart</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mb-6">
                <label className="block w-full cursor-pointer">
                  <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/20 rounded-xl p-8 text-center transition-colors">
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-sm text-white font-medium mb-1">
                      {file ? file.name : 'Click to upload or drag and drop'}
                    </p>
                    <p className="text-xs text-slate-500">CSV files only</p>
                  </div>
                  <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                </label>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-200 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {insights && (
                <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-5 mb-4">
                  <h4 className="text-sm font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Preview Insights
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Valid Rows</p>
                      <p className="text-lg font-bold text-white">{insights.totalValid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Invalid Rows</p>
                      <p className="text-lg font-bold text-red-400">{insights.invalidCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Income</p>
                      <p className="text-lg font-bold text-green-400">₹{insights.totalIncome.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Total Expense</p>
                      <p className="text-lg font-bold text-red-400">₹{insights.totalExpense.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>
            
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-900 flex justify-end gap-3">
              <button 
                onClick={() => {
                  setIsOpen(false)
                  setFile(null)
                  setInsights(null)
                }}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                disabled={isImporting}
              >
                Cancel
              </button>
              <button 
                onClick={handleImport}
                disabled={!insights || insights.totalValid === 0 || isImporting}
                className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-lg shadow-indigo-500/20 transition-all"
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
