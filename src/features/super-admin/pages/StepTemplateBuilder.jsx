import { useState, useEffect, useRef } from 'react'
import {
  ChevronsUpDown,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  ListChecks,
  X,
  Save,
  User,
  ChevronDown,
  ChevronUp,
  Loader,
  AlertCircle
} from 'lucide-react'
import superAdminService from '../services/super-admin-service'

const FIELD_TYPE_LABELS = {
  text: 'Text',
  number: 'Number',
  dropdown: 'Dropdown',
  date: 'Date',
  boolean: 'Yes/No',
  textarea: 'Textarea',
  file: 'File Upload',
}

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'org_admin', label: 'Org Admin' },
]

const EMPTY_FORM = { stepName: '', roleRequired: 'staff', formFields: [] }
const EMPTY_FIELD = { key: '', label: '', type: 'text', options: '', required: false }

export default function StepTemplateBuilder() {
  const [eventTypes, setEventTypes] = useState([])
  const [selectedEventType, setSelectedEventType] = useState(null)
  const [steps, setSteps] = useState([])
  const [loadingTypes, setLoadingTypes] = useState(true)
  const [loadingSteps, setLoadingSteps] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStep, setEditingStep] = useState(null)
  const [expandedStep, setExpandedStep] = useState(null)

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [newField, setNewField] = useState(EMPTY_FIELD)
  const [fieldError, setFieldError] = useState('')

  // drag-to-reorder state
  const dragIndex = useRef(null)
  const [draggingId, setDraggingId] = useState(null)

  // ── fetch event types on mount ──────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTypes(true)
        const data = await superAdminService.getEventTypes()
        setEventTypes(Array.isArray(data) ? data : (data.data || []))
      } catch {
        setError('Failed to load event types.')
      } finally {
        setLoadingTypes(false)
      }
    }
    load()
  }, [])

  // ── fetch steps when event type changes ────────────────────────────────────
  const fetchSteps = async (eventTypeId) => {
    try {
      setLoadingSteps(true)
      setError(null)
      const data = await superAdminService.getStepTemplates(eventTypeId)
      const list = Array.isArray(data) ? data : (data.data || [])
      setSteps([...list].sort((a, b) => a.step_order - b.step_order))
    } catch {
      setError('Failed to load steps.')
    } finally {
      setLoadingSteps(false)
    }
  }

  const handleSelectEventType = (id) => {
    setSelectedEventType(id)
    setExpandedStep(null)
    if (id) fetchSteps(id)
    else setSteps([])
  }

  // ── open / close modal ─────────────────────────────────────────────────────
  const openModal = (step = null) => {
    setEditingStep(step)
    setFormData(
      step
        ? {
            stepName: step.step_name,
            roleRequired: step.role_required,
            formFields: Array.isArray(step.form_fields) ? [...step.form_fields] : [],
          }
        : EMPTY_FORM
    )
    setNewField(EMPTY_FIELD)
    setFieldError('')
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStep(null)
    setFormData(EMPTY_FORM)
    setFieldError('')
  }

  // ── form field management ──────────────────────────────────────────────────
  const handleAddField = () => {
    if (!newField.key.trim()) { setFieldError('Key is required.'); return }
    if (!newField.label.trim()) { setFieldError('Label is required.'); return }
    if (formData.formFields.some(f => f.key === newField.key.trim())) {
      setFieldError('A field with this key already exists.')
      return
    }
    const field = {
      key: newField.key.trim(),
      label: newField.label.trim(),
      type: newField.type,
      required: newField.required,
    }
    if (newField.type === 'dropdown' && newField.options.trim()) {
      field.options = newField.options.split(',').map(o => o.trim()).filter(Boolean)
    }
    setFormData(prev => ({ ...prev, formFields: [...prev.formFields, field] }))
    setNewField(EMPTY_FIELD)
    setFieldError('')
  }

  const removeField = (idx) =>
    setFormData(prev => ({ ...prev, formFields: prev.formFields.filter((_, i) => i !== idx) }))

  // ── save step (create / update) ────────────────────────────────────────────
  const handleSaveStep = async (e) => {
    e.preventDefault()
    if (!selectedEventType) return
    try {
      setSaving(true)
      const payload = {
        event_type_id: selectedEventType,
        step_name: formData.stepName.trim(),
        step_order: editingStep ? editingStep.step_order : steps.length + 1,
        role_required: formData.roleRequired,
        form_fields: formData.formFields,
      }
      if (editingStep) {
        await superAdminService.updateStepTemplate(editingStep.id, payload)
      } else {
        await superAdminService.createStepTemplate(payload)
      }
      await fetchSteps(selectedEventType)
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save step.')
    } finally {
      setSaving(false)
    }
  }

  // ── delete step ────────────────────────────────────────────────────────────
  const handleDelete = async (stepId) => {
    if (!window.confirm('Delete this step? This cannot be undone.')) return
    try {
      setLoadingSteps(true)
      await superAdminService.deleteStepTemplate(stepId)
      await fetchSteps(selectedEventType)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete step.')
      setLoadingSteps(false)
    }
  }

  // ── drag-to-reorder ────────────────────────────────────────────────────────
  const onDragStart = (index, id) => {
    dragIndex.current = index
    setDraggingId(id)
  }

  const onDragOver = (e, index) => {
    e.preventDefault()
    if (dragIndex.current === null || dragIndex.current === index) return
    const reordered = [...steps]
    const [moved] = reordered.splice(dragIndex.current, 1)
    reordered.splice(index, 0, moved)
    dragIndex.current = index
    setSteps(reordered)
  }

  const onDragEnd = async () => {
    setDraggingId(null)
    dragIndex.current = null
    try {
      await superAdminService.reorderStepTemplates(
        selectedEventType,
        steps.map(s => s.id)
      )
      await fetchSteps(selectedEventType)
    } catch {
      setError('Failed to save new order.')
    }
  }

  // ── render ─────────────────────────────────────────────────────────────────
  const selectedTypeName = eventTypes.find(t => t.id === selectedEventType)?.name || ''

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-poppins text-lg font-bold text-gray-900">Step Template Builder</h1>
        <p className="text-xs text-gray-500">Define steps and forms for each event type</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Event Type selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2">Select Event Type</label>
        <div className="relative max-w-sm">
          <ChevronsUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {loadingTypes ? (
            <div className="flex items-center gap-2 pl-9 py-2 text-xs text-gray-400">
              <Loader className="w-3 h-3 animate-spin" /> Loading event types…
            </div>
          ) : (
            <select
              value={selectedEventType || ''}
              onChange={(e) => handleSelectEventType(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            >
              <option value="">Choose an event type…</option>
              {eventTypes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Steps list */}
      {selectedEventType && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-poppins text-sm font-bold text-gray-900">
              Steps for <span className="text-primary-600">{selectedTypeName}</span>
            </h2>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Step
            </button>
          </div>

          <div className="p-4 space-y-2">
            {loadingSteps ? (
              <div className="flex items-center justify-center py-10 text-xs text-gray-400 gap-2">
                <Loader className="w-4 h-4 animate-spin text-primary-500" /> Loading steps…
              </div>
            ) : steps.length === 0 ? (
              <div className="text-center py-10">
                <ListChecks className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-900">No steps defined</p>
                <p className="text-xs text-gray-400 mt-1">Click "+ Add Step" to build the participant journey</p>
              </div>
            ) : (
              steps.map((step, index) => (
                <div
                  key={step.id}
                  draggable
                  onDragStart={() => onDragStart(index, step.id)}
                  onDragOver={(e) => onDragOver(e, index)}
                  onDragEnd={onDragEnd}
                  className={`border rounded-lg overflow-hidden transition-all ${
                    draggingId === step.id
                      ? 'opacity-50 border-primary-400 shadow-lg'
                      : 'border-gray-200 hover:border-primary-300'
                  }`}
                >
                  {/* Step row */}
                  <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="w-6 h-6 bg-primary-500 text-white rounded flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{step.step_name}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {step.role_required}
                        </span>
                        <span className="flex items-center gap-1">
                          <ListChecks className="w-3 h-3" />
                          {step.form_fields?.length || 0} field{step.form_fields?.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Expand */}
                      <button
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View form fields"
                      >
                        {expandedStep === step.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      {/* Edit */}
                      <button
                        onClick={() => openModal(step)}
                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Edit step"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(step.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete step"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded form fields */}
                  {expandedStep === step.id && (
                    <div className="px-4 py-3 border-t border-gray-100 bg-white">
                      {!step.form_fields?.length ? (
                        <p className="text-xs text-gray-400 italic">No form fields defined for this step.</p>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Form Fields</p>
                          {step.form_fields.map((field, fi) => (
                            <div key={fi} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-900">{field.label}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{field.key}</p>
                              </div>
                              <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">
                                  {FIELD_TYPE_LABELS[field.type] || field.type}
                                </span>
                                {field.required && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">Required</span>
                                )}
                                {field.options?.length > 0 && (
                                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px]">
                                    {field.options.length} opts
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add / Edit Step Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-poppins text-sm font-bold text-gray-900">
                {editingStep ? 'Edit Step' : 'Add New Step'}
              </h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="overflow-y-auto flex-1">
              <div className="p-5 space-y-4">

                {/* Step Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Step Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.stepName}
                    onChange={(e) => setFormData(p => ({ ...p, stepName: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                    placeholder="e.g. Registration, Doctor Checkup, Pharmacy"
                  />
                </div>

                {/* Role Required */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Role Required <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.roleRequired}
                    onChange={(e) => setFormData(p => ({ ...p, roleRequired: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                  >
                    {ROLE_OPTIONS.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>

                {/* Form Fields builder */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Form Fields</label>

                  {/* Existing fields list */}
                  {formData.formFields.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {formData.formFields.map((field, idx) => (
                        <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-gray-900">{field.label}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] font-mono text-gray-400">{field.key}</span>
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                                {FIELD_TYPE_LABELS[field.type] || field.type}
                              </span>
                              {field.required && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Required</span>
                              )}
                              {field.options?.length > 0 && (
                                <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px]">
                                  {field.options.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeField(idx)}
                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2 flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new field box */}
                  <div className="p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50/50 space-y-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Add a Field</p>

                    {fieldError && (
                      <p className="text-[10px] text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {fieldError}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">Key</label>
                        <input
                          type="text"
                          value={newField.key}
                          onChange={(e) => setNewField(p => ({ ...p, key: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="vision_right"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">Label</label>
                        <input
                          type="text"
                          value={newField.label}
                          onChange={(e) => setNewField(p => ({ ...p, label: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="Right Eye Vision"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">Type</label>
                        <select
                          value={newField.type}
                          onChange={(e) => setNewField(p => ({ ...p, type: e.target.value, options: '' }))}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
                        >
                          {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => (
                            <option key={v} value={v}>{l}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end pb-0.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newField.required}
                            onChange={(e) => setNewField(p => ({ ...p, required: e.target.checked }))}
                            className="w-3.5 h-3.5 text-primary-600 rounded focus:ring-primary-500"
                          />
                          <span className="text-xs text-gray-700">Required</span>
                        </label>
                      </div>
                    </div>

                    {newField.type === 'dropdown' && (
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">
                          Options <span className="font-normal text-gray-400">(comma-separated)</span>
                        </label>
                        <input
                          type="text"
                          value={newField.options}
                          onChange={(e) => setNewField(p => ({ ...p, options: e.target.value }))}
                          className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                          placeholder="Normal, Cataract, Glaucoma, Referred"
                        />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleAddField}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Field
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer buttons */}
              <div className="flex gap-2 px-5 py-3.5 border-t border-gray-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-60"
                >
                  {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {saving ? 'Saving…' : (editingStep ? 'Save Changes' : 'Add Step')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
