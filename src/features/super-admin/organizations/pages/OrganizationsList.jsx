import { useState } from 'react'
import {
  Search, Plus, Edit, ToggleLeft, ToggleRight,
  Building2, Mail, Phone, Calendar, Loader, AlertCircle,
  ChevronLeft, ChevronRight, Link2,
} from 'lucide-react'
import { useOrganizations } from '../hooks/useOrganizations'
import OrganizationFormModal from '../components/OrganizationFormModal'
import OrgEventTypesModal from '../components/OrgEventTypesModal'
import organizationService from '../services/organization-service'
import DateRangeFilter from '../../../../common/components/DateRangeFilter'

export default function OrganizationsList() {
  const { organizations, meta, loading, error, page, setPage, search, setSearch, startDate, setStartDate, endDate, setEndDate, refetch, perPage } = useOrganizations()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState(null)
  const [eventTypesOrg, setEventTypesOrg] = useState(null)
  const [formData, setFormData] = useState({ name: '', type: '', email: '', phone: '', address: '', active: true })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const handleToggleStatus = async (org) => {
    try {
      setActionLoading(true)
      await organizationService.updateOrganization(org.id, { active: !org.active })
      await refetch()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenModal = (org = null) => {
    if (org) {
      setEditingOrg(org)
      setFormData({ name: org.name, type: org.type, email: org.email, phone: org.phone || '', address: org.address || '', active: Boolean(org.active) })
    } else {
      setEditingOrg(null)
      setFormData({ name: '', type: '', email: '', phone: '', address: '', active: true })
    }
    setActionError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      if (editingOrg) {
        await organizationService.updateOrganization(editingOrg.id, formData)
      } else {
        await organizationService.createOrganization(formData)
      }
      await refetch()
      setIsModalOpen(false)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to save organization')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Organizations</h1>
          <p className="text-xs text-gray-500">Manage all organizations on the platform</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all flex-shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create Organization</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
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
          {organizations.map((org) => (
            <div key={org.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-primary-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{org.name}</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">{org.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setEventTypesOrg(org)} title="Manage allowed event types" className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Link2 className="w-4 h-4" /></button>
                  <button onClick={() => handleOpenModal(org)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleToggleStatus(org)} disabled={actionLoading} className={`p-1.5 rounded-lg transition-colors ${org.active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                    {org.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1 pl-10">
                <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Mail className="w-3 h-3 flex-shrink-0" /><span className="truncate">{org.email}</span></div>
                {org.phone && <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Phone className="w-3 h-3 flex-shrink-0" />{org.phone}</div>}
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${org.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {org.active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-gray-400"><Calendar className="w-3 h-3" />{new Date(org.created_at).toLocaleDateString()}</span>
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
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Organization</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-primary-600" />
                      </div>
                      <p className="text-xs font-semibold text-gray-900">{org.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">{org.type}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-600"><Mail className="w-3 h-3" />{org.email}</div>
                      {org.phone && <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Phone className="w-3 h-3" />{org.phone}</div>}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${org.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {org.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500"><Calendar className="w-3 h-3" />{new Date(org.created_at).toLocaleDateString()}</div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEventTypesOrg(org)} title="Manage allowed event types" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Link2 className="w-4 h-4" /></button>
                      <button onClick={() => handleOpenModal(org)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => handleToggleStatus(org)} disabled={actionLoading} className={`p-2 rounded-lg transition-colors ${org.active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                        {org.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading && <div className="p-8 text-center"><Loader className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-spin" /><p className="text-xs text-gray-500">Loading organizations...</p></div>}

        {(error || actionError) && (
          <div className="p-4 mx-4 my-2 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error || actionError}</p>
          </div>
        )}

        {!loading && !error && organizations.length === 0 && (
          <div className="p-8 text-center">
            <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No organizations found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search or create a new organization</p>
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

      {eventTypesOrg && (
        <OrgEventTypesModal
          org={eventTypesOrg}
          onClose={() => setEventTypesOrg(null)}
        />
      )}

      {isModalOpen && (
        <OrganizationFormModal
          editingOrg={editingOrg}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          onClose={() => setIsModalOpen(false)}
          actionLoading={actionLoading}
        />
      )}
    </div>
  )
}
