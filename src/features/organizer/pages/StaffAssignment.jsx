import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, UserPlus, Trash2, ListChecks, Loader, AlertCircle } from 'lucide-react'
import { useAuth } from '../../auth/contexts/auth-context'
import api from '../../../core/interceptors/axiosInterceptor'

const roleBadge = (r) => {
  switch (r) {
    case 'organizer': return 'bg-green-100 text-green-700'
    case 'staff':     return 'bg-orange-100 text-orange-700'
    default:          return 'bg-gray-100 text-gray-700'
  }
}
const fmtRole = (r) => r?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || ''

export default function StaffAssignment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()

  const [camp, setCamp]               = useState(null)
  const [steps, setSteps]             = useState([])
  const [assignments, setAssignments] = useState([])
  const [orgUsers, setOrgUsers]       = useState([])
  const [selectedStepId, setSelectedStepId] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const loadAll = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [campRes, staffRes] = await Promise.all([
        api.get(`/camps/${id}`),
        api.get(`/camps/${id}/staff`),
      ])
      const campData = campRes.data
      setCamp(campData)
      setAssignments(staffRes.data)

      const [stepsRes, usersRes] = await Promise.all([
        api.get('/step-templates', { params: { event_type_id: campData.event_type_id, per_page: 100 } }),
        api.get(`/organizations/${campData.org_id}/users`),
      ])

      const allSteps = stepsRes.data?.data ?? stepsRes.data ?? []
      const sorted = Array.isArray(allSteps)
        ? allSteps.sort((a, b) => (a.step_order ?? 0) - (b.step_order ?? 0))
        : []
      setSteps(sorted)
      if (sorted.length > 0) setSelectedStepId(sorted[0].id)

      const users = Array.isArray(usersRes.data) ? usersRes.data : (usersRes.data?.data ?? [])
      setOrgUsers(users.filter(u => ['organizer', 'staff'].includes(u.role) && u.active))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadAll() }, [loadAll])

  const reloadStaff = async () => {
    const res = await api.get(`/camps/${id}/staff`)
    setAssignments(res.data)
  }

  const currentStep = steps.find(s => s.id === selectedStepId)
  const currentAssignments = assignments.filter(a => Number(a.step_template_id) === Number(selectedStepId))
  const assignedUserIds = currentAssignments.map(a => Number(a.user_id))
  const available = orgUsers.filter(u => !assignedUserIds.includes(u.id))

  const handleAssign = async () => {
    if (!selectedUserId || !selectedStepId) return
    try {
      setActionLoading(true)
      setActionError(null)
      await api.post('/camp-staff', {
        camp_id: parseInt(id),
        user_id: parseInt(selectedUserId),
        step_template_id: selectedStepId,
      })
      setSelectedUserId('')
      await reloadStaff()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to assign.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRemove = async (campStaffId) => {
    try {
      setActionLoading(true)
      setActionError(null)
      await api.delete(`/camp-staff/${campStaffId}`)
      await reloadStaff()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to remove.')
    } finally {
      setActionLoading(false)
    }
  }

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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/camp-dashboard/${id}`)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Staff Assignment</h1>
          <p className="text-xs text-gray-500">{camp?.name}</p>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-xs text-red-700">{actionError}</p>
        </div>
      )}

      {steps.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <ListChecks className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-gray-700">No steps configured</p>
          <p className="text-xs text-gray-400 mt-1">Add step templates for this event type first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Steps list */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Steps</h2>
              <div className="space-y-1.5">
                {steps.map((step) => {
                  const count = assignments.filter(a => Number(a.step_template_id) === Number(step.id)).length
                  const isActive = selectedStepId === step.id
                  return (
                    <button key={step.id} onClick={() => setSelectedStepId(step.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between ${isActive ? 'bg-primary-50 border border-primary-200 text-primary-700' : 'bg-gray-50 border border-transparent text-gray-700 hover:bg-gray-100'}`}>
                      <div className="flex items-center gap-2">
                        <ListChecks className="w-4 h-4 flex-shrink-0" />
                        <span className="text-xs font-semibold">{step.step_name}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-gray-200 rounded-full flex-shrink-0">{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Assignments panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <h2 className="font-poppins text-sm font-bold text-gray-900 mb-4">
                {currentStep?.step_name} — Assigned Staff
              </h2>

              <div className="space-y-2 mb-4 min-h-[80px]">
                {currentAssignments.length === 0 ? (
                  <div className="text-center py-6">
                    <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No staff assigned to this step yet</p>
                  </div>
                ) : currentAssignments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {(a.user?.name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{a.user?.name}</p>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${roleBadge(a.user?.role)}`}>
                          {fmtRole(a.user?.role)}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => handleRemove(a.id)} disabled={actionLoading}
                      className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-700 mb-2">Add Staff to this step</h3>
                {available.length === 0 ? (
                  <p className="text-xs text-gray-400">All eligible staff are already assigned to this step.</p>
                ) : (
                  <div className="flex gap-2">
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                      <option value="">— Select staff —</option>
                      {available.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({fmtRole(u.role)})</option>
                      ))}
                    </select>
                    <button onClick={handleAssign} disabled={!selectedUserId || actionLoading}
                      className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg disabled:opacity-50 flex-shrink-0">
                      {actionLoading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                      Assign
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
