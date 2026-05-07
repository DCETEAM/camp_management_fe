import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Calendar, MapPin, Users, CheckCircle2,
  Clock, Activity, ListChecks, User, FileText,
  Loader, AlertCircle, RefreshCw
} from 'lucide-react'
import orgAdminService from '../services/org-admin-service'

const statusBadge = (s) => {
  switch (s) {
    case 'upcoming': return 'bg-blue-100 text-blue-700'
    case 'active':   return 'bg-green-100 text-green-700'
    case 'closed':   return 'bg-gray-100 text-gray-700'
    default:         return 'bg-gray-100 text-gray-700'
  }
}
const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const roleBadge = (r) => {
  switch (r) {
    case 'organizer': return 'bg-green-100 text-green-700'
    case 'staff':     return 'bg-orange-100 text-orange-700'
    default:          return 'bg-gray-100 text-gray-700'
  }
}

export default function CampDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [camp, setCamp]       = useState(null)
  const [summary, setSummary] = useState(null)
  const [staff, setStaff]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [campData, summaryData, staffData] = await Promise.all([
        orgAdminService.getCampDetail(id),
        orgAdminService.getCampSummary(id),
        orgAdminService.getCampStaff(id),
      ])
      setCamp(campData)
      setSummary(summaryData)
      setStaff(staffData)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load camp details.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
      <Loader className="w-5 h-5 animate-spin" /> Loading camp details…
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
      <button onClick={load} className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline">
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  )

  if (!camp) return null

  const totalSteps = summary?.step_completion ?? []

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/org-dashboard/camps')} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors mt-0.5">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-poppins text-lg font-bold text-gray-900">{camp.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(camp.status)}`}>
              {fmt(camp.status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(camp.camp_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {camp.location}
            </div>
            <div className="flex items-center gap-1.5">
              <ListChecks className="w-3 h-3" />
              {camp.event_type?.name || '—'}
            </div>
          </div>
        </div>
        <button onClick={load} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 flex-shrink-0" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-primary-100 text-xs font-medium">Total</p>
          </div>
          <p className="text-2xl font-bold">{summary?.total ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Completed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.completed ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.in_progress ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Not Started</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{summary?.not_started ?? 0}</p>
        </div>
      </div>

      {/* Step completion + Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Step Completion</h2>
          {totalSteps.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No steps configured for this event type.</p>
          ) : (
            <div className="space-y-2.5">
              {totalSteps.map((step) => {
                const total = (summary?.total ?? 0)
                const pct = total > 0 ? Math.round((step.done / total) * 100) : 0
                return (
                  <div key={step.step_template_id} className="px-3 py-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-800">{step.step_name}</span>
                      <span className="text-[11px] text-gray-500">{step.done} / {total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Assigned Staff</h2>
          {staff.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">No staff assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {staff.map((s) => (
                <div key={s.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {s.user?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{s.user?.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{s.step_template?.step_name ?? '—'}</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${roleBadge(s.user?.role)}`}>
                    {fmt(s.user?.role)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2.5">
        <button onClick={() => navigate(`/org-dashboard/camps/${id}/staff`)} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all">
          <User className="w-3.5 h-3.5" />
          Assign Staff
        </button>
        <button onClick={() => navigate(`/org-dashboard/camps/${id}/report`)} className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all">
          <FileText className="w-3.5 h-3.5" />
          View Report
        </button>
      </div>
    </div>
  )
}
