import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  FileText,
  User,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react'

export default function StepForm() {
  const { campId, participantId } = useParams()
  const navigate = useNavigate()

  const [participant] = useState({
    id: participantId,
    tokenNumber: 'T-001',
    name: 'Ramesh Kumar',
    age: 45,
    gender: 'Male',
    registeredAt: '2025-01-20 09:10 AM'
  })

  const [stepTemplate] = useState({
    id: 1,
    stepName: 'Doctor Checkup',
    formFields: [
      { key: 'blood_pressure', label: 'Blood Pressure', type: 'text', required: true, options: null },
      { key: 'pulse_rate', label: 'Pulse Rate', type: 'number', required: true, options: null },
      { key: 'temperature', label: 'Temperature (°F)', type: 'number', required: false, options: null },
      { key: 'symptoms', label: 'Symptoms', type: 'textarea', required: true, options: null },
      { key: 'diagnosis', label: 'Diagnosis', type: 'dropdown', required: true, options: ['Normal', 'Mild Issue', 'Moderate Issue', 'Severe Issue', 'Requires Referral'] },
      { key: 'follow_up_date', label: 'Follow-up Date', type: 'date', required: false, options: null },
      { key: 'is_diabetic', label: 'Is Diabetic?', type: 'boolean', required: true, options: null },
      { key: 'prescription_scan', label: 'Prescription / Scan Upload', type: 'file', required: false, options: null },
    ]
  })

  const [previousResponses] = useState([
    {
      id: 1,
      stepName: 'Registration',
      handledBy: 'David Brown',
      completedAt: '2025-01-20 09:12 AM',
      outcome: 'Completed',
      data: { full_name: 'Ramesh Kumar', age: '45', gender: 'Male', phone: '+91 98765 00001' }
    }
  ])

  const [formValues, setFormValues] = useState({})
  const [outcome, setOutcome] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState({})

  const handleFieldChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (key, e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFiles(prev => ({ ...prev, [key]: file }))
    }
  }

  const handleRemoveFile = (key) => {
    setUploadedFiles(prev => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Response saved successfully!')
    navigate(`/staff-workstation/${campId}/queue`)
  }

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formValues[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={formValues[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={formValues[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            required={field.required}
            rows={3}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'dropdown':
        return (
          <select
            value={formValues[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map((opt, i) => (
              <option key={i} value={opt}>{opt}</option>
            ))}
          </select>
        )

      case 'date':
        return (
          <input
            type="date"
            value={formValues[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            required={field.required}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
        )

      case 'boolean':
        return (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value="yes"
                checked={formValues[field.key] === 'yes'}
                onChange={() => handleFieldChange(field.key, 'yes')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value="no"
                checked={formValues[field.key] === 'no'}
                onChange={() => handleFieldChange(field.key, 'no')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-xs text-gray-700">No</span>
            </label>
          </div>
        )

      case 'file':
        return (
          <div>
            {uploadedFiles[field.key] ? (
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-700 truncate max-w-[200px]">{uploadedFiles[field.key].name}</span>
                  <span className="text-[10px] text-gray-400">
                    ({(uploadedFiles[field.key].size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(field.key)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Click to upload file</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(field.key, e)}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={formValues[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
        )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/staff-workstation/${campId}/queue`)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">{stepTemplate.stepName}</h1>
          <p className="text-xs text-gray-500">Fill the form for the participant below</p>
        </div>
      </div>

      {/* Participant Info Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {participant.tokenNumber.split('-')[1]}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-900">{participant.name}</p>
            <p className="text-[11px] text-gray-500">{participant.tokenNumber}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-gray-500">
          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {participant.age}y, {participant.gender}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {participant.registeredAt}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-poppins text-sm font-bold text-gray-900">Form Fields</h2>
            </div>

            <div className="p-4 space-y-4">
              {stepTemplate.formFields.map((field) => (
                <div key={field.key}>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              {/* Outcome */}
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Outcome <span className="text-red-500">*</span>
                </label>
                <select
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
                >
                  <option value="">Select outcome...</option>
                  <option value="treated">Treated</option>
                  <option value="referred">Referred</option>
                  <option value="no_action">No Action</option>
                  <option value="incomplete">Incomplete</option>
                </select>
              </div>

              {/* Submit */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => navigate(`/staff-workstation/${campId}/queue`)}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back to Queue
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save &amp; Complete
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar: Previous Responses */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-poppins text-sm font-bold text-gray-900">Previous Responses</h2>
            </div>

            {previousResponses.length === 0 ? (
              <div className="p-6 text-center">
                <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No previous responses</p>
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {previousResponses.map((resp) => (
                  <div key={resp.id} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-800">{resp.stepName}</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3" />
                        {resp.outcome}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mb-2">
                      By {resp.handledBy} &middot; {resp.completedAt}
                    </div>
                    <div className="space-y-1">
                      {Object.entries(resp.data).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between text-[11px]">
                          <span className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="text-gray-800 font-medium">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
