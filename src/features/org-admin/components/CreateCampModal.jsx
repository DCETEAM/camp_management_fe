import { useState, useEffect } from 'react'
import { X, Save, Loader, AlertCircle, CalendarCheck, Calendar, MapPin } from 'lucide-react'
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

const EMPTY = { name: '', event_type_id: '', camp_date: '', location: '' }

export default function CreateCampModal({ onClose, onCreated }) {
  const { user } = useAuth()
  const [formData, setFormData] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [eventTypes, setEventTypes] = useState([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    if (user?.org_id) {
      orgAdminService.getAllowedEventTypes(user.org_id).then(data => {
        const list = Array.isArray(data) ? data : (data.data || [])
        setEventTypes(list.filter(e => e.active !== false))
      }).catch(() => {})
    }
  }, [user])

  const errors = {
    name: !formData.name.trim() ? 'Camp name is required.' : formData.name.trim().length < 2 ? 'Minimum 2 characters.' : null,
    event_type_id: !formData.event_type_id ? 'Event type is required.' : null,
    camp_date: !formData.camp_date ? 'Camp date is required.' : null,
    location: !formData.location.trim() ? 'Location is required.' : null,
  }

  const hasErrors = Object.values(errors).some(Boolean)
  const touch = (f) => setTouched(t => ({ ...t, [f]: true }))

  const handleSubmit = async (e) => {
    e?.preventDefault()
    setTouched({ name: true, event_type_id: true, camp_date: true, location: true })
    if (hasErrors) return
    setSaveError(null)
    try {
      setSaving(true)
      await orgAdminService.createCamp({
        name: formData.name.trim(),
        event_type_id: parseInt(formData.event_type_id),
        camp_date: formData.camp_date,
        location: formData.location.trim(),
      })
      onCreated()
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to create camp.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl w-full sm:max-w-md max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-poppins text-sm font-bold text-gray-900">Create Camp</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Set up a new camp for your organization</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3 overflow-y-auto flex-1">
          <Field label="Camp Name *" error={touched.name && errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); touch('name') }}
              onBlur={() => touch('name')}
              className={`${inputBase} ${touched.name && errors.name ? inputError : inputNormal}`}
              placeholder="e.g., Coimbatore Eye Camp Jan 2025"
            />
          </Field>

          <Field label="Event Type *" error={touched.event_type_id && errors.event_type_id}>
            <div className="relative">
              <CalendarCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <select
                value={formData.event_type_id}
                onChange={(e) => { setFormData(p => ({ ...p, event_type_id: e.target.value })); touch('event_type_id') }}
                onBlur={() => touch('event_type_id')}
                className={`${inputBase} pl-8 bg-white ${touched.event_type_id && errors.event_type_id ? inputError : inputNormal}`}
              >
                <option value="">— Select event type —</option>
                {eventTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </Field>

          <Field label="Camp Date *" error={touched.camp_date && errors.camp_date}>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              <input
                type="date"
                value={formData.camp_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => { setFormData(p => ({ ...p, camp_date: e.target.value })); touch('camp_date') }}
                onBlur={() => touch('camp_date')}
                className={`${inputBase} pl-8 ${touched.camp_date && errors.camp_date ? inputError : inputNormal}`}
              />
            </div>
          </Field>

          <Field label="Location *" error={touched.location && errors.location}>
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
              {saving ? 'Creating…' : 'Create Camp'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
