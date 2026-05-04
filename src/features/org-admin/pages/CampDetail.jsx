import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users,
  CheckCircle2,
  Clock,
  Activity,
  ListChecks,
  User,
  QrCode,
  FileText
} from 'lucide-react'

export default function CampDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [camp] = useState({
    id: id,
    name: 'Chennai Dental Camp',
    eventType: 'Dental Camp',
    date: '2025-01-20',
    location: 'Chennai Dental College',
    status: 'active',
    summary: {
      total: 145,
      completed: 89,
      inProgress: 32,
      notStarted: 24
    },
    steps: [
      { id: 1, name: 'Registration', done: 145, pending: 0 },
      { id: 2, name: 'Dental Checkup', done: 102, pending: 43 },
      { id: 3, name: 'Consultation', done: 89, pending: 56 }
    ],
    staff: [
      { id: 1, name: 'Mike Johnson', role: 'organizer', step: 'Overall Coordination' },
      { id: 2, name: 'David Brown', role: 'staff', step: 'Registration' },
      { id: 3, name: 'Sarah Williams', role: 'staff', step: 'Dental Checkup' }
    ]
  })

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'active': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/org-dashboard/camps')}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-poppins text-lg font-bold text-gray-900">{camp.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeClass(camp.status)}`}>
              {formatStatus(camp.status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3 h-3" />
              {camp.location}
            </div>
            <div className="flex items-center gap-1.5">
              <ListChecks className="w-3 h-3" />
              {camp.eventType}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-primary-100 text-xs font-medium">Total</p>
          </div>
          <p className="text-2xl font-bold">{camp.summary.total}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Completed</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{camp.summary.completed}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{camp.summary.inProgress}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-gray-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Not Started</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{camp.summary.notStarted}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Step Completion</h2>
          <div className="space-y-2.5">
            {camp.steps.map((step) => (
              <div key={step.id} className="px-3 py-2.5 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-800">{step.name}</span>
                  <span className="text-[11px] text-gray-500">
                    {step.done} done / {step.done + step.pending} total
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${(step.done / (step.done + step.pending)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Staff</h2>
          <div className="space-y-2">
            {camp.staff.map((staff) => (
              <div key={staff.id} className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {staff.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">{staff.name}</p>
                  <p className="text-[11px] text-gray-500">{staff.step}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-700">
                  {staff.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        <button 
          onClick={() => navigate(`/org-dashboard/camps/${id}/staff`)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
        >
          <User className="w-3.5 h-3.5" />
          Assign Staff
        </button>
        <button 
          onClick={() => navigate(`/org-dashboard/camps/${id}/kiosk-token`)}
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
        >
          <QrCode className="w-3.5 h-3.5" />
          Kiosk Token
        </button>
        <button 
          className="flex items-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-all"
        >
          <FileText className="w-3.5 h-3.5" />
          View Report
        </button>
      </div>
    </div>
  )
}
