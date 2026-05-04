import { useState } from 'react'
import { 
  Search, 
  Plus, 
  MapPin, 
  Calendar, 
  Users,
  Filter,
  CalendarCheck,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function CampsList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [camps, setCamps] = useState([
    {
      id: 1,
      name: 'Coimbatore Eye Camp Jan 2025',
      eventType: 'Eye Camp',
      date: '2025-01-15',
      location: 'Coimbatore Community Hall',
      status: 'upcoming',
      participantCount: 0
    },
    {
      id: 2,
      name: 'Chennai Dental Camp',
      eventType: 'Dental Camp',
      date: '2025-01-20',
      location: 'Chennai Dental College',
      status: 'active',
      participantCount: 145
    },
    {
      id: 3,
      name: 'Madurai Health Check Camp',
      eventType: 'General Health Check',
      date: '2024-12-10',
      location: 'Madurai Public School',
      status: 'closed',
      participantCount: 280
    }
  ])

  const filteredCamps = camps.filter(camp => {
    const matchesSearch = camp.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || camp.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'upcoming': return 'bg-blue-100 text-blue-700'
      case 'active': return 'bg-green-100 text-green-700'
      case 'closed': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'upcoming': return <Clock className="w-4 h-4" />
      case 'active': return <Activity className="w-4 h-4" />
      case 'closed': return <CheckCircle2 className="w-4 h-4" />
      default: return <Calendar className="w-4 h-4" />
    }
  }

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">Camps</h1>
          <p className="text-gray-600 mt-1">Manage and monitor your camps</p>
        </div>
        <button 
          onClick={() => navigate('/org-dashboard/camps/create')}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create Camp
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-primary-100 text-sm font-medium mb-1">Total Camps</p>
          <p className="text-3xl font-bold">{camps.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Active</p>
          <p className="text-3xl font-bold text-gray-900">
            {camps.filter(c => c.status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Total Participants</p>
          <p className="text-3xl font-bold text-gray-900">
            {camps.reduce((sum, c) => sum + c.participantCount, 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search camps by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCamps.map((camp) => (
            <div
              key={camp.id}
              onClick={() => navigate(`/org-dashboard/camps/${camp.id}`)}
              className="border border-gray-200 rounded-2xl p-6 hover:border-primary-300 hover:shadow-lg transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(camp.status)}`}>
                    {getStatusIcon(camp.status)}
                    {formatStatus(camp.status)}
                  </span>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-primary-600 transition-colors">
                {camp.name}
              </h3>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {camp.location}
                </div>
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-gray-400" />
                  {camp.eventType}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-semibold text-gray-900">{camp.participantCount}</span>
                  <span className="text-gray-500">participants</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCamps.length === 0 && (
          <div className="p-12 text-center">
            <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No camps found</h3>
            <p className="text-gray-500">Try adjusting your search or create a new camp</p>
          </div>
        )}
      </div>
    </div>
  )
}
