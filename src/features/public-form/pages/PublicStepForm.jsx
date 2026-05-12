import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FileText, User, CheckCircle2, Loader, AlertCircle, Upload, X, Calendar, MapPin, ShoppingCart, IndianRupee, Phone } from 'lucide-react'
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
  const [selectedAddOns, setSelectedAddOns] = useState({})
  const [paymentInfo, setPaymentInfo] = useState(null)
  const [showPayment, setShowPayment] = useState(false)

  // Get public form token from URL
  const urlToken = searchParams.get('token')

  useEffect(() => {
    if (urlToken) {
      publicFormService.setPublicFormToken(urlToken)
    }

    const loadStepTemplate = async () => {
      try {
        setLoading(true)
        const data = await publicFormService.getStepTemplate()
        setStepTemplate(data.step_template)
        setCamp(data.camp)
        // Auto-select all required add-ons
        const required = (data.camp?.add_ons ?? []).filter(a => !a.optional)
        if (required.length > 0) {
          const preSelected = {}
          required.forEach(a => { preSelected[a.name] = a })
          setSelectedAddOns(preSelected)
        }
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
    const basicFieldKeys = ['name', 'age', 'gender', 'phone', 'phone_number', 'full_name', 'fullname']

    // Validate basic fields from formData
    if (!formData.name?.trim()) errors.name = 'Full name is required'
    if (!formData.age) errors.age = 'Age is required'
    if (!formData.gender) errors.gender = 'Gender is required'
    if (!formData.phone?.trim()) errors.phone = 'Phone number is required'

    // Validate custom form fields (skip basic fields that are already validated above)
    fields.forEach(field => {
      if (!field.required) return
      // Skip basic info fields - they are validated from formData above
      if (basicFieldKeys.includes(field.key.toLowerCase())) return
      const value = field.type === 'file' ? fileFields[field.key] : responseData[field.key]
      if (value === undefined || value === null || value === '') {
        errors[field.key] = `${field.label} is required`
      }
    })

    return errors
  }

  // Toggle add-on selection
  const toggleAddOn = (addon) => {
    setSelectedAddOns(prev => {
      const key = addon.name
      if (prev[key]) {
        const updated = { ...prev }
        delete updated[key]
        return updated
      }
      return { ...prev, [key]: addon }
    })
  }

  const getSelectedAddOnsList = () => Object.values(selectedAddOns)

  const getTotalAmount = () => {
    const base = parseFloat(camp?.registration_fee ?? 0)
    // Required add-ons are always included; optional only if selected
    const campAddOns = camp?.add_ons ?? []
    const requiredTotal = campAddOns
      .filter(a => !a.optional)
      .reduce((s, a) => s + parseFloat(a.price ?? 0), 0)
    const optionalSelected = Object.values(selectedAddOns)
      .filter(a => a.optional)
      .reduce((s, a) => s + parseFloat(a.price ?? 0), 0)
    return base + requiredTotal + optionalSelected
  }

  const doSubmit = async (paymentId = null) => {
    setSubmitting(true)
    setError(null)
    try {
      // Build response_data with basic info + custom fields + payment info
      const finalResponseData = {
        name: formData.name,
        age: formData.age,
        gender: formData.gender,
        phone: formData.phone,
        ...responseData,
      }
      if (camp?.payment_enabled) {
        finalResponseData.payment_status = paymentId ? 'paid' : 'pending'
        finalResponseData.payment_method = paymentId ? 'online' : null
        finalResponseData.payment_amount = getTotalAmount()
        finalResponseData.registration_fee = parseFloat(camp?.registration_fee ?? 0)
        finalResponseData.add_ons = getSelectedAddOnsList().map(a => ({ name: a.name, price: parseFloat(a.price), optional: a.optional }))
        finalResponseData.add_ons_total = getSelectedAddOnsList().reduce((s, a) => s + parseFloat(a.price ?? 0), 0)
      }

      const submitData = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        response_data: finalResponseData,
        ...(paymentId ? { payment_id: paymentId } : {}),
        ...(camp?.payment_enabled && paymentId ? { payment_method: 'online' } : {}),
      }

      const fileEntries = Object.entries(fileFields)
      if (fileEntries.length > 0) {
        const formDataObj = new FormData()
        formDataObj.append('name', submitData.name)
        formDataObj.append('age', submitData.age)
        formDataObj.append('gender', submitData.gender)
        formDataObj.append('phone', submitData.phone)
        formDataObj.append('response_data', JSON.stringify(submitData.response_data))
        if (paymentId) formDataObj.append('payment_id', paymentId)
        if (camp?.payment_enabled && paymentId) formDataObj.append('payment_method', 'online')
        fileEntries.forEach(([key, file]) => formDataObj.append(`response_data.${key}`, file))

        const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
        const token = publicFormService.getPublicFormToken()
        const response = await fetch(`${API_URL}/public-form/submit`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
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
        const res = await publicFormService.submitForm(submitData)
        setTokenNumber(res.token_number)
        setSubmitted(true)
      }
    } catch (err) {
      setError(err.message || err.response?.data?.message || 'Failed to submit form. Please try again.')
    } finally {
      setSubmitting(false)
    }
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

    // If payment enabled, go directly to Razorpay (add-ons already selected on form)
    if (camp?.payment_enabled == true || camp?.payment_enabled === 1) {
      await handlePayAndSubmit()
      return
    }

    await doSubmit()
  }

  const handlePayAndSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const orderRes = await publicFormService.createPaymentOrder({
        camp_id: camp.id,
        participant_data: {
          name: formData.name,
          age: parseInt(formData.age),
          gender: formData.gender,
          phone: formData.phone,
        },
        selected_add_ons: [
          // Always include required add-ons
          ...(camp?.add_ons ?? []).filter(a => !a.optional).map(a => ({ name: a.name, price: parseFloat(a.price) })),
          // Plus any optional ones the user selected
          ...Object.values(selectedAddOns).filter(a => a.optional).map(a => ({ name: a.name, price: parseFloat(a.price) })),
        ],
      })

      if (!orderRes.payment_required) {
        await doSubmit()
        return
      }

      // Launch Razorpay (amount from backend is already in rupees, Razorpay needs paise)
      const options = {
        key: orderRes.key_id,
        amount: Math.round(orderRes.amount * 100),
        currency: orderRes.currency || 'INR',
        name: orderRes.camp_name,
        description: orderRes.description,
        order_id: orderRes.order_id,
        prefill: orderRes.prefill,
        handler: async (rzpResponse) => {
          try {
            setSubmitting(true)
            // Step 1: verify signature
            const verifyRes = await publicFormService.verifyPayment({
              payment_id: orderRes.payment_id,
              razorpay_order_id: rzpResponse.razorpay_order_id,
              razorpay_payment_id: rzpResponse.razorpay_payment_id,
              razorpay_signature: rzpResponse.razorpay_signature,
            })
            // Step 2: submit form with payment_id so participant is created as paid
            await doSubmit(verifyRes.payment_id)
          } catch (err) {
            setError(err.response?.data?.message || 'Payment succeeded but registration failed. Please contact support.')
            setSubmitting(false)
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
        theme: { color: '#6366f1' },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment.')
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
  const campAddOns = camp?.add_ons ?? []

  // Payment / add-on selection screen
  if (showPayment) {
    const selectedList = getSelectedAddOnsList()
    const total = getTotalAmount()
    const requiredAddOns = campAddOns.filter(a => !a.optional)
    const optionalAddOns = campAddOns.filter(a => a.optional)

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-5 text-center">
            <ShoppingCart className="w-8 h-8 text-white mx-auto mb-2" />
            <h1 className="font-poppins text-lg font-bold text-white">Payment Summary</h1>
            <p className="text-primary-100 text-sm">{camp?.name}</p>
          </div>

          <div className="p-6 space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

            {/* Base fee */}
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">Registration Fee</span>
                <span className="flex items-center gap-0.5 text-sm font-bold text-gray-900">
                  <IndianRupee className="w-3.5 h-3.5" />{parseFloat(camp?.registration_fee ?? 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Required add-ons */}
            {requiredAddOns.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Included Items</p>
                <div className="space-y-2">
                  {requiredAddOns.map((addon, i) => (
                    <div key={i} className="flex items-center justify-between bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
                      <span className="text-sm text-blue-800 font-medium">{addon.name}</span>
                      <span className="flex items-center gap-0.5 text-sm font-bold text-blue-700">
                        <IndianRupee className="w-3.5 h-3.5" />{parseFloat(addon.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional add-ons */}
            {optionalAddOns.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Optional Add-ons</p>
                <div className="space-y-2">
                  {optionalAddOns.map((addon, i) => {
                    const isSelected = !!selectedAddOns[addon.name]
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleAddOn(addon)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected ? 'border-primary-500 bg-primary-500' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </div>
                          <span className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-800'}`}>{addon.name}</span>
                        </div>
                        <span className={`flex items-center gap-0.5 text-sm font-bold ${isSelected ? 'text-primary-600' : 'text-gray-600'}`}>
                          <IndianRupee className="w-3.5 h-3.5" />{parseFloat(addon.price).toFixed(2)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="flex items-center gap-0.5 text-xl font-bold text-primary-600">
                  <IndianRupee className="w-4 h-4" />{total.toFixed(2)}
                </span>
              </div>
              {(() => {
                const campAddOns = camp?.add_ons ?? []
                const reqTotal = campAddOns.filter(a => !a.optional).reduce((s, a) => s + parseFloat(a.price ?? 0), 0)
                const optTotal = Object.values(selectedAddOns).filter(a => a.optional).reduce((s, a) => s + parseFloat(a.price ?? 0), 0)
                const parts = []
                if (reqTotal > 0) parts.push(`Included ₹${reqTotal.toFixed(2)}`)
                if (optTotal > 0) parts.push(`Optional ₹${optTotal.toFixed(2)}`)
                return parts.length > 0 ? (
                  <p className="text-xs text-gray-400 mt-1">
                    Base ₹{parseFloat(camp?.registration_fee ?? 0).toFixed(2)} + {parts.join(' + ')}
                  </p>
                ) : null
              })()}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPayment(false)}
                className="flex-1 py-3 text-sm font-semibold border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handlePayAndSubmit}
                disabled={submitting}
                className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all"
              >
                {submitting ? <Loader className="w-5 h-5 animate-spin" /> : <IndianRupee className="w-5 h-5" />}
                {submitting ? 'Processing...' : `Pay ₹${total.toFixed(2)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

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

          {/* Basic Info - Card Style */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 px-4 py-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4" /> Basic Information
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {/* Full Name - Full Width */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary-500" />
                    Full Name <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${fieldErrors.name ? 'border-red-400' : 'border-gray-200'}`}
                  placeholder="Enter your full name"
                />
                {fieldErrors.name && <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>}
              </div>

              {/* Age | Gender - 2 col */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="130"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all ${fieldErrors.age ? 'border-red-400' : 'border-gray-200'}`}
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
                    className={`w-full px-4 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white ${fieldErrors.gender ? 'border-red-400' : 'border-gray-200'}`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldErrors.gender && <p className="mt-1 text-xs text-red-500">{fieldErrors.gender}</p>}
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  <span className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary-500" />
                    Phone Number <span className="text-red-500">*</span>
                  </span>
                </label>
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

          {/* Payment Section - Inline like staff form */}
          {(camp?.payment_enabled == true || camp?.payment_enabled === 1) && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Payment Summary
                  </h3>
                  <span className="text-xs text-white/80">Online Payment</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Registration Fee */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Registration Fee</span>
                  <span className="text-sm font-semibold text-gray-900">₹{parseFloat(camp?.registration_fee ?? 0).toFixed(2)}</span>
                </div>

                {/* Required add-ons */}
                {campAddOns.filter(a => !a.optional).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Included</p>
                    {campAddOns.filter(a => !a.optional).map(a => (
                      <div key={a.name} className="flex items-center justify-between py-1.5 px-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">{a.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">₹{parseFloat(a.price).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Optional add-ons - Selectable */}
                {campAddOns.filter(a => a.optional).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Optional Add-ons (Click to Select)</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {campAddOns.filter(a => a.optional).map(a => {
                        const isSelected = !!selectedAddOns[a.name]
                        return (
                          <button
                            key={a.name}
                            type="button"
                            onClick={() => toggleAddOn(a)}
                            className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${isSelected ? 'bg-primary-50 border-primary-500' : 'bg-white border-gray-200 hover:border-primary-300'}`}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-primary-500' : 'border-2 border-gray-300'}`}>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span className={`text-sm ${isSelected ? 'font-semibold text-primary-900' : 'text-gray-700'}`}>{a.name}</span>
                            </div>
                            <span className={`text-sm font-semibold ${isSelected ? 'text-primary-700' : 'text-gray-600'}`}>₹{parseFloat(a.price).toFixed(2)}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Total */}
                <div className="border-t-2 border-gray-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="flex items-center gap-1 text-xl font-bold text-primary-600">
                      <IndianRupee className="w-5 h-5" />
                      {getTotalAmount().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Custom Form Fields - Filter out basic info fields that are already collected above */}
          {formFields.filter(f => !['name','age','gender','phone','phone_number','full_name','fullname'].includes(f.key.toLowerCase())).length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-4 py-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Additional Information
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {formFields
                  .filter(f => !['name','age','gender','phone','phone_number','full_name','fullname'].includes(f.key.toLowerCase()))
                  .map((field) => (
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
                (camp?.payment_enabled == true || camp?.payment_enabled === 1)
                  ? <><IndianRupee className="w-4 h-4" /> Pay ₹{getTotalAmount().toFixed(2)} & Register</>
                  : 'Submit Form'
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
