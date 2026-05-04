import { useState } from 'react'
import { 
  ChevronsUpDown, 
  Plus, 
  Edit, 
  Trash2, 
  GripVertical, 
  ListChecks, 
  Settings,
  X,
  Save,
  User,
  Type,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export default function StepTemplateBuilder() {
  const [selectedEventType, setSelectedEventType] = useState(null)
  const [isStepModalOpen, setIsStepModalOpen] = useState(false)
  const [editingStep, setEditingStep] = useState(null)
  const [expandedStep, setExpandedStep] = useState(null)
  
  const [formData, setFormData] = useState({
    stepName: '',
    roleRequired: 'staff',
    formFields: []
  })

  const [newField, setNewField] = useState({
    key: '',
    label: '',
    type: 'text',
    options: '',
    required: false
  })

  const eventTypes = [
    { id: 1, name: 'Eye Camp' },
    { id: 2, name: 'Dental Camp' },
    { id: 3, name: 'General Health Check' }
  ]

  const [stepTemplates, setStepTemplates] = useState({
    1: [
      {
        id: 1,
        stepName: 'Registration',
        roleRequired: 'staff',
        stepOrder: 1,
        formFields: [
          { key: 'name', label: 'Full Name', type: 'text', required: true },
          { key: 'age', label: 'Age', type: 'number', required: true },
          { key: 'gender', label: 'Gender', type: 'dropdown', required: true, options: ['Male', 'Female', 'Other'] },
          { key: 'phone', label: 'Phone', type: 'text', required: false }
        ]
      },
      {
        id: 2,
        stepName: 'Vision Check',
        roleRequired: 'staff',
        stepOrder: 2,
        formFields: [
          { key: 'vision_r', label: 'Right Eye Vision', type: 'text', required: true },
          { key: 'vision_l', label: 'Left Eye Vision', type: 'text', required: true }
        ]
      },
      {
        id: 3,
        stepName: 'Doctor Consultation',
        roleRequired: 'organizer',
        stepOrder: 3,
        formFields: [
          { key: 'diagnosis', label: 'Diagnosis', type: 'dropdown', required: true, options: ['Normal', 'Cataract', 'Glaucoma', 'Referred'] },
          { key: 'notes', label: 'Doctor Notes', type: 'textarea', required: false }
        ]
      },
      {
        id: 4,
        stepName: 'Pharmacy',
        roleRequired: 'staff',
        stepOrder: 4,
        formFields: [
          { key: 'prescription', label: 'Prescription Photo', type: 'file', required: false },
          { key: 'medications', label: 'Medications Given', type: 'textarea', required: false }
        ]
      }
    ],
    2: [
      {
        id: 1,
        stepName: 'Registration',
        roleRequired: 'staff',
        stepOrder: 1,
        formFields: [
          { key: 'name', label: 'Full Name', type: 'text', required: true }
        ]
      },
      {
        id: 2,
        stepName: 'Dental Checkup',
        roleRequired: 'organizer',
        stepOrder: 2,
        formFields: []
      }
    ],
    3: []
  })

  const currentSteps = selectedEventType ? (stepTemplates[selectedEventType] || []) : []

  const handleOpenStepModal = (step = null) => {
    if (step) {
      setEditingStep(step)
      setFormData({
        stepName: step.stepName,
        roleRequired: step.roleRequired,
        formFields: [...step.formFields]
      })
    } else {
      setEditingStep(null)
      setFormData({
        stepName: '',
        roleRequired: 'staff',
        formFields: []
      })
    }
    setIsStepModalOpen(true)
  }

  const handleAddField = () => {
    if (newField.key && newField.label) {
      const fieldToAdd = {
        key: newField.key,
        label: newField.label,
        type: newField.type,
        required: newField.required
      }
      if (newField.type === 'dropdown' && newField.options) {
        fieldToAdd.options = newField.options.split(',').map(opt => opt.trim())
      }
      setFormData({
        ...formData,
        formFields: [...formData.formFields, fieldToAdd]
      })
      setNewField({
        key: '',
        label: '',
        type: 'text',
        options: '',
        required: false
      })
    }
  }

  const handleRemoveField = (index) => {
    setFormData({
      ...formData,
      formFields: formData.formFields.filter((_, i) => i !== index)
    })
  }

  const handleSaveStep = (e) => {
    e.preventDefault()
    if (!selectedEventType) return
    
    let updatedSteps = [...currentSteps]
    
    if (editingStep) {
      updatedSteps = updatedSteps.map(step =>
        step.id === editingStep.id ? { ...step, ...formData } : step
      )
    } else {
      updatedSteps.push({
        id: Date.now(),
        ...formData,
        stepOrder: updatedSteps.length + 1
      })
    }
    
    setStepTemplates({
      ...stepTemplates,
      [selectedEventType]: updatedSteps
    })
    setIsStepModalOpen(false)
  }

  const handleDeleteStep = (stepId) => {
    if (!selectedEventType) return
    setStepTemplates({
      ...stepTemplates,
      [selectedEventType]: currentSteps.filter(step => step.id !== stepId)
    })
  }

  const getFieldTypeLabel = (type) => {
    const labels = {
      text: 'Text',
      number: 'Number',
      dropdown: 'Dropdown',
      date: 'Date',
      boolean: 'Yes/No',
      textarea: 'Textarea',
      file: 'File'
    }
    return labels[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">Step Template Builder</h1>
          <p className="text-gray-600 mt-1">Define steps and forms for each event type</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Select Event Type
        </label>
        <div className="relative max-w-md">
          <ChevronsUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={selectedEventType || ''}
            onChange={(e) => setSelectedEventType(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
          >
            <option value="">Choose an event type...</option>
            {eventTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedEventType && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-poppins text-xl font-bold text-gray-900">
              Steps for {eventTypes.find(t => t.id === selectedEventType)?.name}
            </h2>
            <button
              onClick={() => handleOpenStepModal()}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add Step
            </button>
          </div>

          <div className="p-6 space-y-4">
            {currentSteps.length === 0 ? (
              <div className="text-center py-12">
                <ListChecks className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-1">No steps defined</h3>
                <p className="text-gray-500">Add steps to define the participant journey</p>
              </div>
            ) : (
              currentSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-center gap-4 p-4 bg-gray-50">
                    <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{step.stepName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {step.roleRequired}
                        </span>
                        <span className="flex items-center gap-1">
                          <ListChecks className="w-4 h-4" />
                          {step.formFields.length} fields
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        {expandedStep === step.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => handleOpenStepModal(step)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStep(step.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {expandedStep === step.id && step.formFields.length > 0 && (
                    <div className="p-4 border-t border-gray-100">
                      <h4 className="text-sm font-semibold text-gray-700 mb-3">Form Fields</h4>
                      <div className="space-y-2">
                        {step.formFields.map((field, fieldIndex) => (
                          <div key={fieldIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <span className="font-medium text-gray-900">{field.label}</span>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                <span className="px-2 py-0.5 bg-gray-200 rounded">{getFieldTypeLabel(field.type)}</span>
                                {field.required && (
                                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Required</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {isStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-poppins text-xl font-bold text-gray-900">
                {editingStep ? 'Edit Step' : 'Add Step'}
              </h2>
              <button
                onClick={() => setIsStepModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSaveStep} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Step Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.stepName}
                  onChange={(e) => setFormData({ ...formData, stepName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="e.g., Registration, Doctor Checkup"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Role Required
                </label>
                <select
                  value={formData.roleRequired}
                  onChange={(e) => setFormData({ ...formData, roleRequired: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                >
                  <option value="staff">Staff</option>
                  <option value="organizer">Organizer</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Form Fields
                  </label>
                </div>

                <div className="space-y-3 mb-4">
                  {formData.formFields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{field.label}</span>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span className="px-2 py-0.5 bg-gray-200 rounded">{getFieldTypeLabel(field.type)}</span>
                          {field.required && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded">Required</span>
                          )}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveField(index)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Add New Field</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Key</label>
                      <input
                        type="text"
                        value={newField.key}
                        onChange={(e) => setNewField({ ...newField, key: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                        placeholder="field_key"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Label</label>
                      <input
                        type="text"
                        value={newField.label}
                        onChange={(e) => setNewField({ ...newField, label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                        placeholder="Field Label"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
                      <select
                        value={newField.type}
                        onChange={(e) => setNewField({ ...newField, type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm bg-white"
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="dropdown">Dropdown</option>
                        <option value="date">Date</option>
                        <option value="boolean">Yes/No</option>
                        <option value="textarea">Textarea</option>
                        <option value="file">File</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newField.required}
                          onChange={(e) => setNewField({ ...newField, required: e.target.checked })}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Required</span>
                      </label>
                    </div>
                  </div>
                  {newField.type === 'dropdown' && (
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Options (comma-separated)</label>
                      <input
                        type="text"
                        value={newField.options}
                        onChange={(e) => setNewField({ ...newField, options: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-sm"
                        placeholder="Option 1, Option 2, Option 3"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleAddField}
                    className="mt-3 flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Field
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsStepModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingStep ? 'Save Changes' : 'Add Step'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
