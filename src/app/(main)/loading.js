import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] w-full">
      <div className="w-16 h-16 relative flex items-center justify-center">
        <div className="absolute inset-0 border-4 border-border rounded-full"></div>
        <div className="absolute inset-0 border-4 border-accent-green rounded-full border-t-transparent animate-spin"></div>
        <Loader2 className="w-6 h-6 text-accent-green animate-pulse" />
      </div>
      <p className="mt-4 text-text-muted font-medium animate-pulse">Loading data...</p>
    </div>
  )
}
