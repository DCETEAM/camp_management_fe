import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Search,
  ArrowLeft,
  Users,
  Filter,
} from 'lucide-react'

const MOCK_PARTICIPANTS = [
  { id: 1, token_number: 'A001', name: 'Ramesh Kumar', age: 55, gender: 'Male', phone: '9876543210', current_step: 'Pharmacy', status: 'in_progress', created_at: '2025-01-15T09:00:00' },
  { id: 2, token_number: 'A002', name: 'Lakshmi S', age: 62, gender: 'Female', phone: '9876543211', current_step: '-', status: 'completed', created_at: '2025-01-15T09:02:00' },
  { id: 3, token_number: 'A003', name: 'Suresh M', age: 45, gender: 'Male', phone: '9876543212', current_step: 'Doctor Checkup', status: 'in_progress', created_at: '2025-01-15T09:05:00' },
  { id: 4, token_number: 'A004', name: 'Priya R', age: 34, gender: 'Female', phone: '9876543213', current_step: 'Vision Test', status: 'in_progress', created_at: '2025-01-15T09:08:00' },
  { id: 5, token_number: 'A005', name: 'Muthu K', age: 70, gender: 'Male', phone: '9876543214', current_step: '-', status: 'completed', created_at: '2025-01-15T09:10:00' },
  { id: 6, token_number: 'A006', name: 'Selvi P', age: 28, gender: 'Female', phone: '', current_step: '-', status: 'not_started', created_at: '2025-01-15T09:12:00' },
  { id: 7, token_number: 'A007', name: 'Ganesh V', age: 50, gender: 'Male', phone: '9876543216', current_step: '-', status: 'completed', created_at: '2025-01-15T09:15:00' },
  { id: 8, token_number: 'A008', name: 'Kavitha N', age: 41, gender: 'Female', phone: '9876543217', current_step: 'Doctor Checkup', status: 'in_progress', created_at: '2025-01-15T09:18:00' },
  { id: 9, token_number: 'A009', name: 'Bala S', age: 16, gender: 'Male', phone: '', current_step: '-', status: 'not_started', created_at: '2025-01-15T09:20:00' },
  { id: 10, token_number: 'A010', name: 'Devi M', age: 58, gender: 'Female', phone: '9876543219', current_step: '-', status: 'completed', created_at: '2025-01-15T09:22:00' },
]

export default function ParticipantList() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredParticipants = useMemo(() => {
    return MOCK_PARTICIPANTS.filter((p) => {
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.token_number.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter])

  const handleSearch = (e) => {
    e.preventDefault()
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'not_started':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/camp-dashboard/${id}`)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Participants</h1>
          <p className="text-xs text-gray-500">
            {filteredParticipants.length} participant{filteredParticipants.length !== 1 ? 's' : ''} registered
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or token number..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </form>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            >
              <option value="">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredParticipants.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gray-900 mb-1">No participants found</h3>
          <p className="text-gray-400 text-xs">
            {search || statusFilter
              ? 'Try adjusting your search or filter.'
              : 'No participants have been registered yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Token</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Age</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Current Step</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredParticipants.map((p, index) => (
                  <tr
                    key={p.id || index}
                    onClick={() => navigate(`/camp-dashboard/${id}/participants/${p.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 font-bold text-[11px]">
                        {p.token_number}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.age}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.gender}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.phone || '-'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.current_step || '-'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusBadge(p.status)}`}>
                        {formatStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-gray-500">
                      {p.created_at
                        ? new Date(p.created_at).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
