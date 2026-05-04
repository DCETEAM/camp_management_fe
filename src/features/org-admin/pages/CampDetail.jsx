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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/org-dashboard/camps')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">
              {camp.name}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(camp.status)}`}>
              {formatStatus(camp.status)}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {camp.location}
            </div>
            <div className="flex items-center gap-2">
              <ListChecks className="w-4 h-4" />
              {camp.eventType}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-primary-100 text-sm font-medium mb-1">Total</p>
          <p className="text-3xl font-bold">{camp.summary.total}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-900">{camp.summary.completed}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">In Progress</p>
          <p className="text-3xl font-bold text-gray-900">{camp.summary.inProgress}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Not Started</p>
          <p className="text-3xl font-bold text-gray-900">{camp.summary.notStarted}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-poppins text-xl font-bold text-gray-900 mb-4">Step Completion</h2>
          <div className="space-y-4">
            {camp.steps.map((step) => (
              <div key={step.id} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900">{step.name}</span>
                  <span className="text-sm text-gray-600">
                    {step.done} done / {step.done + step.pending} total
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all"
                    style={{ width: `${(step.done / (step.done + step.pending)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-poppins text-xl font-bold text-gray-900 mb-4">Staff</h2>
          <div className="space-y-3">
            {camp.staff.map((staff) => (
              <div key={staff.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {staff.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{staff.name}</p>
                  <p className="text-sm text-gray-500">{staff.step}</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                  {staff.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <button 
          onClick={() => navigate(`/org-dashboard/camps/${id}/staff`)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all"
        >
          <User className="w-5 h-5" />
          Assign Staff
        </button>
        <button 
          onClick={() => navigate(`/org-dashboard/camps/${id}/kiosk-token`)}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all"
        >
          <QrCode className="w-5 h-5" />
          Kiosk Token
        </button>
        <button 
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-2.5 px-5 rounded-xl hover:bg-gray-50 transition-all"
        >
          <FileText className="w-5 h-5" />
          View Report
        </button>
      </div>
    </div>
  )
}
