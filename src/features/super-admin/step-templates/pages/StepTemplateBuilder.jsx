import { useState, useEffect, useRef } from 'react'
import {
  ChevronsUpDown, Plus, Edit, Trash2, GripVertical, ListChecks,
  X, Save, User, ChevronDown, ChevronUp, Loader, AlertCircle, Lock, Users
} from 'lucide-react'
import { useStepTemplates } from '../hooks/useStepTemplates'
import stepTemplateService from '../services/step-template-service'
import eventTypeService from '../../event-types/services/event-type-service'
import ConfirmDialog from '../../event-types/components/ConfirmDialog'

const FIELD_TYPE_LABELS = {
  text: 'Text', number: 'Number', dropdown: 'Dropdown',
  date: 'Date', boolean: 'Yes/No', textarea: 'Textarea', file: 'File Upload',
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
  const [loadingTypes, setLoadingTypes] = useState(true)
  const { steps, setSteps, loading: loadingSteps, error, setError, fetchSteps } = useStepTemplates()

  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStep, setEditingStep] = useState(null)
  const [expandedStep, setExpandedStep] = useState(null)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const formDataRef = useRef(EMPTY_FORM)
  const [newField, setNewField] = useState(EMPTY_FIELD)
  const [editingFieldIdx, setEditingFieldIdx] = useState(null)
  const editingFieldIdxRef = useRef(null)
  const [fieldError, setFieldError] = useState('')
  const dragIndex = useRef(null)
  const [draggingId, setDraggingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTypes(true)
        const data = await eventTypeService.getEventTypes({ per_page: 100 })
        setEventTypes(Array.isArray(data) ? data : (data.data || []))
      } catch {
        setError('Failed to load event types.')
      } finally {
        setLoadingTypes(false)
      }
    }
    load()
  }, [setError])

  const handleSelectEventType = (id) => {
    setSelectedEventType(id)
    setExpandedStep(null)
    if (id) fetchSteps(id)
    else setSteps([])
  }

  const parseFormFields = (raw) => {
    let arr = []
    if (Array.isArray(raw)) arr = raw
    else if (typeof raw === 'string') {
      try { const p = JSON.parse(raw); arr = Array.isArray(p) ? p : [] } catch { arr = [] }
    }
    return arr.map(f => ({ ...f, options: Array.isArray(f.options) ? [...f.options] : f.options }))
  }

  const openModal = async (step = null) => {
    setNewField(EMPTY_FIELD)
    setFieldError('')
    setSaveError(null)
    editingFieldIdxRef.current = null
    setEditingFieldIdx(null)
    if (step) {
      try {
        const fresh = await stepTemplateService.getStepTemplate(step.id)
        setEditingStep(fresh)
        const fd = { stepName: fresh.step_name, roleRequired: fresh.role_required, formFields: parseFormFields(fresh.form_fields) }
        formDataRef.current = fd
        setFormData(fd)
      } catch {
        setEditingStep(step)
        const fd = step
          ? { stepName: step.step_name, roleRequired: step.role_required, formFields: parseFormFields(step.form_fields) }
          : EMPTY_FORM
        formDataRef.current = fd
        setFormData(fd)
      }
    } else {
      setEditingStep(null)
      formDataRef.current = EMPTY_FORM
      setFormData(EMPTY_FORM)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingStep(null)
    formDataRef.current = EMPTY_FORM
    setFormData(EMPTY_FORM)
    setNewField(EMPTY_FIELD)
    editingFieldIdxRef.current = null
    setEditingFieldIdx(null)
    setFieldError('')
    setSaveError(null)
  }

  const handleAddField = () => {
    if (!newField.key.trim()) { setFieldError('Key is required.'); return }
    if (!newField.label.trim()) { setFieldError('Label is required.'); return }
    const currentFields = formDataRef.current.formFields
    const currentEditIdx = editingFieldIdxRef.current
    const isDuplicateKey = currentFields.some((f, i) => f.key === newField.key.trim() && i !== currentEditIdx)
    if (isDuplicateKey) { setFieldError('A field with this key already exists.'); return }
    const field = { key: newField.key.trim(), label: newField.label.trim(), type: newField.type, required: newField.required }
    if (newField.type === 'dropdown' && newField.options.trim()) {
      field.options = newField.options.split(',').map(o => o.trim()).filter(Boolean)
    }
    if (currentEditIdx !== null) {
      const updatedFields = currentFields.map((f, i) => i === currentEditIdx ? field : f)
      const updated = { ...formDataRef.current, formFields: updatedFields }
      formDataRef.current = updated
      setFormData(updated)
      editingFieldIdxRef.current = null
      setEditingFieldIdx(null)
    } else {
      const updated = { ...formDataRef.current, formFields: [...currentFields, field] }
      formDataRef.current = updated
      setFormData(updated)
    }
    setNewField(EMPTY_FIELD)
    setFieldError('')
  }

  const removeField = (idx) => {
    const updated = { ...formDataRef.current, formFields: formDataRef.current.formFields.filter((_, i) => i !== idx) }
    formDataRef.current = updated
    setFormData(updated)
    if (editingFieldIdxRef.current === idx) {
      editingFieldIdxRef.current = null
      setEditingFieldIdx(null)
      setNewField(EMPTY_FIELD)
    }
  }

  const editField = (idx) => {
    const f = formDataRef.current.formFields[idx]
    editingFieldIdxRef.current = idx
    setEditingFieldIdx(idx)
    setNewField({
      key: f.key,
      label: f.label,
      type: f.type,
      required: f.required ?? false,
      options: Array.isArray(f.options) ? f.options.join(', ') : (f.options || ''),
    })
    setFieldError('')
  }

  const stepHasResponses = (editingStep?.step_responses_count || 0) > 0

  const handleSaveStep = async (e) => {
    e.preventDefault()
    if (!selectedEventType) return
    setSaveError(null)
    try {
      setSaving(true)
      const current = formDataRef.current
      if (editingStep) {
        const payload = {
          step_name: current.stepName.trim(),
          step_order: editingStep.step_order,
          role_required: current.roleRequired,
        }
        if (!stepHasResponses) {
          payload.form_fields = current.formFields
        }
        await stepTemplateService.updateStepTemplate(editingStep.id, payload)
      } else {
        await stepTemplateService.createStepTemplate({
          event_type_id: selectedEventType,
          step_name: current.stepName.trim(),
          step_order: steps.length + 1,
          role_required: current.roleRequired,
          form_fields: current.formFields,
        })
      }
      await fetchSteps(selectedEventType)
      setExpandedStep(null)
      closeModal()
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to save step. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      await stepTemplateService.deleteStepTemplate(deleteTarget.id)
      await fetchSteps(selectedEventType)
      setDeleteTarget(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete step.')
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const onDragStart = (index, id) => { dragIndex.current = index; setDraggingId(id) }

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
      await stepTemplateService.reorderStepTemplates(selectedEventType, steps.map(s => s.id))
      await fetchSteps(selectedEventType)
    } catch {
      setError('Failed to save new order.')
    }
  }

  const selectedTypeName = eventTypes.find(t => t.id === selectedEventType)?.name || ''

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-poppins text-lg font-bold text-gray-900">Step Template Builder</h1>
        <p className="text-xs text-gray-500">Define steps and forms for each event type</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <label className="block text-xs font-semibold text-gray-700 mb-2">Select Event Type</label>
        <div className="relative w-full max-w-sm">
          <ChevronsUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          {loadingTypes ? (
            <div className="flex items-center gap-2 pl-9 py-2 text-xs text-gray-400"><Loader className="w-3 h-3 animate-spin" /> Loading event types…</div>
          ) : (
            <select
              value={selectedEventType || ''}
              onChange={(e) => handleSelectEventType(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
            >
              <option value="">Choose an event type…</option>
              {eventTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          )}
        </div>
      </div>

      {selectedEventType && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-2">
            <h2 className="font-poppins text-sm font-bold text-gray-900 truncate">
              Steps for <span className="text-primary-600">{selectedTypeName}</span>
            </h2>
            <button onClick={() => openModal()} className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-md hover:shadow-lg transition-all">
              <Plus className="w-3.5 h-3.5" /><span className="hidden sm:inline">Add Step</span><span className="sm:hidden">Add</span>
            </button>
          </div>

          <div className="p-4 space-y-2">
            {loadingSteps ? (
              <div className="flex items-center justify-center py-10 text-xs text-gray-400 gap-2"><Loader className="w-4 h-4 animate-spin text-primary-500" /> Loading steps…</div>
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
                  className={`border rounded-lg overflow-hidden transition-all ${draggingId === step.id ? 'opacity-50 border-primary-400 shadow-lg' : 'border-gray-200 hover:border-primary-300'}`}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0"><GripVertical className="w-4 h-4" /></div>
                    <div className="w-6 h-6 bg-primary-500 text-white rounded flex items-center justify-center font-bold text-[10px] flex-shrink-0">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-900 truncate">{step.step_name}</p>
                        {(step.step_responses_count || 0) > 0 && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-medium flex-shrink-0">
                            <Users className="w-2.5 h-2.5" />{step.step_responses_count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" />{step.role_required}</span>
                        <span className="flex items-center gap-1"><ListChecks className="w-3 h-3" />{step.form_fields?.length || 0} field{step.form_fields?.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        {expandedStep === step.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button onClick={() => openModal(step)} className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                      {(step.step_responses_count || 0) === 0 ? (
                        <button onClick={() => setDeleteTarget(step)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      ) : (
                        <span title="Cannot delete — participant responses exist" className="p-1.5 text-amber-400 cursor-not-allowed"><Lock className="w-3.5 h-3.5" /></span>
                      )}
                    </div>
                  </div>

                  {expandedStep === step.id && (
                    <div className="px-3 py-3 border-t border-gray-100 bg-white">
                      {!step.form_fields?.length ? (
                        <p className="text-xs text-gray-400 italic">No form fields defined for this step.</p>
                      ) : (
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Form Fields</p>
                          {step.form_fields.map((field, fi) => (
                            <div key={fi} className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 bg-gray-50 rounded-lg border border-gray-100 gap-1.5">
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-900">{field.label}</p>
                                <p className="text-[10px] text-gray-400 font-mono">{field.key}</p>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-medium">{FIELD_TYPE_LABELS[field.type] || field.type}</span>
                                {field.required && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-medium">Required</span>}
                                {field.options?.length > 0 && <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px]">{field.options.length} opts</span>}
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

      <ConfirmDialog
        open={!!deleteTarget}
        icon={Trash2}
        title="Delete Step"
        message={`Are you sure you want to delete "${deleteTarget?.step_name}"? This cannot be undone.`}
        confirmLabel="Delete"
        confirmClass="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col my-auto">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-poppins text-sm font-bold text-gray-900">{editingStep ? 'Edit Step' : 'Add New Step'}</h2>
              <button onClick={closeModal} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"><X className="w-5 h-5 text-gray-500" /></button>
            </div>

            <form onSubmit={handleSaveStep} className="overflow-y-auto flex-1">
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Step Name <span className="text-red-500">*</span></label>
                  <input type="text" required value={formData.stepName} onChange={(e) => { const v = e.target.value; setFormData(p => { const u = { ...p, stepName: v }; formDataRef.current = u; return u }) }} className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" placeholder="e.g. Registration, Doctor Checkup, Pharmacy" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role Required <span className="text-red-500">*</span></label>
                  <select value={formData.roleRequired} onChange={(e) => { const v = e.target.value; setFormData(p => { const u = { ...p, roleRequired: v }; formDataRef.current = u; return u }) }} className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                    {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                </div>
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-semibold text-gray-700">Form Fields</label>
                    {editingStep && stepHasResponses && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-[10px] font-medium">
                        <Lock className="w-3 h-3" /> Locked — {editingStep.step_responses_count} response{editingStep.step_responses_count !== 1 ? 's' : ''} recorded
                      </span>
                    )}
                  </div>

                  {/* Mandatory Participant Info Notice — only for step 1 */}
                  {(editingStep ? editingStep.step_order === 1 : steps.length === 0) && <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-[10px] font-semibold text-blue-800 mb-1.5">Participant Information (Always Required)</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-700">
                        <User className="w-3 h-3" />
                        <span>Full Name *</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-700">
                        <span className="w-3 h-3 flex items-center justify-center text-[8px] font-bold">#</span>
                        <span>Age *</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-700">
                        <span className="w-3 h-3 flex items-center justify-center text-[8px]">⚤</span>
                        <span>Gender *</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-blue-700">
                        <span className="w-3 h-3 flex items-center justify-center text-[8px]">📞</span>
                        <span>Phone *</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-blue-500 mt-1.5 italic">These fields are automatically included and cannot be edited.</p>
                  </div>}

                  {formData.formFields.length > 0 && (
                    <div className="space-y-1.5 mb-3">
                      {formData.formFields.map((field, idx) => (
                        <div key={idx} className={`flex items-start justify-between px-3 py-2 border rounded-lg gap-2 ${
                          editingFieldIdx === idx ? 'bg-primary-50 border-primary-200' : 'bg-gray-50 border-gray-100'
                        }`}>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-gray-900">{field.label}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[10px] font-mono text-gray-400">{field.key}</span>
                              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">{FIELD_TYPE_LABELS[field.type] || field.type}</span>
                              {field.required && <span className="px-1.5 py-0.5 bg-red-100 text-red-700 rounded text-[10px]">Required</span>}
                              {field.options?.length > 0 && <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] truncate max-w-[120px]">{field.options.join(', ')}</span>}
                            </div>
                          </div>
                          {(!editingStep || !stepHasResponses) && (
                            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => editField(idx)}
                                className={`p-1.5 rounded-lg transition-colors ${
                                  editingFieldIdx === idx
                                    ? 'text-primary-600 bg-primary-100'
                                    : 'text-gray-400 hover:text-primary-600 hover:bg-primary-50'
                                }`}
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button type="button" onClick={() => removeField(idx)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className={`p-3 border rounded-lg space-y-3 ${
                    editingFieldIdx !== null
                      ? 'border-primary-300 bg-primary-50/40'
                      : 'border-dashed border-gray-300 bg-gray-50/50'
                  }`}>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
                      {editingFieldIdx !== null ? `Editing Field #${editingFieldIdx + 1}` : 'Add a Field'}
                    </p>
                    {fieldError && <p className="text-[10px] text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {fieldError}</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">Key</label>
                        <input type="text" value={newField.key} onChange={(e) => setNewField(p => ({ ...p, key: e.target.value }))} className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="vision_right" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">Label</label>
                        <input type="text" value={newField.label} onChange={(e) => setNewField(p => ({ ...p, label: e.target.value }))} className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Right Eye Vision" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">Type</label>
                        <select value={newField.type} onChange={(e) => setNewField(p => ({ ...p, type: e.target.value, options: '' }))} className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                          {Object.entries(FIELD_TYPE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                      <div className="flex items-end pb-0.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={newField.required} onChange={(e) => setNewField(p => ({ ...p, required: e.target.checked }))} className="w-3.5 h-3.5 text-primary-600 rounded focus:ring-primary-500" />
                          <span className="text-xs text-gray-700">Required</span>
                        </label>
                      </div>
                    </div>
                    {newField.type === 'dropdown' && (
                      <div>
                        <label className="block text-[10px] font-semibold text-gray-600 mb-1">Options <span className="font-normal text-gray-400">(comma-separated)</span></label>
                        <input type="text" value={newField.options} onChange={(e) => setNewField(p => ({ ...p, options: e.target.value }))} className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" placeholder="Normal, Cataract, Glaucoma, Referred" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={handleAddField} className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                        {editingFieldIdx !== null ? <><Edit className="w-3.5 h-3.5" /> Update Field</> : <><Plus className="w-3.5 h-3.5" /> Add Field</>}
                      </button>
                      {editingFieldIdx !== null && (
                        <button type="button" onClick={() => { setEditingFieldIdx(null); setNewField(EMPTY_FIELD); setFieldError('') }} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                          Cancel edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex-shrink-0 border-t border-gray-100">
                {saveError && (
                  <div className="flex items-center gap-2 px-4 pt-3 text-xs text-red-700">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
                    <span>{saveError}</span>
                  </div>
                )}
                <div className="flex gap-2 px-4 py-3.5">
                  <button type="button" onClick={closeModal} className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-60">
                    {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    {saving ? 'Saving…' : (editingStep ? 'Save Changes' : 'Add Step')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
