import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, User, CheckCircle2, Loader, AlertCircle, Upload, X, Calendar, MapPin } from 'lucide-react'
import publicFormService from '../services/public-form-service'

export default function PublicStepForm() {
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [tokenNumber, setTokenNumber] = useState('')
  const [stepTemplate, setStepTemplate] = useState(null)
  const [camp, setCamp] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
  })
  const [responseData, setResponseData] = useState({})
  const [fileFields, setFileFields] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Get public form token from URL
  const urlToken = searchParams.get('token')

  useEffect(() => {
    if (urlToken && !publicFormService.getPublicFormToken()) {
      publicFormService.setPublicFormToken(urlToken)
    }

    const loadStepTemplate = async () => {
      try {
        setLoading(true)
        const data = await publicFormService.getStepTemplate()
        setStepTemplate(data.step_template)
        setCamp(data.camp)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Invalid or expired form link. Please request a new link.')
      } finally {
        setLoading(false)
      }
    }

    loadStepTemplate()
  }, [urlToken])

  const handleFieldChange = (key, value) => {
    setResponseData(prev => ({ ...prev, [key]: value }))
    // Clear error for this field
    if (fieldErrors[key]) {
      setFieldErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  const handleFileChange = (key, file) => {
    if (file) {
      setFileFields(prev => ({ ...prev, [key]: file }))
      if (fieldErrors[key]) {
        setFieldErrors(prev => ({ ...prev, [key]: undefined }))
      }
    }
  }

  const handleRemoveFile = (key) => {
    setFileFields(prev => {
      const updated = { ...prev }
      delete updated[key]
      return updated
    })
  }

  const validate = () => {
    const errors = {}
    const fields = stepTemplate?.form_fields ?? []

    // Validate basic fields
    if (!formData.name.trim()) errors.name = 'Full name is required'
    if (!formData.age) errors.age = 'Age is required'
    if (!formData.gender) errors.gender = 'Gender is required'

    // Validate custom form fields
    fields.forEach(field => {
      if (!field.required) return
      const value = field.type === 'file' ? fileFields[field.key] : responseData[field.key]
      if (value === undefined || value === null || value === '') {
        errors[field.key] = `${field.label} is required`
      }
    })

    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errors = validate()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      // Scroll to first error
      const firstEl = document.querySelector('[data-field-error]')
      if (firstEl) firstEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setFieldErrors({})
    setSubmitting(true)

    try {
      const submitData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone || undefined,
        response_data: { ...responseData },
      }

      // Handle file uploads separately using FormData
      const fileEntries = Object.entries(fileFields)
      if (fileEntries.length > 0) {
        const formDataObj = new FormData()
        formDataObj.append('name', submitData.name)
        formDataObj.append('age', submitData.age)
        formDataObj.append('gender', submitData.gender)
        if (submitData.phone) formDataObj.append('phone', submitData.phone)
        formDataObj.append('response_data', JSON.stringify(submitData.response_data))

        fileEntries.forEach(([key, file]) => {
          formDataObj.append(`response_data.${key}`, file)
        })

        // Use axios directly for file upload
        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
        const token = publicFormService.getPublicFormToken()
        const response = await fetch(`${API_URL}/public-form/submit`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formDataObj,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || 'Failed to submit form')
        }

        const data = await response.json()
        setTokenNumber(data.token_number)
        setSubmitted(true)
      } else {
        const response = await publicFormService.submitForm(submitData)
        setTokenNumber(response.token_number)
        setSubmitted(true)
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const renderField = (field) => {
    const hasError = !!fieldErrors[field.key]
    const baseInput = `w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all`
    const borderClass = hasError ? 'border-red-400' : 'border-gray-200'

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={responseData[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`${baseInput} ${borderClass}`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={responseData[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`${baseInput} ${borderClass}`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'textarea':
        return (
          <textarea
            value={responseData[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            rows={3}
            className={`${baseInput} ${borderClass} resize-none`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )

      case 'dropdown':
        return (
          <select
            value={responseData[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
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
            value={responseData[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`${baseInput} ${borderClass}`}
          />
        )

      case 'boolean':
        return (
          <div className={`flex items-center gap-6 px-4 py-2 rounded-lg border ${hasError ? 'border-red-400 bg-red-50/30' : 'border-transparent'}`}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value="yes"
                checked={responseData[field.key] === 'yes'}
                onChange={() => handleFieldChange(field.key, 'yes')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={field.key}
                value="no"
                checked={responseData[field.key] === 'no'}
                onChange={() => handleFieldChange(field.key, 'no')}
                className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">No</span>
            </label>
          </div>
        )

      case 'file':
        return (
          <div>
            {fileFields[field.key] ? (
              <div className={`flex items-center justify-between px-4 py-3 bg-gray-50 border rounded-lg ${hasError ? 'border-red-400' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-700 truncate max-w-[200px]">{fileFields[field.key].name}</span>
                  <span className="text-xs text-gray-400">
                    ({(fileFields[field.key].size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(field.key)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all ${hasError ? 'border-red-400 bg-red-50/20' : 'border-gray-200'}`}>
                <Upload className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload file</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(field.key, e.target.files[0])}
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
            value={responseData[field.key] || ''}
            onChange={(e) => handleFieldChange(field.key, e.target.value)}
            className={`${baseInput} ${borderClass}`}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-white">
          <Loader className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (error && !stepTemplate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="font-poppins text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-400">Please contact the event organizer for assistance.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-poppins text-2xl font-bold text-gray-900 mb-2">Form Submitted!</h2>
          <p className="text-gray-600 mb-6">Please save your token number for reference</p>

          <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your Token Number</p>
            <p className="text-5xl font-bold text-primary-700 tracking-wider">{tokenNumber}</p>
          </div>

          <div className="text-sm text-gray-500 mb-4">
            <p className="font-semibold">{camp?.name}</p>
            <div className="flex items-center justify-center gap-4 mt-1 text-xs">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {camp?.camp_date && new Date(camp.camp_date).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {camp?.location}
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-400">Thank you for your submission!</p>
        </div>
      </div>
    )
  }

  const formFields = stepTemplate?.form_fields ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-poppins text-xl font-bold text-white">{stepTemplate?.step_name || 'Registration Form'}</h1>
          <p className="text-primary-100 text-sm">{camp?.name}</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs text-primary-100">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {camp?.camp_date && new Date(camp.camp_date).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {camp?.location}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Basic Information</h3>

            {/* Full Name - Full Width */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Full Name <span className="text-red-500">*</span>
                </span>
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${fieldErrors.name ? 'border-red-400' : 'border-gray-200'}`}
                placeholder="Enter your full name"
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
            </div>

            {/* Age | Gender | Phone - 3 Column Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  required
                  min="0"
                  max="130"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={`w-full px-4 py-3.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${fieldErrors.age ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Age"
                />
                {fieldErrors.age && <p className="mt-1 text-xs text-red-500">{fieldErrors.age}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
                <select
                  required
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className={`w-full px-4 py-3.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white ${fieldErrors.gender ? 'border-red-400' : 'border-gray-200'}`}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {fieldErrors.gender && <p className="mt-1 text-xs text-red-500">{fieldErrors.gender}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="Mobile number"
                />
              </div>
            </div>
          </div>

          {/* Custom Form Fields */}
          {formFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Additional Information</h3>

              {formFields.map((field) => (
                <div key={field.key} data-field-error={fieldErrors[field.key] ? true : undefined}>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  {renderField(field)}
                  {fieldErrors[field.key] && (
                    <p className="mt-1 text-xs text-red-500">{fieldErrors[field.key]}</p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Form'
              )}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Please ensure all required fields are filled correctly.
          </p>
        </form>
      </div>
    </div>
  )
}
