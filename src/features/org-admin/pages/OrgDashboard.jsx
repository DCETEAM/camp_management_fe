import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader, AlertCircle, Users, Tent, CheckCircle2, Activity, MapPin, Calendar, ChevronRight } from 'lucide-react'
import { useAuth } from '../../auth/contexts/auth-context'
import api from '../../../core/interceptors/axiosInterceptor'

const statusBadge = (s) => ({
  active:   'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  closed:   'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600')

const fmt = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

export default function OrgDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (!user?.org_id) return
    api.get(`/organizations/${user.org_id}/dashboard`)
      .then(r => setData(r.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [user])

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

  const cards = [
    { label: 'Total Camps',       value: data?.total_camps,        icon: Tent,         color: 'from-blue-400 to-blue-600' },
    { label: 'Active Camps',      value: data?.active_camps,       icon: Activity,     color: 'from-green-400 to-green-600' },
    { label: 'Total Participants',value: data?.total_participants,  icon: Users,        color: 'from-primary-400 to-primary-600' },
    { label: 'Completed',         value: data?.completed,          icon: CheckCircle2, color: 'from-emerald-400 to-emerald-600' },
  ]

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-poppins text-lg font-bold text-gray-900">Organization Dashboard</h1>
        <p className="text-xs text-gray-500 mt-0.5">Overview across all camps</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className={`w-9 h-9 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-3`}>
              <Icon className="w-4.5 h-4.5 text-white w-5 h-5" />
            </div>
            <p className="text-xl font-bold text-gray-900">{value ?? 0}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent Camps */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-poppins text-sm font-bold text-gray-900">Recent Camps</h2>
          <button onClick={() => navigate('/org-dashboard/camps')}
            className="text-xs text-primary-600 font-semibold hover:text-primary-700">View All</button>
        </div>
        {(data?.recent_camps ?? []).length === 0 ? (
          <div className="text-center py-10">
            <Tent className="w-8 h-8 text-gray-200 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No camps yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {data.recent_camps.map(camp => (
              <button key={camp.id} onClick={() => navigate(`/org-dashboard/camps/${camp.id}`)}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors text-left">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {camp.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-gray-900 truncate">{camp.name}</p>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(camp.status)}`}>
                      {fmt(camp.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(camp.camp_date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{camp.location}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
