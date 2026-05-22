import { useState, useCallback, useEffect } from 'react'
import {
  Search, Edit, Users, Mail, Building2, Calendar, Phone,
  Loader, AlertCircle, ToggleLeft, ToggleRight,
  ChevronLeft, ChevronRight, Plus,
} from 'lucide-react'
import { useUsers } from '../hooks/useUsers'
import userService from '../services/user-service'
import UserEditModal from '../components/UserEditModal'
import InviteUserModal from '../components/InviteUserModal'
import organizationService from '../../organizations/services/organization-service'
import DateRangeFilter from '../../../../common/components/DateRangeFilter'

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'super_admin': return 'bg-purple-100 text-purple-700'
    case 'org_admin':   return 'bg-blue-100 text-blue-700'
    case 'organizer':   return 'bg-green-100 text-green-700'
    case 'staff':       return 'bg-orange-100 text-orange-700'
    default:            return 'bg-gray-100 text-gray-700'
  }
}

const formatRoleName = (role) =>
  role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function AllUsers() {
  const { users, meta, loading, error, page, setPage, search, setSearch, roleFilter, setRoleFilter, orgFilter, setOrgFilter, startDate, setStartDate, endDate, setEndDate, refetch, perPage } = useUsers()
  const [organizations, setOrganizations] = useState([])

  useEffect(() => {
    organizationService.getOrganizations({ per_page: 100 }).then(data => {
      const list = Array.isArray(data) ? data : (data.data || [])
      setOrganizations(list)
    }).catch(() => {})
  }, [])

  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState(null)

  const handleToggleStatus = useCallback(async (user) => {
    try {
      await userService.updateUser(user.id, { active: !user.active })
      await refetch()
    } catch {
      /* errors surfaced by hook */
    }
  }, [refetch])

  const handleInviteUser = async (payload) => {
    setInviteError(null)
    try {
      setInviting(true)
      await userService.inviteUser(payload)
      await refetch()
      setInviteOpen(false)
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invite.')
    } finally {
      setInviting(false)
    }
  }

  const handleSaveUser = async (formData) => {
    if (!editingUser) return
    setSaveError(null)
    try {
      setSaving(true)
      await userService.updateUser(editingUser.id, formData)
      await refetch()
      setEditingUser(null)
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">All Users</h1>
          <p className="text-xs text-gray-500">Manage users across all organizations</p>
        </div>
        <button onClick={() => { setInviteError(null); setInviteOpen(true) }} className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all flex-shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white sm:w-36">
              <option value="all">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="org_admin">Org Admin</option>
              <option value="organizer">Organizer</option>
              <option value="staff">Staff</option>
            </select>
            <select value={orgFilter} onChange={(e) => setOrgFilter(e.target.value)} className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white sm:w-44">
              <option value="all">All Organizations</option>
              {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
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

        {/* Mobile card view */}
        <div className="md:hidden divide-y divide-gray-100">
          {users.map((user) => (
            <div key={user.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeClass(user.role)}`}>{formatRoleName(user.role)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEditingUser(user)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleStatus(user)} className={`p-1.5 rounded-lg transition-colors ${user.active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                    {user.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1 pl-10">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{user.email}</span></div>
                {user.phone && <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Phone className="w-3 h-3 flex-shrink-0" />{user.phone}</div>}
                <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Building2 className="w-3 h-3 flex-shrink-0" />{user.organization?.name || 'N/A'}</div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar className="w-3 h-3" />{new Date(user.created_at).toLocaleDateString('en-GB')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
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
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                        <div className="flex items-center gap-1 text-[11px] text-gray-500"><Mail className="w-3 h-3" />{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeClass(user.role)}`}>{formatRoleName(user.role)}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Building2 className="w-3 h-3" />{user.organization?.name || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Calendar className="w-3 h-3" />{new Date(user.created_at).toLocaleDateString('en-GB')}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleToggleStatus(user)} className={`p-2 rounded-lg transition-colors ${user.active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                        {user.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="p-8 text-center"><Loader className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-spin" /><p className="text-xs text-gray-500">Loading users…</p></div>}

        {error && (
          <div className="p-4 mx-4 my-2 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}

        {!loading && !error && users.length === 0 && (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No users found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        )}

        {!loading && meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
            <p className="text-[11px] text-gray-500">
              {(page - 1) * perPage + 1}–{Math.min(page * perPage, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
              <div className="hidden sm:flex items-center gap-1">
                {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-[11px] font-medium rounded-lg border transition-colors ${p === page ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                ))}
              </div>
              <span className="sm:hidden text-[11px] text-gray-500 px-1">{page} / {meta.last_page}</span>
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        )}
      </div>

      {inviteOpen && (
        <InviteUserModal
          onInvite={handleInviteUser}
          onClose={() => { setInviteOpen(false); setInviteError(null) }}
          saving={inviting}
          saveError={inviteError}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => { setEditingUser(null); setSaveError(null) }}
          saving={saving}
          saveError={saveError}
        />
      )}
    </div>
  )
}
