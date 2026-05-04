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
    <div className="space-y-6">
      {/* Camp Header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">
            {camp?.name || 'Camp Dashboard'}
          </h1>
          {camp?.status && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(camp.status)}`}>
              {camp.status.charAt(0).toUpperCase() + camp.status.slice(1)}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
          {camp?.date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
          {camp?.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {camp.location}
            </div>
          )}
          {camp?.event_type && (
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              {camp.event_type}
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => {
          const Icon = card.icon
          if (card.gradient) {
            return (
              <div key={card.label} className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-primary-100 text-sm font-medium mb-1">{card.label}</p>
                <p className="text-3xl font-bold">{card.value}</p>
              </div>
            )
          }
          const colors = colorMap[card.color]
          return (
            <div key={card.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${colors.text}`} />
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">{card.label}</p>
              <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            </div>
          )
        })}
      </div>

      {/* Step Stats & Staff */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step-by-Step Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-poppins text-xl font-bold text-gray-900 mb-4">Step Progress</h2>
          {Array.isArray(stepStats) && stepStats.length > 0 ? (
            <div className="space-y-4">
              {stepStats.map((step, index) => {
                const total = (step.waiting || 0) + (step.done || 0)
                const pct = total > 0 ? (step.done / total) * 100 : 0
                return (
                  <div key={step.id || index} className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{step.name || step.step_name}</span>
                      <span className="text-sm text-gray-600">
                        {step.done || 0} done · {step.waiting || 0} waiting
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No step data available.</p>
          )}
        </div>

        {/* Staff on Duty */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-poppins text-xl font-bold text-gray-900 mb-4">Staff on Duty</h2>
          {Array.isArray(staff) && staff.length > 0 ? (
            <div className="space-y-3">
              {staff.map((member, index) => (
                <div key={member.id || index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {(member.name || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                    <p className="text-sm text-gray-500 truncate">{member.step_name || member.step || 'Unassigned'}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                    {member.role || 'staff'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No staff assigned yet.</p>
          )}
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => navigate(`/camp-dashboard/${id}/participants`)}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Users className="w-5 h-5" />
          All Participants
        </button>
        <button
          onClick={() => navigate(`/camp-dashboard/${id}/report`)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all"
        >
          <BarChart3 className="w-5 h-5" />
          View Report
        </button>
        <button
          onClick={() => navigate(`/camp-dashboard/${id}/participants`)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all"
        >
          <UserPlus className="w-5 h-5" />
          Register Participant
        </button>
      </div>
    </div>
  )
}
