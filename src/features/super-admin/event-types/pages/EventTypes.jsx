import { useState } from 'react'
import {
  Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  CalendarCheck, ListChecks, Calendar, Loader, AlertCircle,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useEventTypes } from '../hooks/useEventTypes'
import EventTypeFormModal from '../components/EventTypeFormModal'
import ConfirmDialog from '../components/ConfirmDialog'
import eventTypeService from '../services/event-type-service'
import DateRangeFilter from '../../../../common/components/DateRangeFilter'

export default function EventTypes() {
  const { eventTypes, meta, loading, error, page, setPage, search, setSearch, startDate, setStartDate, endDate, setEndDate, refetch, perPage } = useEventTypes()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', active: true })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState(null)

  const [confirmDialog, setConfirmDialog] = useState({ open: false, type: null, action: null })

  const openConfirm = (type, action) => setConfirmDialog({ open: true, type, action })
  const closeConfirm = () => setConfirmDialog({ open: false, type: null, action: null })

  const handleConfirm = async () => {
    const { type, action } = confirmDialog
    try {
      setActionLoading(true)
      if (action === 'delete') {
        await eventTypeService.deleteEventType(type.id)
      } else {
        await eventTypeService.updateEventType(type.id, { active: !type.active })
      }
      await refetch()
      closeConfirm()
    } catch (err) {
      setActionError(err.response?.data?.message || `Failed to ${action} event type`)
      closeConfirm()
    } finally {
      setActionLoading(false)
    }
  }

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingType(type)
      setFormData({ name: type.name, description: type.description || '', active: Boolean(type.active) })
    } else {
      setEditingType(null)
      setFormData({ name: '', description: '', active: true })
    }
    setActionError(null)
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setActionLoading(true)
      const payload = { name: formData.name, description: formData.description, active: formData.active }
      if (editingType) {
        await eventTypeService.updateEventType(editingType.id, payload)
      } else {
        await eventTypeService.createEventType(payload)
      }
      await refetch()
      setIsModalOpen(false)
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to save event type')
    } finally {
      setActionLoading(false)
    }
  }

  const activeCount = eventTypes.filter(t => Boolean(t.active)).length
  const totalSteps = eventTypes.reduce((sum, t) => sum + (t.step_templates_count || 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Event Types</h1>
          <p className="text-xs text-gray-500">Define and manage camp event types</p>
        </div>
        <button onClick={() => handleOpenModal()} className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm hover:opacity-90 transition-all flex-shrink-0">
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Create Event Type</span>
          <span className="sm:hidden">New</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg sm:rounded-xl p-2 sm:p-3 text-white shadow-md">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </div>
            <p className="text-primary-100 text-[9px] sm:text-[11px] font-medium leading-tight">Total<br className="sm:hidden"/> Types</p>
          </div>
          <p className="text-lg sm:text-xl font-bold">{meta.total}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
              <CalendarCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-green-600" />
            </div>
            <p className="text-gray-500 text-[9px] sm:text-[11px] font-medium leading-tight">Active</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">{activeCount}</p>
        </div>
        <div className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-md sm:rounded-lg flex items-center justify-center flex-shrink-0">
              <ListChecks className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600" />
            </div>
            <p className="text-gray-500 text-[9px] sm:text-[11px] font-medium leading-tight">Steps</p>
          </div>
          <p className="text-lg sm:text-xl font-bold text-gray-900">{totalSteps}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-2 sm:p-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1 sm:max-w-xs lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search event types..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
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

        {/* ── Desktop table (md and above) ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Event Type</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Steps</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eventTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="w-4 h-4 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{type.name}</p>
                        {type.description && <p className="text-[11px] text-gray-500">{type.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-700">{type.step_templates_count || 0} steps</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${type.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {type.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(type.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => handleOpenModal(type)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => openConfirm(type, 'toggle')} disabled={actionLoading} className={`p-2 rounded-lg transition-colors ${type.active ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                        {type.active ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      </button>
                      {(type.step_templates_count || 0) === 0 && (
                        <button onClick={() => openConfirm(type, 'delete')} disabled={actionLoading} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Mobile card list (below md) ── */}
        <div className="md:hidden divide-y divide-gray-100">
          {eventTypes.map((type) => (
            <div key={type.id} className="p-3 flex flex-col gap-2">
              {/* Top row: icon + name + status badge */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CalendarCheck className="w-4 h-4 text-accent-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{type.name}</p>
                    {type.description && (
                      <p className="text-[10px] text-gray-500 line-clamp-1">{type.description}</p>
                    )}
                  </div>
                </div>
                <span className={`flex-shrink-0 inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium ${type.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {type.active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Meta row: steps + created */}
              <div className="flex items-center gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <ListChecks className="w-3 h-3 text-gray-400" />
                  {type.step_templates_count || 0} steps
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {new Date(type.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* Actions row - compact icon buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleOpenModal(type)}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
                >
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => openConfirm(type, 'toggle')}
                  disabled={actionLoading}
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-colors ${
                    type.active
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
                >
                  {type.active ? <ToggleRight className="w-3 h-3" /> : <ToggleLeft className="w-3 h-3" />}
                  {type.active ? 'Off' : 'On'}
                </button>
                {(type.step_templates_count || 0) === 0 && (
                  <button
                    onClick={() => openConfirm(type, 'delete')}
                    disabled={actionLoading}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3 h-3" /> Del
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="p-8 text-center">
            <Loader className="w-8 h-8 text-primary-500 mx-auto mb-3 animate-spin" />
            <p className="text-xs text-gray-500">Loading event types...</p>
          </div>
        )}

        {(error || actionError) && (
          <div className="p-4 mx-4 my-2 bg-red-50 border border-red-200 rounded-lg flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-700">{error || actionError}</p>
          </div>
        )}

        {!loading && !error && eventTypes.length === 0 && (
          <div className="p-8 text-center">
            <CalendarCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No event types found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search or create a new event type</p>
          </div>
        )}

        {!loading && meta.last_page > 1 && (
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[11px] text-gray-500">
              Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, meta.total)} of {meta.total}
            </p>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: meta.last_page }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-7 h-7 text-[11px] font-medium rounded-lg border transition-colors ${p === page ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(meta.last_page, p + 1))} disabled={page === meta.last_page} className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
        title={
          confirmDialog.action === 'delete'
            ? `Delete "${confirmDialog.type?.name}"?`
            : confirmDialog.type?.active
            ? `Deactivate "${confirmDialog.type?.name}"?`
            : `Activate "${confirmDialog.type?.name}"?`
        }
        message={
          confirmDialog.action === 'delete'
            ? 'This event type will be permanently removed. This action cannot be undone.'
            : confirmDialog.type?.active
            ? 'This event type will be marked as inactive and hidden from selections.'
            : 'This event type will be marked as active and available for use.'
        }
        confirmLabel={
          confirmDialog.action === 'delete'
            ? 'Delete'
            : confirmDialog.type?.active
            ? 'Deactivate'
            : 'Activate'
        }
        confirmClass={confirmDialog.action === 'delete' || confirmDialog.type?.active ? 'danger' : 'warning'}
        icon={
          confirmDialog.action === 'delete'
            ? Trash2
            : confirmDialog.type?.active
            ? ToggleRight
            : ToggleLeft
        }
      />

      {isModalOpen && (
        <EventTypeFormModal
          editingType={editingType}
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
