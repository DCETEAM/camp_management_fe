import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Save, Upload, FileText, User, CheckCircle2, Clock, X, Loader, AlertCircle, Phone } from 'lucide-react'
import api from '../../../core/interceptors/axiosInterceptor'

export default function StepForm() {
  const { campId, participantId } = useParams()
  const [searchParams] = useSearchParams()
  const stepTemplateId = searchParams.get('step')
  const navigate = useNavigate()
  const [showPrevious, setShowPrevious] = useState(false)

  const [participant, setParticipant]       = useState(null)
  const [stepTemplate, setStepTemplate]     = useState(null)
  const [allSteps, setAllSteps]             = useState([])
  const [previousResponses, setPreviousResponses] = useState([])
  const [loading, setLoading]               = useState(true)
  const [submitting, setSubmitting]         = useState(false)
  const [error, setError]                   = useState(null)
  const [formValues, setFormValues]         = useState({})
  const [outcome, setOutcome]               = useState('')
  const [uploadedFiles, setUploadedFiles]   = useState({})
  const [fieldErrors, setFieldErrors]       = useState({})

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [pRes, prevRes] = await Promise.all([
          api.get(`/participants/${participantId}`),
          api.get(`/participants/${participantId}/step-responses`),
        ])
        setParticipant(pRes.data)
        setPreviousResponses(prevRes.data)

        if (stepTemplateId) {
          const stRes = await api.get(`/step-templates/${stepTemplateId}`)
          setStepTemplate(stRes.data)
          // Load all steps for this event type to get total count
          const campData = pRes.data?.camp
          if (campData?.event_type_id) {
            try {
              const allRes = await api.get(`/step-templates`, { params: { event_type_id: campData.event_type_id } })
              setAllSteps(allRes.data)
            } catch { /* non-critical */ }
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [participantId, stepTemplateId])

  const handleFieldChange = (key, value) => {
    setFormValues(prev => ({ ...prev, [key]: value }))
  }

  const handleFileChange = (key, e) => {
    const file = e.target.files[0]
    if (file) setUploadedFiles(prev => ({ ...prev, [key]: file }))
  }

  const handleRemoveFile = (key) => {
    setUploadedFiles(prev => { const u = { ...prev }; delete u[key]; return u })
  }

  const isStep1 = (stepTemplate?.step_order ?? 1) === 1
  const BASIC_KEYS = ['name','age','gender','phone','phone_number','full_name','fullname']

  const validate = () => {
    const errors = {}
    const fields = (stepTemplate?.form_fields ?? []).filter(f => !BASIC_KEYS.includes(f.key.toLowerCase()))
    fields.forEach(field => {
      if (!field.required) return
      const val = field.type === 'file' ? uploadedFiles[field.key] : formValues[field.key]
      if (val === undefined || val === null || val === '') {
        errors[field.key] = `${field.label} is required`
      }
    })
    if (isStep1 && !outcome) errors['_outcome'] = 'Please select an outcome'
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      const firstEl = document.querySelector('[data-field-error]')
      if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setFieldErrors({})
    try {
      setSubmitting(true)
      // Build response_data with participant info + form values
      const responseData = {
        name: participant?.name || '',
        age: participant?.age || '',
        gender: participant?.gender || '',
        phone: participant?.phone || '',
        ...formValues,
      }
      await api.post('/step-responses', {
        participant_id: parseInt(participantId),
        step_template_id: parseInt(stepTemplateId),
        response_data: responseData,
        outcome: isStep1 ? outcome : 'Completed',
      })
      navigate(`/staff-workstation/${campId}/queue`)
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save response.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
      <Loader className="w-5 h-5 animate-spin" /> Loading…
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )

  const clearError = (key) => setFieldErrors(p => ({ ...p, [key]: undefined }))

  const renderField = (field) => {
    const hasError = !!fieldErrors[field.key]
    const baseInput = `w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all`
    const borderClass = hasError ? 'border-red-400' : 'border-gray-200'

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formValues[field.key] || ''}
            onChange={(e) => { handleFieldChange(field.key, e.target.value); clearError(field.key) }}
            className={`${baseInput} ${borderClass}`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            inputMode="numeric"
            value={formValues[field.key] || ''}
            onChange={(e) => { handleFieldChange(field.key, e.target.value.replace(/[^0-9.]/g, '')); clearError(field.key) }}
            onKeyDown={(e) => { if (['e','E','+','-'].includes(e.key)) e.preventDefault() }}
            className={`${baseInput} ${borderClass}`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={formValues[field.key] || ''}
            onChange={(e) => { handleFieldChange(field.key, e.target.value); clearError(field.key) }}
            rows={3}
            className={`${baseInput} ${borderClass} resize-none`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'dropdown':
        return (
          <select
            value={formValues[field.key] || ''}
            onChange={(e) => { handleFieldChange(field.key, e.target.value); clearError(field.key) }}
            className={`${baseInput} ${borderClass} bg-white`}
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
            onChange={(e) => { handleFieldChange(field.key, e.target.value); clearError(field.key) }}
            className={`${baseInput} ${borderClass}`}
          />
        )

      case 'boolean':
        return (
          <div className={`flex items-center gap-4 px-3 py-2 rounded-lg border ${hasError ? 'border-red-400 bg-red-50/30' : 'border-transparent'}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value="yes"
                checked={formValues[field.key] === 'yes'}
                onChange={() => { handleFieldChange(field.key, 'yes'); clearError(field.key) }}
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
                onChange={() => { handleFieldChange(field.key, 'no'); clearError(field.key) }}
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
              <div className={`flex items-center justify-between px-3 py-2 bg-gray-50 border rounded-lg ${hasError ? 'border-red-400' : 'border-gray-200'}`}>
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
              <label className={`flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all ${hasError ? 'border-red-400 bg-red-50/20' : 'border-gray-200'}`}>
                <Upload className="w-4 h-4 text-gray-400" />
                <span className="text-xs text-gray-500">Click to upload file</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => { handleFileChange(field.key, e); clearError(field.key) }}
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
            className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
          />
        )
    }
  }

  const formFields = (stepTemplate?.form_fields ?? []).filter(f => !BASIC_KEYS.includes(f.key.toLowerCase()))
  const outcomeOptions = ['Completed', 'Normal', 'Referred', 'Treated', 'No Action', 'Incomplete']

  // Derived counts
  const totalSteps = allSteps.length || previousResponses.length + 1
  const stepsCompleted = previousResponses.length
  const currentStepOrder = stepTemplate?.step_order ?? (stepsCompleted + 1)

  // Sort previous responses by step_order ascending
  const sortedResponses = [...previousResponses].sort(
    (a, b) => (a.step_template?.step_order ?? 0) - (b.step_template?.step_order ?? 0)
  )

  const ResponseCard = ({ resp }) => (
    <div className="border border-gray-100 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </span>
          <span className="text-xs font-semibold text-gray-800">{resp.step_template?.step_name}</span>
        </div>
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
          {resp.outcome}
        </span>
      </div>
      <p className="text-[11px] text-gray-400 pl-7">
        {resp.handler?.name} &middot; {resp.completed_at ? new Date(resp.completed_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
      </p>
      {resp.response_data && Object.keys(resp.response_data).length > 0 && (
        <div className="ml-7 bg-gray-50 rounded-lg p-2 space-y-1">
          {Object.entries(resp.response_data).map(([k, v]) => (
            <div key={k} className="flex justify-between text-[11px]">
              <span className="text-gray-500 capitalize">{k.replace(/_/g, ' ')}</span>
              <span className="text-gray-800 font-medium max-w-[55%] text-right truncate">{String(v)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/staff-workstation/${campId}/queue`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="min-w-0">
          <h1 className="font-poppins text-base font-bold text-gray-900 truncate">{stepTemplate?.step_name || 'Step Form'}</h1>
          <p className="text-xs text-gray-500">Step {currentStepOrder} of {totalSteps}</p>
        </div>
      </div>

      {/* Participant Info + Counts Bar */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {participant?.token_number}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{participant?.name}</p>
              <p className="text-xs text-gray-500">{participant?.age}y &middot; {participant?.gender}{` · ${participant?.phone || ''}`}</p>
            </div>
          </div>
          {/* Step progress pills */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-semibold text-green-700">{stepsCompleted} done</span>
            </div>
            <div className="flex items-center gap-1.5 bg-primary-50 border border-primary-100 rounded-lg px-2.5 py-1">
              <User className="w-3.5 h-3.5 text-primary-600" />
              <span className="text-xs font-semibold text-primary-700">Step {currentStepOrder}/{totalSteps}</span>
            </div>
            {participant?.registered_at && (
              <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{new Date(participant.registered_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Previous Steps — always visible above form (mobile), sidebar on desktop */}
      {sortedResponses.length > 0 && (
        <div className="lg:hidden space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Previous Steps</p>
          {sortedResponses.map(resp => (
            <div key={resp.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Step label bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-white" />
                  </span>
                  <span className="text-xs font-bold text-gray-700">
                    Step {resp.step_template?.step_order} &mdash; {resp.step_template?.step_name}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                  resp.outcome === 'Completed' ? 'bg-green-100 text-green-700' :
                  resp.outcome === 'Referred'  ? 'bg-yellow-100 text-yellow-700' :
                  resp.outcome === 'Normal'    ? 'bg-blue-100 text-blue-700' :
                  resp.outcome === 'Treated'   ? 'bg-purple-100 text-purple-700' :
                  resp.outcome === 'Incomplete'? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{resp.outcome}</span>
              </div>
              {/* Field data */}
              {resp.response_data && Object.keys(resp.response_data).length > 0 ? (
                <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {Object.entries(resp.response_data).map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[10px] text-gray-400 capitalize">{k.replace(/_/g, ' ')}</p>
                      <p className="text-xs font-semibold text-gray-800 truncate">{String(v) || '—'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-4 py-3 text-xs text-gray-400">No data recorded</p>
              )}
              <div className="px-4 py-2 border-t border-gray-50">
                <p className="text-[10px] text-gray-400">
                  {resp.handler?.name}{resp.completed_at ? ` · ${new Date(resp.completed_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-poppins text-sm font-bold text-gray-900">Form Fields</h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Mandatory Participant Info - Read Only */}
              <div className="pb-4 border-b border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Participant Information (Required)</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Full Name <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={participant?.name || ''}
                      disabled
                      className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        Phone <span className="text-red-500">*</span>
                      </span>
                    </label>
                    <input
                      type="text"
                      value={participant?.phone || ''}
                      disabled
                      className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={participant?.age ? `${participant.age} years` : ''}
                      disabled
                      className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={participant?.gender || ''}
                      disabled
                      className="w-full px-3 py-3 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Form Fields */}
              {formFields.length === 0 && (
                <p className="text-xs text-gray-400 text-center py-2">No additional form fields configured for this step.</p>
              )}
              {formFields.map((field) => (
                <div key={field.key} data-field-error={fieldErrors[field.key] ? true : undefined}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {renderField(field)}
                  {fieldErrors[field.key] && (
                    <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">!</span>
                      {fieldErrors[field.key]}
                    </p>
                  )}
                </div>
              ))}

              {/* Outcome — only for step 1 */}
              {isStep1 && (
              <div className="pt-3 border-t border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Outcome <span className="text-red-500">*</span>
                </label>
                <select
                  value={outcome}
                  onChange={(e) => { setOutcome(e.target.value); setFieldErrors(p => ({ ...p, _outcome: undefined })) }}
                  className={`w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white ${fieldErrors._outcome ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="">Select outcome...</option>
                  {outcomeOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                {fieldErrors._outcome && (
                  <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1" data-field-error>
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 text-white text-[8px] flex items-center justify-center font-bold">!</span>
                    {fieldErrors._outcome}
                  </p>
                )}
              </div>
              )}

              {/* Submit */}
              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => navigate(`/staff-workstation/${campId}/queue`)}
                  className="flex-1 px-3 py-3 text-sm border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-[2] flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {submitting ? 'Saving…' : 'Save & Complete'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Sidebar: Participant Journey — desktop only */}
        <div className="lg:col-span-1 hidden lg:block space-y-3">

          {/* Step Progress */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="font-poppins text-sm font-bold text-gray-900">Step Progress</h2>
            </div>
            <div className="p-3">
              {/* Progress bar */}
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-gray-500">{stepsCompleted} of {totalSteps} completed</span>
                <span className="font-semibold text-primary-600">{totalSteps > 0 ? Math.round((stepsCompleted / totalSteps) * 100) : 0}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
                <div
                  className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all"
                  style={{ width: `${totalSteps > 0 ? (stepsCompleted / totalSteps) * 100 : 0}%` }}
                />
              </div>
              {/* Step pills */}
              {allSteps.length > 0 ? (
                <div className="space-y-1.5">
                  {[...allSteps].sort((a,b) => a.step_order - b.step_order).map(step => {
                    const done = previousResponses.find(r => r.step_template_id === step.id || r.step_template?.id === step.id)
                    const isCurrent = step.id === parseInt(stepTemplateId)
                    return (
                      <div key={step.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${isCurrent ? 'bg-primary-50 border border-primary-100' : done ? 'bg-green-50' : 'bg-gray-50'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${isCurrent ? 'bg-primary-500 text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {done ? '✓' : step.step_order}
                        </span>
                        <span className={`font-medium ${isCurrent ? 'text-primary-700' : done ? 'text-green-700' : 'text-gray-500'}`}>{step.step_name}</span>
                        {isCurrent && <span className="ml-auto text-[10px] text-primary-500 font-semibold">Now</span>}
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-green-700">{stepsCompleted}</p>
                    <p className="text-[10px] text-green-600">Completed</p>
                  </div>
                  <div className="bg-primary-50 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-primary-700">{totalSteps - stepsCompleted}</p>
                    <p className="text-[10px] text-primary-600">Remaining</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Previous Step Data */}
          {sortedResponses.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Previous Steps</p>
              {sortedResponses.map(resp => (
                <div key={resp.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </span>
                      <span className="text-xs font-bold text-gray-700">
                        Step {resp.step_template?.step_order} &mdash; {resp.step_template?.step_name}
                      </span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      resp.outcome === 'Completed'  ? 'bg-green-100 text-green-700' :
                      resp.outcome === 'Referred'   ? 'bg-yellow-100 text-yellow-700' :
                      resp.outcome === 'Normal'     ? 'bg-blue-100 text-blue-700' :
                      resp.outcome === 'Treated'    ? 'bg-purple-100 text-purple-700' :
                      resp.outcome === 'Incomplete' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{resp.outcome}</span>
                  </div>
                  {resp.response_data && Object.keys(resp.response_data).length > 0 ? (
                    <div className="px-3 py-2.5 grid grid-cols-1 gap-y-1.5">
                      {Object.entries(resp.response_data).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-2">
                          <p className="text-[10px] text-gray-400 capitalize">{k.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] font-semibold text-gray-800 truncate max-w-[60%] text-right">{String(v) || '—'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="px-3 py-2.5 text-xs text-gray-400">No data recorded</p>
                  )}
                  <div className="px-3 py-1.5 border-t border-gray-50">
                    <p className="text-[10px] text-gray-400">
                      {resp.handler?.name}{resp.completed_at ? ` · ${new Date(resp.completed_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}` : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
