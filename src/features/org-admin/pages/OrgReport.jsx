import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DateRangeFilter from '../../../common/components/DateRangeFilter'
import { Loader, AlertCircle, RefreshCw, BarChart3, ChevronRight, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '../../auth/contexts/auth-context'
import api from '../../../core/interceptors/axiosInterceptor'

const statusBadge = (s) => ({
  active:   'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  closed:   'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600')

const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

export default function OrgReport() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate]     = useState('')

  const load = () => {
    if (!user?.org_id) return
    setLoading(true)
    api.get(`/organizations/${user.org_id}/report`, {
      params: {
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }
    })
      .then(r => setRows(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [user, startDate, endDate])

  const totals = rows.reduce((acc, r) => ({
    total:       acc.total + r.total,
    completed:   acc.completed + r.completed,
    in_progress: acc.in_progress + r.in_progress,
    not_started: acc.not_started + r.not_started,
  }), { total: 0, completed: 0, in_progress: 0, not_started: 0 })

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
      <Loader className="w-5 h-5 animate-spin" /> Loading…
    </div>
  )
  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
        <div>
          <h1 className="font-poppins text-base sm:text-lg font-bold text-gray-900">Organization Report</h1>
          <p className="text-xs text-gray-500">{rows.length} camp{rows.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onClear={() => { setStartDate(''); setEndDate('') }}
          />
          <button onClick={load} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg flex-shrink-0">
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Totals */}
      {rows.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {[
            { label: 'Total', value: totals.total, color: 'text-gray-900' },
            { label: 'Completed', value: totals.completed, color: 'text-green-600' },
            { label: 'In Progress', value: totals.in_progress, color: 'text-yellow-600' },
            { label: 'Not Started', value: totals.not_started, color: 'text-gray-500' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm p-2 sm:p-3 text-center">
              <p className={`text-lg sm:text-xl font-bold ${color}`}>{value}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <BarChart3 className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No camp data yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Camp','Event Type','Date','Status','Total','Completed','In Progress','Not Started','Rate'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(r => (
                  <tr key={r.camp_id} onClick={() => navigate(`/org-dashboard/camps/${r.camp_id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-xs font-semibold text-gray-900">{r.camp_name}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />{r.location}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">{r.event_type || '—'}</td>
                    <td className="px-4 py-3 text-[11px] text-gray-500 whitespace-nowrap">
                      {r.camp_date ? new Date(r.camp_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(r.status)}`}>
                        {fmt(r.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-900">{r.total}</td>
                    <td className="px-4 py-3 text-xs text-green-600 font-semibold">{r.completed}</td>
                    <td className="px-4 py-3 text-xs text-yellow-600 font-semibold">{r.in_progress}</td>
                    <td className="px-4 py-3 text-xs text-gray-400 font-semibold">{r.not_started}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${r.completion_rate}%` }} />
                        </div>
                        <span className="text-[11px] text-gray-600 font-semibold">{r.completion_rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
