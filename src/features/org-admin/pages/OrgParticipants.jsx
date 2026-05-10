import { useState, useEffect, useCallback } from 'react'
import { Search, Users, Filter, Loader, AlertCircle, RefreshCw, ChevronRight, Tent, IndianRupee } from 'lucide-react'
import { useAuth } from '../../auth/contexts/auth-context'
import DateRangeFilter from '../../../common/components/DateRangeFilter'
import api from '../../../core/interceptors/axiosInterceptor'

const statusBadge = (s) => ({
  completed:   'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  not_started: 'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600')

const fmtStatus = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function OrgParticipants() {
  const { user } = useAuth()
  const [participants, setParticipants] = useState([])
  const [camps, setCamps]               = useState([])
  const [meta, setMeta]                 = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [campFilter, setCampFilter]     = useState('')
  const [page, setPage]                 = useState(1)
  const [startDate, setStartDate]       = useState('')
  const [endDate, setEndDate]           = useState('')

  const load = useCallback(async (pg = 1) => {
    if (!user?.org_id) return
    try {
      setLoading(true)
      const res = await api.get(`/organizations/${user.org_id}/participants`, {
        params: {
          search: search || undefined,
          status: statusFilter || undefined,
          camp_id: campFilter || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
          page: pg,
        }
      })
      setParticipants(res.data.data ?? res.data)
      setMeta(res.data.meta ?? null)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [user, search, statusFilter, campFilter])

  useEffect(() => {
    if (!user?.org_id) return
    api.get('/camps', { params: { per_page: 100 } })
      .then(r => setCamps(r.data?.data ?? r.data ?? []))
      .catch(() => {})
  }, [user])

  useEffect(() => { load(1); setPage(1) }, [user, search, statusFilter, campFilter, startDate, endDate])

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">All Participants</h1>
          <p className="text-xs text-gray-500">{meta?.total ?? participants.length} across all camps</p>
        </div>
        <button onClick={() => load(page)} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, token, phone…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <select value={campFilter} onChange={e => setCampFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">All Camps</option>
            {camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            onStartChange={setStartDate}
            onEndChange={setEndDate}
            onClear={() => { setStartDate(''); setEndDate('') }}
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
          <Loader className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : participants.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
          <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No participants found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Token','Name','Age','Gender','Phone','Camp','Status','Payment','Registered'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {participants.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 font-bold text-[11px]">{p.token_number}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.age}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.gender}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.phone || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">
                      <span className="flex items-center gap-1"><Tent className="w-3 h-3 text-gray-400" />{p.camp?.name || '—'}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(p.status)}`}>
                        {fmtStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {p.payment_status === 'paid'
                        ? <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700"><IndianRupee className="w-2.5 h-2.5" />Paid</span>
                        : p.payment_status === 'pending'
                          ? <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                          : <span className="text-[10px] text-gray-400">—</span>
                      }
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-gray-500">
                      {p.registered_at ? new Date(p.registered_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'}) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => { setPage(p => p-1); load(page-1) }} disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <button onClick={() => { setPage(p => p+1); load(page+1) }} disabled={page >= meta.last_page}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
