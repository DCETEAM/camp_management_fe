import React, { useState, useEffect, useCallback } from 'react'
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
import DateRangeFilter from '../../../common/components/DateRangeFilter'

export default function CampsList() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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
      if (startDate) params.start_date = startDate
      if (endDate) params.end_date = endDate
      const data = await orgAdminService.getCamps(params)
      setCamps(data.data || data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load camps')
    } finally {
      setLoading(false)
    }
  }, [searchQuery, statusFilter, startDate, endDate])

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
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Camps</h1>
          <p className="text-xs text-gray-500">Manage and monitor your camps</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all flex-shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create Camp</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg sm:rounded-xl p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <p className="text-primary-100 text-[9px] sm:text-[11px] font-medium leading-tight">Total<br className="sm:hidden"/> Camps</p>
          </div>
          <p className="text-lg sm:text-xl font-bold">{camps.length}</p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
            </div>
            <p className="text-gray-500 text-[9px] sm:text-[11px] font-medium leading-tight">Active</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {camps.filter(c => c.status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            </div>
            <p className="text-gray-500 text-[9px] sm:text-[11px] font-medium leading-tight">People</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">
            {camps.reduce((sum, c) => sum + c.participantCount, 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-2 sm:p-3 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1 lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search camps by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartChange={setStartDate}
                onEndChange={setEndDate}
                onClear={() => { setStartDate(''); setEndDate('') }}
              />
            </div>
          </div>
        </div>

        <div className="p-2 sm:p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {filteredCamps.map((camp) => (
            <div key={camp.id} className="bg-white rounded-lg sm:rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/org-dashboard/camps/${camp.id}`)}>
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 sm:p-2 rounded-md sm:rounded-lg flex-shrink-0 ${getStatusBadgeClass(camp.status).replace('text-', 'bg-').replace('700', '100')}`}>
                      {React.cloneElement(getStatusIcon(camp.status), { className: 'w-3 h-3 sm:w-4 sm:h-4' })}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-poppins text-sm font-semibold text-gray-900 truncate">{camp.name}</h3>
                      <p className="text-[10px] text-gray-500">{camp.event_type?.name || 'Unknown'}</p>
                    </div>
                  </div>
                  <span className={`flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getStatusBadgeClass(camp.status)}`}>
                    {formatStatus(camp.status)}
                  </span>
                </div>
                
                <div className="space-y-1 sm:space-y-2 text-[10px] sm:text-[11px] text-gray-600">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                    {new Date(camp.camp_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                    <span className="truncate">{camp.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
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
