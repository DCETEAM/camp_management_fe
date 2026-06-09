import { useState, useEffect } from 'react'
import { X, Save, Loader, AlertCircle, CalendarCheck, MapPin, CreditCard, IndianRupee, Plus, Trash2, ShoppingCart, Megaphone } from 'lucide-react'
import DateInput from '../../../common/components/DateInput'
import { serializeRegistrationNote } from '../../../common/utils/noteFieldUtils'
import RegistrationNoteEditor from '../../../common/components/RegistrationNoteEditor'
import { DEFAULT_REGISTRATION_SUCCESS_MESSAGE } from '../../../common/utils/registrationSuccessUtils'
import orgAdminService from '../services/org-admin-service'
import { useAuth } from '../../auth/contexts/auth-context'

const inputBase = 'w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all'
const inputNormal = 'border-gray-200'
const inputError = 'border-red-400 bg-red-50'

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">{label}</label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  )
}

const EMPTY = {
  name: '', event_type_id: '', camp_date: '', location: '',
  payment_enabled: false, registration_fee: '', payment_description: '',
  show_token_on_registration: true, registration_success_message: '',
}
const EMPTY_ADDON = { name: '', price: '', optional: true }
const EMPTY_NOTE = { content: '', style: 'success' }

export default function CreateCampModal({ onClose, onCreated, camp }) {
  const isEdit = !!camp
  const { user } = useAuth()

  const [formData, setFormData] = useState(() => isEdit ? {
    name: camp.name || '',
    event_type_id: camp.event_type_id || camp.event_type?.id || '',
    camp_date: camp.camp_date ? camp.camp_date.split('T')[0] : '',
    location: camp.location || '',
    payment_enabled: !!camp.payment_enabled,
    registration_fee: camp.registration_fee ? String(camp.registration_fee) : '',
    payment_description: camp.payment_description || '',
    show_token_on_registration: camp.show_token_on_registration !== false && camp.show_token_on_registration !== 0,
    registration_success_message: camp.registration_success_message || '',
  } : EMPTY)
  const [touched, setTouched] = useState({})
  const [eventTypes, setEventTypes] = useState([])
  const [loadingEventTypes, setLoadingEventTypes] = useState(true)
  const [eventTypesError, setEventTypesError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [addOns, setAddOns] = useState(() => isEdit ? (camp.add_ons ?? []) : [])
  const [newAddOn, setNewAddOn] = useState(EMPTY_ADDON)
  const [registrationNotes, setRegistrationNotes] = useState(() => isEdit ? (camp.registration_notes ?? []) : [])
  const [newNote, setNewNote] = useState(EMPTY_NOTE)

  const orgId = user?.org_id ?? user?.organization?.id

  useEffect(() => {
    if (!orgId) {
      setEventTypes([])
      setLoadingEventTypes(false)
      setEventTypesError(
        user?.role === 'super_admin'
          ? 'Super admin accounts are not linked to an organization. Log in as the org admin for this organization to create camps.'
          : 'Your account is not linked to an organization.'
      )
      return
    }

    let cancelled = false
    setLoadingEventTypes(true)
    setEventTypesError(null)

    orgAdminService.getAllowedEventTypes(orgId)
      .then((data) => {
        if (cancelled) return
        const list = Array.isArray(data) ? data : (data?.data ?? [])
        setEventTypes(list)
        if (list.length === 0) {
          setEventTypesError('No event types are assigned to your organization yet. Ask a super admin to allow event types first.')
        }
      })
      .catch((err) => {
        if (cancelled) return
        setEventTypes([])
        setEventTypesError(err.response?.data?.message || 'Failed to load event types.')
      })
      .finally(() => {
        if (!cancelled) setLoadingEventTypes(false)
      })

    return () => { cancelled = true }
  }, [orgId, user?.role])

  const errors = {
    name: !formData.name.trim() ? 'Camp name is required.' : formData.name.trim().length < 2 ? 'Minimum 2 characters.' : null,
    event_type_id: !formData.event_type_id ? 'Event type is required.' : null,
    camp_date: !formData.camp_date ? 'Camp date is required (dd/mm/yyyy).' : null,
    location: !formData.location.trim() ? 'Location is required.' : null,
    registration_fee: formData.payment_enabled && (!formData.registration_fee || parseFloat(formData.registration_fee) <= 0) ? 'Valid fee amount is required when payment is enabled.' : null,
  }

  const hasErrors = Object.values(errors).some(Boolean)
  const touch = (f) => setTouched(t => ({ ...t, [f]: true }))

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setTouched({ name: true, event_type_id: true, camp_date: true, location: true })
    if (hasErrors) return
    setSaveError(null)
    const notesList = [...registrationNotes]
    if (newNote.content?.trim()) {
      notesList.push({ ...newNote })
    }
    const payload = {
      name: formData.name.trim(),
      event_type_id: parseInt(formData.event_type_id),
      camp_date: formData.camp_date,
      location: formData.location.trim(),
      payment_enabled: formData.payment_enabled,
      registration_fee: formData.payment_enabled ? parseFloat(formData.registration_fee) || 0 : 0,
      payment_description: formData.payment_description || '',
      add_ons: formData.payment_enabled ? addOns.map(a => ({ name: a.name.trim(), price: parseFloat(a.price) || 0, optional: a.optional })) : [],
      registration_notes: notesList.map(serializeRegistrationNote).filter(Boolean),
      show_token_on_registration: formData.show_token_on_registration,
      registration_success_message: formData.show_token_on_registration
        ? null
        : (formData.registration_success_message?.trim() || null),
    }
    try {
      setSaving(true)
      if (isEdit) {
        await orgAdminService.updateCamp(camp.id, payload)
      } else {
        await orgAdminService.createCamp(payload)
      }
      onCreated()
    } catch (err) {
      setSaveError(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} camp.`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col my-auto">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-poppins text-sm font-bold text-gray-900">{isEdit ? 'Edit Camp' : 'Create Camp'}</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">{isEdit ? `Editing: ${camp.name}` : 'Set up a new camp for your organization'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3 overflow-y-auto flex-1">
          <Field label={<span>Camp Name <span className="text-red-500">*</span></span>} error={touched.name && errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); touch('name') }}
              onBlur={() => touch('name')}
              className={`${inputBase} ${touched.name && errors.name ? inputError : inputNormal}`}
              placeholder="e.g., Coimbatore Eye Camp Jan 2025"
            />
          </Field>

          <Field label={<span>Event Type <span className="text-red-500">*</span></span>} error={touched.event_type_id && errors.event_type_id}>
            <div className="relative">
              <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={formData.event_type_id}
                onChange={(e) => { setFormData(p => ({ ...p, event_type_id: e.target.value })); touch('event_type_id') }}
                onBlur={() => touch('event_type_id')}
                disabled={loadingEventTypes || eventTypes.length === 0}
                className={`${inputBase} pl-8 bg-white ${touched.event_type_id && errors.event_type_id ? inputError : inputNormal} disabled:bg-gray-50 disabled:text-gray-500`}
              >
                <option value="">
                  {loadingEventTypes ? 'Loading event types…' : '— Select event type —'}
                </option>
                {eventTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            {eventTypesError && (
              <p className="mt-1 text-[10px] text-amber-600">{eventTypesError}</p>
            )}
          </Field>

          <Field label={<span>Camp Date <span className="text-red-500">*</span></span>} error={touched.camp_date && errors.camp_date}>
            <DateInput
              value={formData.camp_date}
              min={isEdit ? undefined : new Date().toISOString().split('T')[0]}
              onChange={(iso) => { setFormData(p => ({ ...p, camp_date: iso })); touch('camp_date') }}
              onBlur={() => touch('camp_date')}
              className={`${inputBase} ${touched.camp_date && errors.camp_date ? inputError : inputNormal}`}
            />
          </Field>

          <Field label={<span>Location <span className="text-red-500">*</span></span>} error={touched.location && errors.location}>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => { setFormData(p => ({ ...p, location: e.target.value })); touch('location') }}
                onBlur={() => touch('location')}
                className={`${inputBase} pl-8 ${touched.location && errors.location ? inputError : inputNormal}`}
                placeholder="Full address or venue name"
              />
            </div>
          </Field>

          <p className="text-[10px] text-gray-400">Status will be set automatically based on the camp date — upcoming, active (today), or closed.</p>

          {/* Registration notes — per camp only */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 mb-1">
              <Megaphone className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-semibold text-gray-900">Registration Notes</h3>
            </div>
            <p className="text-[10px] text-gray-400 mb-3">
              Only for this camp. Write one message — the preview shows exactly what registrants will see.
            </p>

            {registrationNotes.length > 0 && (
              <div className="space-y-3 mb-3">
                {registrationNotes.map((note, i) => (
                  <RegistrationNoteEditor
                    key={i}
                    note={note}
                    compact
                    showRemove
                    campPreview={{
                      name: formData.name,
                      registration_fee: formData.registration_fee,
                      payment_description: formData.payment_description,
                    }}
                    onChange={(updated) => setRegistrationNotes((n) => n.map((x, idx) => (idx === i ? updated : x)))}
                    onRemove={() => setRegistrationNotes((n) => n.filter((_, idx) => idx !== i))}
                  />
                ))}
              </div>
            )}

            <RegistrationNoteEditor
              note={newNote}
              campPreview={{
                name: formData.name,
                registration_fee: formData.registration_fee,
                payment_description: formData.payment_description,
              }}
              onChange={setNewNote}
            />
            <button
              type="button"
              onClick={() => {
                if (!newNote.content?.trim()) return
                setRegistrationNotes((n) => [...n, { ...newNote }])
                setNewNote(EMPTY_NOTE)
              }}
              disabled={!newNote.content?.trim()}
              className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add this note
            </button>
          </div>

          {/* After registration */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-xs font-semibold text-gray-900 mb-2">After Registration</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="show_token_on_registration"
                checked={formData.show_token_on_registration}
                onChange={(e) => setFormData(p => ({ ...p, show_token_on_registration: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="show_token_on_registration" className="text-xs text-gray-700">
                Show token number after registration
              </label>
            </div>
            {!formData.show_token_on_registration && (
              <Field label="Success message">
                <textarea
                  value={formData.registration_success_message}
                  onChange={(e) => setFormData(p => ({ ...p, registration_success_message: e.target.value }))}
                  rows={2}
                  className={`${inputBase} resize-none ${inputNormal}`}
                  placeholder={DEFAULT_REGISTRATION_SUCCESS_MESSAGE}
                />
                <p className="mt-1 text-[10px] text-gray-400">
                  Shown instead of the token. Use {'{{camp_name}}'} for the camp name.
                </p>
              </Field>
            )}
          </div>

          {/* Payment Settings */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-primary-600" />
              <h3 className="text-xs font-semibold text-gray-900">Payment Settings</h3>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                id="payment_enabled"
                checked={formData.payment_enabled}
                onChange={(e) => setFormData(p => ({ ...p, payment_enabled: e.target.checked }))}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="payment_enabled" className="text-xs text-gray-700">
                Require payment for registration
              </label>
            </div>

            {formData.payment_enabled && (
              <div className="space-y-3 pl-6">
                <Field label={<span>Registration Fee (₹) <span className="text-red-500">*</span></span>} error={touched.registration_fee && errors.registration_fee}>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.registration_fee}
                      onChange={(e) => { setFormData(p => ({ ...p, registration_fee: e.target.value })); touch('registration_fee') }}
                      onBlur={() => touch('registration_fee')}
                      className={`${inputBase} pl-8 ${touched.registration_fee && errors.registration_fee ? inputError : inputNormal}`}
                      placeholder="e.g., 500"
                    />
                  </div>
                </Field>

                <Field label="Payment Description">
                  <input
                    type="text"
                    value={formData.payment_description}
                    onChange={(e) => setFormData(p => ({ ...p, payment_description: e.target.value }))}
                    className={`${inputBase} ${inputNormal}`}
                    placeholder="e.g., Registration Fee for Eye Camp 2025"
                  />
                </Field>

                {/* Add-ons */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="w-4 h-4 text-primary-600" />
                    <label className="text-xs font-semibold text-gray-900">Add-ons</label>
                  </div>

                  {addOns.length > 0 && (
                    <div className="space-y-2 mb-3">
                      {addOns.map((addon, i) => (
                        <div key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                          <input
                            type="text"
                            value={addon.name}
                            onChange={e => setAddOns(a => a.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                            className="flex-1 min-w-0 px-2 py-1 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white"
                            placeholder="Item name"
                          />
                          <div className="relative w-20 flex-shrink-0">
                            <IndianRupee className="absolute left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={addon.price}
                              onChange={e => setAddOns(a => a.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))}
                              className="w-full pl-5 pr-1 py-1 text-xs border border-gray-200 rounded-md focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white text-right"
                              placeholder="0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => setAddOns(a => a.map((x, idx) => idx === i ? { ...x, optional: !x.optional } : x))}
                            className={`flex-shrink-0 text-[10px] px-1.5 py-1 rounded-md font-semibold border transition-colors ${
                              addon.optional
                                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                                : 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                            }`}
                            title={addon.optional ? 'Optional — click to make Required' : 'Required — click to make Optional'}
                          >
                            {addon.optional ? '◆' : '✓'}
                          </button>
                          <button type="button" onClick={() => setAddOns(a => a.filter((_, idx) => idx !== i))} className="p-1 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAddOn.name}
                        onChange={e => setNewAddOn(p => ({ ...p, name: e.target.value }))}
                        className={`${inputBase} flex-1 ${inputNormal}`}
                        placeholder="Item name"
                      />
                      <div className="w-20">
                        <div className="relative">
                          <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={newAddOn.price}
                            onChange={e => setNewAddOn(p => ({ ...p, price: e.target.value }))}
                            className={`${inputBase} pl-6 text-center ${inputNormal}`}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewAddOn(p => ({ ...p, optional: !p.optional }))}
                        className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 font-semibold text-xs transition-all ${
                          newAddOn.optional
                            ? 'border-amber-200 bg-amber-50 text-amber-700 hover:border-amber-300'
                            : 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                        }`}
                      >
                        {newAddOn.optional ? '◆ Optional' : '✓ Required'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newAddOn.name.trim() || !newAddOn.price) return
                          setAddOns(a => [...a, { ...newAddOn }])
                          setNewAddOn(EMPTY_ADDON)
                        }}
                        className="px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors flex-shrink-0 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>

        <div className="flex-shrink-0 border-t border-gray-100">
          {saveError && (
            <div className="flex items-start gap-2 px-4 pt-3 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500 mt-0.5" />
              {saveError}
            </div>
          )}
          <div className="flex gap-2 px-4 py-3.5">
            <button type="button" onClick={onClose} className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-60">
              {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create Camp')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
