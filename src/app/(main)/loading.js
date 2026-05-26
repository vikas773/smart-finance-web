import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] w-full">
      <div className="w-16 h-16 relative flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
        <Loader2 className="w-6 h-6 text-indigo-400 animate-pulse" />
      </div>
      <p className="mt-4 text-slate-400 font-medium animate-pulse">Loading data...</p>
    </div>
  )
}
