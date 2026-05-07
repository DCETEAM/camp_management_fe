import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DateRangeFilter from '../../../common/components/DateRangeFilter'
import { Calendar, MapPin, ListChecks, Loader, AlertCircle, ChevronRight } from 'lucide-react'
import api from '../../../core/interceptors/axiosInterceptor'

const statusBadge = (s) => {
  switch (s) {
    case 'upcoming': return 'bg-blue-100 text-blue-700'
    case 'active':   return 'bg-green-100 text-green-700'
    case 'closed':   return 'bg-gray-100 text-gray-600'
    default:         return 'bg-gray-100 text-gray-600'
  }
}
const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

export default function MyCamps() {
  const navigate = useNavigate()
  const [camps, setCamps]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')

  useEffect(() => {
    setLoading(true)
    api.get('/camps/my', { params: { start_date: startDate || undefined, end_date: endDate || undefined } })
      .then(r => setCamps(r.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load camps.'))
      .finally(() => setLoading(false))
  }, [startDate, endDate])

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
      <Loader className="w-5 h-5 animate-spin" /> Loading your camps…
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">My Assigned Camps</h1>
          <p className="text-xs text-gray-500 mt-0.5">Select a camp to open your workstation</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onClear={() => { setStartDate(''); setEndDate('') }}
          />
        </div>
      </div>

      {camps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <ListChecks className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">No camps assigned</p>
          <p className="text-xs text-gray-400 mt-1">Contact your org admin to be assigned to a camp.</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {camps.map((camp) => (
            <button
              key={camp.id}
              onClick={() => navigate(`/staff-workstation/${camp.id}/queue`)}
              className="w-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all p-4 flex items-center gap-4 text-left group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
                {camp.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 truncate">{camp.name}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(camp.status)}`}>
                    {fmt(camp.status)}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(camp.camp_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {camp.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <ListChecks className="w-3 h-3" />
                    {camp.event_type?.name}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 flex-shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
