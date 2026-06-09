import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  Activity,
  MapPin,
  Calendar,
  ListChecks,
  UserPlus,
  Loader,
  AlertCircle

} from 'lucide-react'
import organizerService from '../services/organizer-service'

export default function CampDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [camp, setCamp] = useState(null)
  const [summary, setSummary] = useState(null)
  const [stepStats, setStepStats] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (id) {
      fetchCampData()
    }
  }, [id])

  const fetchCampData = async () => {
    try {
      setLoading(true)
      const [campData, summaryData, stepStatsData, staffData] = await Promise.all([
        organizerService.getCampDetail(id),
        organizerService.getCampSummary(id),
        organizerService.getStepStats(id),
        organizerService.getCampStaff(id)
      ])
      setCamp(campData)
      setSummary(summaryData)
      setStepStats(stepStatsData)
      setStaff(staffData)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load camp data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'active': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-xs text-gray-500">{camp?.event_type?.name || 'Unknown'}</p>
      </div>
    )
  }

  const summaryCards = [
    {
      label: 'Total Registered',
      value: summary?.total || 0,
      icon: Users,
      gradient: true,
    },
    {
      label: 'Completed All Steps',
      value: summary?.completed || 0,
      icon: CheckCircle2,
      color: 'green',
    },
    {
      label: 'In Progress',
      value: summary?.in_progress || 0,
      icon: Activity,
      color: 'yellow',
    },
  ]

  const colorMap = {
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
  }

  return (
    <div className="space-y-4">
      {/* Camp Header */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="font-poppins text-lg lg:text-xl font-bold text-gray-900">
            {camp?.name || 'Camp Dashboard'}
          </h1>
          {camp?.status && (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeClass(camp.status)}`}>
              {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
          {camp?.camp_date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {camp?.camp_date ? new Date(camp.camp_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}
            </div>
          )}
          {camp?.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {camp.location}
            </div>
          )}
          {camp?.event_type && (
            <div className="flex items-center gap-1">
              <ListChecks className="w-3.5 h-3.5" />
              {typeof camp.event_type === 'object' ? camp.event_type.name : camp.event_type}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {summaryCards.map((card) => {
          const Icon = card.icon
          if (card.gradient) {
            return (
              <div key={card.label} className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-primary-100 text-xs font-medium">{card.label}</p>
                </div>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            )
          }
          const colors = colorMap[card.color]
          return (
            <div key={card.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-9 h-9 ${colors.bg} rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${colors.text}`} />
                </div>
                <p className="text-gray-500 text-xs font-medium">{card.label}</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Step Stats & Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Step-by-Step Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Step Progress</h2>
          {Array.isArray(stepStats) && stepStats.length > 0 ? (
            <div className="space-y-2.5">
              {stepStats.map((step, index) => {
                const total = (step.waiting || 0) + (step.done || 0)
                const pct = total > 0 ? (step.done / total) * 100 : 0
                return (
                  <div key={step.step_template_id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-900">{step.step_name}</p>
                      <span className="text-[11px] text-gray-500">
                        {step.done || 0} done · {step.waiting || 0} waiting
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-xs">No step data available.</p>
          )}
        </div>

        {/* Staff on Duty */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Staff on Duty</h2>
          {Array.isArray(staff) && staff.length > 0 ? (
            <div className="space-y-2">
              {staff.map((member, index) => {
                const name = member.user?.name || member.name || 'Unknown'
                const stepName = member.step_template?.step_name || member.step_name || member.step || '—'
                const role = member.user?.role || member.role || 'staff'
                return (
                  <div key={member.id || index} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
                      <p className="text-[11px] text-gray-500 truncate">{stepName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 flex-shrink-0 capitalize">
                      {role.replace(/_/g, ' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-xs">No staff assigned yet.</p>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => navigate(`/camp-dashboard/${id}/participants`)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
        >
          <Users className="w-3.5 h-3.5" />
          All Participants
        </button>
        <button
          onClick={() => navigate(`/camp-dashboard/${id}/participants`)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Register Participant
        </button>
      </div>
    </div>
  )
}
