import { useState, useEffect, useCallback } from 'react'
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
  Clock,
  Loader,
  AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import orgAdminService from '../services/org-admin-service'
import CreateCampModal from '../components/CreateCampModal'

export default function CampsList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [camps, setCamps] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)

  const fetchCamps = useCallback(async () => {
    try {
      setLoading(true)
      const params = {}
      if (statusFilter !== 'all') params.status = statusFilter
      if (searchQuery) params.search = searchQuery
      const data = await orgAdminService.getCamps(params)
      setCamps(data.data || data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load camps')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => { fetchCamps() }, [fetchCamps])

  const filteredCamps = camps

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Camps</h1>
          <p className="text-xs text-gray-500">Manage and monitor your camps</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Camp
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <p className="text-primary-100 text-xs font-medium">Total Camps</p>
          </div>
          <p className="text-2xl font-bold">{camps.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Active</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {camps.filter(c => c.status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Total Participants</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {camps.reduce((sum, c) => sum + c.participantCount, 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search camps by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredCamps.map((camp) => (
            <div key={camp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/org-dashboard/camps/${camp.id}`)}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getStatusBadgeClass(camp.status).replace('text-', 'bg-').replace('700', '100').replace('blue-100', 'blue-100').replace('green-100', 'green-100').replace('gray-100', 'gray-100')}`}>
                      {getStatusIcon(camp.status)}
                    </div>
                    <div>
                      <h3 className="font-poppins text-sm font-semibold text-gray-900">{camp.name}</h3>
                      <p className="text-[11px] text-gray-500">{camp.event_type?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadgeClass(camp.status)}`}>
                    {formatStatus(camp.status)}
                  </span>
                </div>
                
                <div className="space-y-2 text-[11px] text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {new Date(camp.camp_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {camp.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                    {camp.participant_count || 0} participants
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-8">
            <Loader className="w-12 h-12 text-primary-500 mx-auto mb-3 animate-spin" />
            <p className="text-xs text-gray-500">Loading camps...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Error</h3>
            <p className="text-xs text-gray-500">{error}</p>
          </div>
        )}

        {!loading && !error && filteredCamps.length === 0 && (
          <div className="text-center py-8">
            <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No camps found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search or create a new camp</p>
          </div>
        )}
      </div>
      {createOpen && (
        <CreateCampModal
          onClose={() => setCreateOpen(false)}
          onCreated={() => { setCreateOpen(false); fetchCamps() }}
        />
      )}
    </div>
  )
}
