import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  Clock,
  Activity,
  MapPin,
  Calendar,
  ListChecks,
  UserPlus,
  BarChart3,
} from 'lucide-react'

export default function CampDashboard() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [camp] = useState({
    id: id,
    name: 'Coimbatore Eye Camp Jan 2025',
    event_type: 'Eye Camp',
    date: '2025-01-15',
    location: 'Coimbatore Community Hall',
    status: 'active',
  })

  const [summary] = useState({
    total: 210,
    completed: 145,
    in_progress: 40,
    not_started: 25,
  })

  const [stepStats] = useState([
    { id: 1, name: 'Registration', done: 210, waiting: 0 },
    { id: 2, name: 'Vision Test', done: 180, waiting: 30 },
    { id: 3, name: 'Doctor Checkup', done: 155, waiting: 55 },
    { id: 4, name: 'Pharmacy', done: 145, waiting: 65 },
  ])

  const [staff] = useState([
    { id: 1, name: 'Dr. Ravi Kumar', role: 'organizer', step: 'Overall Coordination' },
    { id: 2, name: 'Anitha S', role: 'staff', step: 'Registration' },
    { id: 3, name: 'Dr. Meena P', role: 'staff', step: 'Vision Test' },
    { id: 4, name: 'Dr. Suresh R', role: 'staff', step: 'Doctor Checkup' },
    { id: 5, name: 'Karthik M', role: 'staff', step: 'Pharmacy' },
  ])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'active': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
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
    {
      label: 'Not Started',
      value: summary?.not_started || 0,
      icon: Clock,
      color: 'gray',
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
          {camp?.date && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
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
              {camp.event_type}
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
                  <div key={step.id || index} className="px-3 py-2.5 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-gray-800">{step.name || step.step_name}</span>
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
              {staff.map((member, index) => (
                <div key={member.id || index} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {(member.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{member.name}</p>
                    <p className="text-[11px] text-gray-500 truncate">{member.step_name || member.step || 'Unassigned'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-600 flex-shrink-0">
                    {member.role || 'staff'}
                  </span>
                </div>
              ))}
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
          onClick={() => navigate(`/camp-dashboard/${id}/report`)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
        >
          <BarChart3 className="w-3.5 h-3.5" />
          View Report
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
