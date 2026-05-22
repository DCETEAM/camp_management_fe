import { Calendar, X } from 'lucide-react'

export default function DateRangeFilter({ startDate, endDate, onStartChange, onEndChange, onClear }) {
  const hasFilter = startDate || endDate

  return (
    <div className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 transition-colors flex-shrink-0 ${hasFilter ? 'border-primary-400 bg-primary-50' : 'border-gray-200 bg-white'}`}>
      <Calendar className={`w-4 h-4 flex-shrink-0 ${hasFilter ? 'text-primary-500' : 'text-gray-400'}`} />
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[9px] font-semibold text-gray-500 uppercase tracking-tight leading-none mb-0.5">From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            className="text-[11px] sm:text-xs border-0 outline-none bg-transparent text-gray-700 w-24 sm:w-28 cursor-pointer p-0"
          />
        </div>
        <span className="text-gray-300 text-xs font-bold">|</span>
        <div className="flex flex-col">
          <span className="text-[8px] sm:text-[9px] font-semibold text-gray-500 uppercase tracking-tight leading-none mb-0.5">To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            min={startDate || undefined}
            className="text-[11px] sm:text-xs border-0 outline-none bg-transparent text-gray-700 w-24 sm:w-28 cursor-pointer p-0"
          />
        </div>
      </div>
      {hasFilter && (
        <button
          onClick={onClear}
          title="Clear date filter"
          className="ml-0.5 sm:ml-1 p-0.5 rounded-full hover:bg-primary-100 text-primary-400 hover:text-primary-600 transition-colors flex-shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}
