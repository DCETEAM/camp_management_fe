import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Users, ArrowRight, Clock, User, Loader, AlertCircle, RefreshCw, ListChecks, UserPlus, CheckCircle2, ArrowLeft, FileText, Upload, X, IndianRupee } from 'lucide-react'
import api from '../../../core/interceptors/axiosInterceptor'
import { useAuth } from '../../auth/contexts/auth-context'

function RegisterForm({ campId, stepTemplateId, stepFormFields, stepName, onBack, onSuccess, onRegistered }) {
  const [form, setForm] = useState({ name: '', age: '', gender: '', phone: '' })
  const [extraFields, setExtraFields] = useState({})
  const [fileFields, setFileFields] = useState({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [token, setToken] = useState(null)
  const [campData, setCampData] = useState(null)
  const [paidChecked, setPaidChecked] = useState(false)
  const [selectedAddOns, setSelectedAddOns] = useState({})

  const handle = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const inputCls = "w-full px-3 py-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"

  useEffect(() => {
    api.get(`/camps/${campId}`).then(r => {
      setCampData(r.data)
      // Pre-select required add-ons
      const required = (r.data?.add_ons ?? []).filter(a => !a.optional)
      const pre = {}
      required.forEach(a => { pre[a.name] = a })
      setSelectedAddOns(pre)
    }).catch(() => {})
  }, [campId])

  const paymentEnabled = campData?.payment_enabled == true || campData?.payment_enabled === 1
  const canSubmit = !paymentEnabled || paidChecked

  const toggleAddOn = (addon) => {
    if (!addon.optional) return
    setSelectedAddOns(prev => {
      if (prev[addon.name]) { const u = { ...prev }; delete u[addon.name]; return u }
      return { ...prev, [addon.name]: addon }
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!canSubmit) return
    setSaving(true)
    setError(null)
    try {
      const pRes = await api.post('/participants', {
        camp_id: parseInt(campId),
        name: form.name,
        age: parseInt(form.age),
        gender: form.gender,
        phone: form.phone,
      })
      const participant = pRes.data

      // Calculate total including only selected add-ons (required + selected optional)
      const registrationFee = parseFloat(campData?.registration_fee ?? 0)
      const selectedAddOnsList = Object.values(selectedAddOns)
      const addOnsTotal = selectedAddOnsList.reduce((s, a) => s + parseFloat(a.price ?? 0), 0)
      const totalAmount = registrationFee + addOnsTotal

      // Build response_data with payment info
      const responseData = {
        name: form.name,
        age: form.age,
        gender: form.gender,
        phone: form.phone || '',
        ...extraFields,
      }
      if (paymentEnabled) {
        responseData.payment_status = paidChecked ? 'paid' : 'unpaid'
        responseData.payment_method = paidChecked ? 'offline' : null
        responseData.payment_amount = paidChecked ? totalAmount : 0
        responseData.registration_fee = registrationFee
        responseData.add_ons = selectedAddOnsList.map(a => ({ name: a.name, price: parseFloat(a.price), optional: a.optional }))
        responseData.add_ons_total = addOnsTotal
      }

      const payload = {
        participant_id: participant.id,
        step_template_id: parseInt(stepTemplateId),
        response_data: responseData,
        outcome: 'Completed',
      }
      if (paymentEnabled && paidChecked) {
        payload.payment_method = 'offline'
      }

      await api.post('/step-responses', payload)

      const fileEntries = Object.entries(fileFields)
      for (const [key, file] of fileEntries) {
        const fd = new FormData()
        fd.append('participant_id', participant.id)
        fd.append('step_template_id', parseInt(stepTemplateId))
        fd.append('field_key', key)
        fd.append('file', file)
        await api.post('/media', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      }
      setToken(participant.token_number)
    } catch (err) {
      setError(err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Registration failed.')
    } finally {
      setSaving(false)
    }
  }

  // Token success screen — same card style
  if (token) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <button onClick={() => { onRegistered?.(); onBack() }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="min-w-0">
            <h1 className="font-poppins text-base font-bold text-gray-900">{stepName}</h1>
            <p className="text-xs text-gray-500">Registration complete</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="font-poppins text-lg font-bold text-gray-900 mb-1">Registered!</h2>
          <p className="text-xs text-gray-500 mb-6">Participant registered successfully</p>
          <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-5 mb-6 inline-block min-w-[160px]">
            <p className="text-xs text-gray-500 mb-1">Token Number</p>
            <p className="text-5xl font-bold text-primary-700 tracking-wider">{token}</p>
          </div>
          <div className="flex gap-3 mt-2">
            <button onClick={() => { onRegistered?.(); onBack() }}
              className="flex-1 py-3 text-sm font-semibold border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
              Back to Queue
            </button>
            <button onClick={() => { onRegistered?.(); setToken(null); setForm({ name: '', age: '', gender: '', phone: '' }); setExtraFields({}); setFileFields({}) }}
              className="flex-[2] py-3 text-sm font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" /> Register Next
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header — same as StepForm */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div className="min-w-0">
          <h1 className="font-poppins text-base font-bold text-gray-900 truncate">{stepName}</h1>
          <p className="text-xs text-gray-500">Fill in participant details to register</p>
        </div>
      </div>

      {/* Form card — same as StepForm */}
      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="font-poppins text-sm font-bold text-gray-900">Participant Details</h2>
        </div>
        <div className="p-4 space-y-4">
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          {/* Full Name - Full Width */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={e => handle('name', e.target.value)}
              required
              className={inputCls}
              placeholder="Enter full name"
              autoComplete="off"
            />
          </div>

          {/* Age & Gender - 2 columns, Phone - full width */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.age}
                onChange={e => handle('age', e.target.value)}
                required
                min="0"
                max="130"
                className={inputCls}
                placeholder="Age"
                inputMode="numeric"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-gray-700">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                value={form.gender}
                onChange={e => handle('gender', e.target.value)}
                required
                className={`${inputCls} bg-white`}
              >
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              value={form.phone}
              onChange={e => handle('phone', e.target.value)}
              required
              className={inputCls}
              placeholder="Mobile number"
              inputMode="tel"
            />
          </div>

          {/* Extra fields from step template */}
          {stepFormFields?.filter(f => !['name','age','gender','phone','phone_number'].includes(f.key)).map(field => (
            <div key={field.key}>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                {field.label}{field.required && <span className="text-red-500 ml-0.5">*</span>}
              </label>
              {field.type === 'textarea' ? (
                <textarea value={extraFields[field.key] || ''} onChange={e => setExtraFields(p => ({...p, [field.key]: e.target.value}))}
                  rows={3} required={field.required} className={`${inputCls} resize-none`} />
              ) : field.type === 'dropdown' ? (
                <select value={extraFields[field.key] || ''} onChange={e => setExtraFields(p => ({...p, [field.key]: e.target.value}))}
                  required={field.required} className={`${inputCls} bg-white`}>
                  <option value="">Select…</option>
                  {field.options?.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : field.type === 'file' ? (
                fileFields[field.key] ? (
                  <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-700 truncate max-w-[200px]">{fileFields[field.key].name}</span>
                      <span className="text-[10px] text-gray-400">({(fileFields[field.key].size / 1024).toFixed(1)} KB)</span>
                    </div>
                    <button type="button" onClick={() => setFileFields(p => { const n = {...p}; delete n[field.key]; return n })}
                      className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all">
                    <Upload className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500">Click to upload file</span>
                    <input type="file" accept="image/*,.pdf" className="hidden"
                      onChange={e => { if (e.target.files[0]) setFileFields(p => ({...p, [field.key]: e.target.files[0]})) }} />
                  </label>
                )
              ) : (
                <input type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  value={extraFields[field.key] || ''} onChange={e => setExtraFields(p => ({...p, [field.key]: e.target.value}))}
                  required={field.required} className={inputCls} />
              )}
            </div>
          ))}

          {/* Payment section - Professional design */}
          {paymentEnabled && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <IndianRupee className="w-4 h-4" /> Payment Summary
                  </h3>
                  <span className="text-xs text-white/80">Offline Collection</span>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {/* Registration Fee */}
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-600">Registration Fee</span>
                  <span className="text-sm font-semibold text-gray-900">₹{parseFloat(campData?.registration_fee ?? 0).toFixed(2)}</span>
                </div>

                {/* Required add-ons */}
                {(campData?.add_ons ?? []).filter(a => !a.optional).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Included</p>
                    {(campData?.add_ons ?? []).filter(a => !a.optional).map(a => (
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

                {/* Optional add-ons - Selectable cards */}
                {(campData?.add_ons ?? []).filter(a => a.optional).length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Optional Add-ons</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(campData?.add_ons ?? []).filter(a => a.optional).map(a => {
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
                <div className="border-t-2 border-gray-100 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="flex items-center gap-1 text-xl font-bold text-primary-600">
                      <IndianRupee className="w-5 h-5" />
                      {((parseFloat(campData?.registration_fee ?? 0)) + Object.values(selectedAddOns).reduce((s, a) => s + parseFloat(a.price ?? 0), 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment confirmation checkbox */}
                <div className={`p-4 rounded-lg border-2 transition-all ${paidChecked ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="relative flex items-center pt-0.5">
                      <input
                        type="checkbox"
                        checked={paidChecked}
                        onChange={(e) => setPaidChecked(e.target.checked)}
                        className={`w-6 h-6 rounded border-2 cursor-pointer transition-colors ${paidChecked ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${paidChecked ? 'text-green-800' : 'text-gray-800'}`}>
                        {paidChecked ? 'Payment Received ✓' : 'Confirm Payment Received'}
                      </p>
                      <p className={`text-xs mt-0.5 ${paidChecked ? 'text-green-600' : 'text-gray-500'}`}>
                        {paidChecked ? 'You can now register the participant.' : 'Please collect payment before registering.'}
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onBack}
              className="flex-1 px-4 py-3.5 text-sm font-semibold border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all">
              ← Back
            </button>
            <button type="submit" disabled={saving || !canSubmit}
              className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white text-sm font-bold py-3.5 rounded-xl shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 disabled:shadow-none">
              {saving ? <Loader className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {saving ? 'Registering…' : paymentEnabled ? (paidChecked ? 'Complete Registration' : 'Confirm Payment First') : 'Register Participant'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

function ParticipantDetailModal({ participant, onClose }) {
  const [responses, setResponses]   = useState([])
  const [freshData, setFreshData]   = useState(participant)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/participants/${participant.id}/step-responses`),
      api.get(`/participants/${participant.id}`),
    ])
      .then(([rRes, pRes]) => {
        setResponses([...rRes.data].sort((a,b) => (a.step_template?.step_order??0) - (b.step_template?.step_order??0)))
        setFreshData(pRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [participant.id])

  const outcomeColor = (o) => {
    const m = { Completed:'bg-green-100 text-green-700', Normal:'bg-blue-100 text-blue-700', Referred:'bg-yellow-100 text-yellow-700', Treated:'bg-purple-100 text-purple-700', 'No Action':'bg-gray-100 text-gray-600', Incomplete:'bg-red-100 text-red-700' }
    return m[o] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col my-auto"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {freshData.token_number}
            </div>
            <div>
              <p className="font-poppins text-sm font-bold text-gray-900">{freshData.name}</p>
              <p className="text-xs text-gray-400">{freshData.age}y &middot; {freshData.gender}{freshData.phone ? ` · ${freshData.phone}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-4 h-4 text-gray-500 rotate-[135deg]" />
          </button>
        </div>

        {/* Count pills */}
        <div className="flex gap-2 px-5 py-3 border-b border-gray-50 flex-wrap">
          <div className="flex items-center gap-1.5 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-green-700">{responses.length} step{responses.length !== 1 ? 's' : ''} done</span>
          </div>
          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border ${
            freshData.status === 'completed' ? 'bg-green-50 border-green-100' :
            freshData.status === 'in_progress' ? 'bg-primary-50 border-primary-100' :
            'bg-gray-50 border-gray-100'
          }`}>
            <User className={`w-3.5 h-3.5 ${
              freshData.status === 'completed' ? 'text-green-600' :
              freshData.status === 'in_progress' ? 'text-primary-600' : 'text-gray-400'
            }`} />
            <span className={`text-xs font-semibold capitalize ${
              freshData.status === 'completed' ? 'text-green-700' :
              freshData.status === 'in_progress' ? 'text-primary-700' : 'text-gray-500'
            }`}>{(freshData.status || 'not started').replace(/_/g,' ')}</span>
          </div>
          {freshData.registered_at && (
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">{new Date(freshData.registered_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}</span>
            </div>
          )}
        </div>

        {/* Journey log */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-xs text-gray-400">
              <Loader className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No steps completed yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {responses.map((resp, i) => (
                <div key={resp.id} className="relative pl-6">
                  {/* Timeline line */}
                  {i < responses.length - 1 && (
                    <span className="absolute left-[7px] top-5 bottom-0 w-px bg-gray-200" />
                  )}
                  {/* Dot */}
                  <span className="absolute left-0 top-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center">
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                  </span>

                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-800">{resp.step_template?.step_name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${outcomeColor(resp.outcome)}`}>
                        {resp.outcome}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {resp.handler?.name}
                      {resp.completed_at ? ` · ${new Date(resp.completed_at).toLocaleString([],{dateStyle:'short',timeStyle:'short'})}` : ''}
                    </p>
                    {resp.response_data && Object.keys(resp.response_data).length > 0 && (
                      <div className="bg-white border border-gray-100 rounded-lg p-2 space-y-1">
                        {Object.entries(resp.response_data).map(([k,v]) => (
                          <div key={k} className="flex justify-between text-[11px]">
                            <span className="text-gray-500 capitalize">{k.replace(/_/g,' ')}</span>
                            <span className="text-gray-800 font-medium max-w-[55%] text-right truncate">{String(v)}</span>
                          </div>
                        ))}
                      </div>
                    )}
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

function MyLogModal({ campId, stepTemplateId, stepName, onClose }) {
  const [log, setLog]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/camps/${campId}/my-log`, { params: { step_template_id: stepTemplateId } })
      .then(r => setLog(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [campId, stepTemplateId])

  const outcomeColor = (o) => {
    const m = { Completed:'bg-green-100 text-green-700', Normal:'bg-blue-100 text-blue-700', Referred:'bg-yellow-100 text-yellow-700', Treated:'bg-purple-100 text-purple-700', 'No Action':'bg-gray-100 text-gray-600', Incomplete:'bg-red-100 text-red-700' }
    return m[o] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col my-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-poppins text-sm font-bold text-gray-900">My Log</p>
            <p className="text-xs text-gray-400">{stepName} &middot; {log.length} handled by me</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl">
            <ArrowLeft className="w-4 h-4 text-gray-500 rotate-[135deg]" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-10 gap-2 text-xs text-gray-400">
              <Loader className="w-4 h-4 animate-spin" /> Loading…
            </div>
          ) : log.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">No entries handled by you yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {log.map((resp) => (
                <div key={resp.id} className="bg-gray-50 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-[11px] font-bold text-primary-700">{resp.participant?.token_number}</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-800">{resp.participant?.name}</p>
                        <p className="text-[10px] text-gray-400">{resp.participant?.age}y &middot; {resp.participant?.gender}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${outcomeColor(resp.outcome)}`}>
                      {resp.outcome}
                    </span>
                  </div>
                  {resp.response_data && Object.keys(resp.response_data).length > 0 && (
                    <div className="px-3 py-2 grid grid-cols-2 gap-x-4 gap-y-1">
                      {Object.entries(resp.response_data).map(([k, v]) => (
                        <div key={k}>
                          <p className="text-[10px] text-gray-400 capitalize">{k.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] font-semibold text-gray-800 truncate">{String(v) || '—'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="px-3 py-1.5 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400">
                      {resp.completed_at ? new Date(resp.completed_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}
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

export default function MyQueue() {
  const { campId } = useParams()
  const navigate = useNavigate()
  const { user: authUser } = useAuth()

  const [camp, setCamp]             = useState(null)
  const [mySteps, setMySteps]       = useState([])
  const [selectedStep, setSelectedStep] = useState(null)
  const [queue, setQueue]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [queueLoading, setQueueLoading] = useState(false)
  const [error, setError]           = useState(null)
  const [showRegisterForm, setShowRegisterForm] = useState(false)
  const [viewParticipant, setViewParticipant]   = useState(null)
  const [registeredList, setRegisteredList]     = useState([])
  const [regLoading, setRegLoading]             = useState(false)
  const [showMyLog, setShowMyLog]               = useState(false)
  const isFirstStep = selectedStep?.step_template?.step_order === 1

  const loadRegistered = useCallback(async (stepId) => {
    if (!stepId) return
    try {
      setRegLoading(true)
      const res = await api.get(`/camps/${campId}/my-log`, {
        params: { step_template_id: stepId }
      })
      // my-log returns step_responses with participant nested
      setRegisteredList(Array.isArray(res.data) ? res.data : [])
    } catch {
      setRegisteredList([])
    } finally {
      setRegLoading(false)
    }
  }, [campId])

  const isPrivileged = ['organizer', 'org_admin', 'super_admin'].includes(authUser?.role)

  // Load camp info and steps
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [campRes, staffRes] = await Promise.all([
          api.get(`/camps/${campId}`),
          api.get(`/camps/${campId}/staff`),
        ])
        const campData = campRes.data
        setCamp(campData)

        // For all roles: show only steps the user is assigned to
        const mine = staffRes.data.filter(s => Number(s.user_id) === Number(authUser?.id))
        const sorted = [...mine].sort((a, b) => (a.step_template?.step_order ?? 0) - (b.step_template?.step_order ?? 0))
        setMySteps(sorted)
        if (sorted.length > 0) setSelectedStep(sorted[0])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load camp data.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [campId, authUser])

  const loadQueue = useCallback(async (step) => {
    if (!step) return
    try {
      setQueueLoading(true)
      const res = await api.get(`/camps/${campId}/queue`, {
        params: { step_template_id: step.step_template_id }
      })
      setQueue(res.data)
    } catch {
      setQueue([])
    } finally {
      setQueueLoading(false)
    }
  }, [campId])

  useEffect(() => {
    if (selectedStep) loadQueue(selectedStep)
  }, [selectedStep, loadQueue])

  useEffect(() => {
    if (isFirstStep && selectedStep) loadRegistered(selectedStep.step_template_id)
  }, [isFirstStep, selectedStep, loadRegistered])

  const handleCall = (participant) => {
    navigate(`/staff-workstation/${campId}/step-form/${participant.id}?step=${selectedStep.step_template_id}`)
  }

  const handleCallNext = () => {
    if (isFirstStep) {
      setShowRegisterForm(true)
      return
    }
    if (queue.length === 0) return
    handleCall(queue[0])
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

  if (mySteps.length === 0) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <ListChecks className="w-10 h-10 text-gray-300" />
      <p className="text-sm font-semibold text-gray-700">Not assigned to any step</p>
      <p className="text-xs text-gray-400">Contact your org admin to be assigned to a step in this camp.</p>
    </div>
  )

  if (showRegisterForm) {
    return (
      <RegisterForm
        campId={campId}
        stepTemplateId={selectedStep?.step_template_id}
        stepFormFields={selectedStep?.step_template?.form_fields}
        stepName={selectedStep?.step_template?.step_name}
        onBack={() => setShowRegisterForm(false)}
        onSuccess={() => { setShowRegisterForm(false); loadRegistered(selectedStep?.step_template_id) }}
        onRegistered={() => { loadRegistered(selectedStep?.step_template_id); loadQueue(selectedStep) }}
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Step selector (if assigned to multiple steps) */}
      {mySteps.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {mySteps.map(s => (
            <button key={s.id} onClick={() => setSelectedStep(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${Number(selectedStep?.step_template_id) === Number(s.step_template_id) ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300'}`}>
              {s.step_template?.step_name}
            </button>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">
            {selectedStep?.step_template?.step_name || '—'}
          </h1>
          <p className="text-xs text-gray-500">{authUser?.name} &middot; {camp?.name}</p>
        </div>
        <button onClick={() => isFirstStep ? loadRegistered() : loadQueue(selectedStep)} disabled={queueLoading || regLoading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${(queueLoading || regLoading) ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Step 1: Registration prompt + registered list */}
      {isFirstStep ? (
        <div className="space-y-3">
          {/* Prompt card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                <UserPlus className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Ready to Register</h3>
                <p className="text-xs text-gray-400">Tap Call Next to register the next participant</p>
              </div>
            </div>
            <button onClick={handleCallNext}
              className="flex-shrink-0 flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all">
              <UserPlus className="w-3.5 h-3.5" /> Call Next
            </button>
          </div>

          {/* My Registrations list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-poppins text-sm font-bold text-gray-900">My Registrations</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{registeredList.length} by me</span>
                <button onClick={() => loadRegistered(selectedStep?.step_template_id)} disabled={regLoading}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${regLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
            {regLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-xs text-gray-400">
                <Loader className="w-4 h-4 animate-spin" /> Loading…
              </div>
            ) : registeredList.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs text-gray-400">No registrations by you yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {registeredList.map((resp, index) => {
                  const p = resp.participant ?? resp
                  return (
                    <button key={resp.id} onClick={() => setViewParticipant(p)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary-700">{p.token_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                        <p className="text-[11px] text-gray-500">{p.age}y &middot; {p.gender}{p.phone ? ` · ${p.phone}` : ''}</p>
                      </div>
                      <div className="flex-shrink-0">
                        {resp.completed_at && (
                          <span className="text-[10px] text-gray-400">
                            {new Date(resp.completed_at).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-primary-100 text-xs font-medium">Waiting</p>
              </div>
              <p className="text-2xl font-bold">{queue.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-gray-500 text-xs font-medium">Est. Wait</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{queue.length * 5}m</p>
            </div>
          </div>

          {/* Queue List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-poppins text-sm font-bold text-gray-900">Waiting Queue</h2>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{queue.length} waiting</span>
                <button onClick={() => setShowMyLog(true)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-600 border border-gray-200 bg-white py-1.5 px-3 rounded-lg hover:bg-gray-50 transition-all">
                  <ListChecks className="w-3 h-3" /> My Log
                </button>
                <button onClick={handleCallNext} disabled={queue.length === 0 || queueLoading}
                  className="flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-primary-500 to-primary-600 text-white py-1.5 px-3 rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <ArrowRight className="w-3 h-3" /> Call Next
                </button>
              </div>
            </div>
            {queueLoading ? (
              <div className="flex items-center justify-center py-10 gap-2 text-xs text-gray-400">
                <Loader className="w-4 h-4 animate-spin" /> Loading queue…
              </div>
            ) : queue.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Queue is empty</h3>
                <p className="text-xs text-gray-400">No participants waiting for this step</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {queue.map((participant, index) => (
                  <div key={participant.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                      {index + 1}
                    </div>
                    <button onClick={() => setViewParticipant(participant)}
                      className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0 hover:from-primary-200 hover:to-primary-300 transition-colors">
                      <span className="text-xs font-bold text-primary-700">{participant.token_number}</span>
                    </button>
                    <button onClick={() => setViewParticipant(participant)} className="flex-1 min-w-0 text-left">
                      <p className="text-xs font-semibold text-gray-900">{participant.name}</p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1">
                        {participant.age}y &middot; {participant.gender}
                        <span className="inline-flex items-center gap-0.5 ml-1 text-primary-400">
                          <FileText className="w-2.5 h-2.5" />
                          <span className="text-[10px]">View history</span>
                        </span>
                      </p>
                    </button>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleCall(participant)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors">
                        <User className="w-3 h-3" /> Call
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {viewParticipant && (
        <ParticipantDetailModal
          participant={viewParticipant}
          onClose={() => setViewParticipant(null)}
        />
      )}
      {showMyLog && !isFirstStep && (
        <MyLogModal
          campId={campId}
          stepTemplateId={selectedStep?.step_template_id}
          stepName={selectedStep?.step_template?.step_name}
          onClose={() => setShowMyLog(false)}
        />
      )}
    </div>
  )
}
