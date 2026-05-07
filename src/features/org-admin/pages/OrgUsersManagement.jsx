import { useState, useEffect, useCallback } from 'react'
import {
  Search, Edit, ToggleLeft, ToggleRight,
  Users, Mail, Phone, Calendar, Loader,
  AlertCircle, ChevronLeft, ChevronRight, UserPlus,
} from 'lucide-react'
import { useAuth } from '../../auth/contexts/auth-context'
import userService from '../../super-admin/users/services/user-service'
import UserEditModal from '../../super-admin/users/components/UserEditModal'
import InviteUserModal from '../../super-admin/users/components/InviteUserModal'

const getRoleBadgeClass = (role) => {
  switch (role) {
    case 'org_admin':  return 'bg-blue-100 text-blue-700'
    case 'organizer':  return 'bg-green-100 text-green-700'
    case 'staff':      return 'bg-orange-100 text-orange-700'
    default:           return 'bg-gray-100 text-gray-700'
  }
}

const formatRoleName = (role) =>
  role?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || ''

const PER_PAGE = 15

export default function OrgUsersManagement() {
  const { user: authUser } = useAuth()
  const orgId = authUser?.org_id

  const [users, setUsers] = useState([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const [editingUser, setEditingUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchUsers = useCallback(async (currentPage, currentSearch) => {
    if (!orgId) return
    try {
      setLoading(true)
      const params = { page: currentPage, per_page: PER_PAGE, org_id: orgId }
      if (currentSearch) params.search = currentSearch
      const data = await userService.getUsers(params)
      setUsers(data.data ?? data)
      if (data.total !== undefined) {
        setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total })
      }
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.')
    } finally {
      setLoading(false)
    }
  }, [orgId])

  useEffect(() => { setPage(1) }, [search])
  useEffect(() => { fetchUsers(page, search) }, [fetchUsers, page, search])

  const refetch = useCallback(() => fetchUsers(page, search), [fetchUsers, page, search])

  const handleToggleStatus = async (user) => {
    try {
      setActionLoading(true)
      await userService.updateUser(user.id, { active: !user.active })
      await refetch()
    } catch { /* ignore */ } finally {
      setActionLoading(false)
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

  const handleInviteUser = async (payload) => {
    setInviteError(null)
    try {
      setInviting(true)
      await userService.inviteUser({ ...payload, org_id: orgId })
      await refetch()
      setInviteOpen(false)
    } catch (err) {
      setInviteError(err.response?.data?.message || 'Failed to send invite.')
    } finally {
      setInviting(false)
    }
  }

  const pages = meta.last_page <= 7
    ? Array.from({ length: meta.last_page }, (_, i) => i + 1)
    : [1, 2, '…', meta.last_page - 1, meta.last_page].filter((v, i, a) => a.indexOf(v) === i)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Users</h1>
          <p className="text-xs text-gray-500">Manage users in your organization</p>
        </div>
        <button onClick={() => { setInviteError(null); setInviteOpen(true) }} className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all flex-shrink-0">
          <UserPlus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 gap-2 text-xs text-gray-400">
            <Loader className="w-4 h-4 animate-spin" /> Loading users…
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 p-6 text-xs text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        ) : (
          <>
            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-gray-100">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeClass(user.role)}`}>{formatRoleName(user.role)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setEditingUser(user)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleToggleStatus(user)} disabled={actionLoading} className={`p-1.5 rounded-lg transition-colors ${user.active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                        {user.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 pl-10">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{user.email}</span></div>
                    {user.phone && <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Phone className="w-3 h-3 flex-shrink-0" />{user.phone}</div>}
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.active ? 'Active' : 'Inactive'}
                    </span>
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
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <p className="text-xs font-semibold text-gray-900">{user.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeClass(user.role)}`}>{formatRoleName(user.role)}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Mail className="w-3 h-3" />{user.email}</div>
                          {user.phone && <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Phone className="w-3 h-3" />{user.phone}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Calendar className="w-3 h-3" />{new Date(user.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setEditingUser(user)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => handleToggleStatus(user)} disabled={actionLoading} className={`p-2 rounded-lg transition-colors ${user.active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                            {user.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No users found</h3>
                <p className="text-xs text-gray-400">Try adjusting your search or invite a new user</p>
              </div>
            )}

            {meta.last_page > 1 && (
              <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <p className="text-[11px] text-gray-500">{meta.total} user{meta.total !== 1 ? 's' : ''}</p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-3.5 h-3.5" /></button>
                  <div className="hidden sm:flex items-center gap-1">
                    {pages.map((p, i) => p === '…'
                      ? <span key={i} className="w-7 text-center text-[11px] text-gray-400">…</span>
                      : <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-[11px] font-medium rounded-lg border transition-colors ${p === page ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
                    )}
                  </div>
                  <span className="sm:hidden text-[11px] text-gray-500 px-1">{page} / {meta.last_page}</span>
                  <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {inviteOpen && (
        <InviteUserModal
          onInvite={handleInviteUser}
          onClose={() => { setInviteOpen(false); setInviteError(null) }}
          saving={inviting}
          saveError={inviteError}
          fixedOrgId={orgId}
        />
      )}

      {editingUser && (
        <UserEditModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => { setEditingUser(null); setSaveError(null) }}
          saving={saving}
          saveError={saveError}
          fixedOrgId={orgId}
        />
      )}
    </div>
  )
}
