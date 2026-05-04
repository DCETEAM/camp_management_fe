import { useState } from 'react'
import { 
  Search, 
  Edit, 
  Users,
  Mail,
  Building2,
  Calendar,
  Filter
} from 'lucide-react'

export default function AllUsers() {
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [orgFilter, setOrgFilter] = useState('all')

  const [users] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@cityeyehospital.org',
      role: 'super_admin',
      organization: 'City Eye Hospital',
      status: 'active',
      createdDate: '2024-01-10'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@cityeyehospital.org',
      role: 'org_admin',
      organization: 'City Eye Hospital',
      status: 'active',
      createdDate: '2024-01-15'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@communityhealth.org',
      role: 'organizer',
      organization: 'Community Health NGO',
      status: 'active',
      createdDate: '2024-02-20'
    },
    {
      id: 4,
      name: 'Sarah Williams',
      email: 'sarah.williams@ruralhealth.gov',
      role: 'staff',
      organization: 'Rural Health Care',
      status: 'inactive',
      createdDate: '2024-03-05'
    }
  ])

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesOrg = orgFilter === 'all' || user.organization === orgFilter
    return matchesSearch && matchesRole && matchesOrg
  })

  const getRoleBadgeClass = (role) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-100 text-purple-700'
      case 'org_admin': return 'bg-blue-100 text-blue-700'
      case 'organizer': return 'bg-green-100 text-green-700'
      case 'staff': return 'bg-orange-100 text-orange-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const formatRoleName = (role) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">All Users</h1>
          <p className="text-xs text-gray-500">Manage users across all organizations</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                <option value="all">All Roles</option>
                <option value="super_admin">Super Admin</option>
                <option value="org_admin">Org Admin</option>
                <option value="organizer">Organizer</option>
                <option value="staff">Staff</option>
              </select>
              <select
                value={orgFilter}
                onChange={(e) => setOrgFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                <option value="all">All Organizations</option>
                <option value="City Eye Hospital">City Eye Hospital</option>
                <option value="Community Health NGO">Community Health NGO</option>
                <option value="Rural Health Care">Rural Health Care</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeClass(user.role)}`}>
                      {formatRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <Building2 className="w-3 h-3" />
                      {user.organization}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {user.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(user.createdDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No users found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  )
}
