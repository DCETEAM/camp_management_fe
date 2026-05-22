import { useState, useEffect } from 'react'
import { X, Send, Loader, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { validate, hasErrors } from '../../../../common/utils/validation'
import organizationService from '../../organizations/services/organization-service'

const ROLE_OPTIONS = [
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'staff', label: 'Staff' },
]

const inputBase = 'w-full px-3 py-2.5 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all'
const inputError = 'border-red-400 bg-red-50'
const inputNormal = 'border-gray-200'

function Field({ label, error, children, required = false }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500"> *</span>}
        {!required && <span className="text-gray-400 font-normal"> (Optional)</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-600">{error}</p>}
    </div>
  )
}

const EMPTY = { name: '', email: '', role: 'staff', phone: '', org_id: '', password: '', password_confirmation: '' }

const validateForm = (d, fixedOrgId) => ({
  name: validate.name(d.name),
  email: validate.email(d.email),
  phone: validate.phone(d.phone) || validate.required(d.phone, 'Phone number'),
  org_id: !fixedOrgId && d.role !== 'super_admin' && !d.org_id ? 'Organization is required.' : null,
  password: !d.password ? 'Password is required.' : d.password.length < 8 ? 'Minimum 8 characters.' : null,
  password_confirmation: d.password_confirmation !== d.password ? 'Passwords do not match.' : null,
})

export default function InviteUserModal({ onInvite, onClose, saving, saveError, fixedOrgId }) {
  const [formData, setFormData] = useState(EMPTY)
  const [touched, setTouched] = useState({})
  const [organizations, setOrganizations] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const errors = validateForm(formData, fixedOrgId)

  useEffect(() => {
    if (fixedOrgId) return
    organizationService.getOrganizations({ per_page: 100 }).then(data => {
      const list = Array.isArray(data) ? data : (data.data || [])
      setOrganizations(list.filter(o => o.active))
    }).catch(() => {})
  }, [fixedOrgId])

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }))

  const handleSubmit = (e) => {
    e?.preventDefault()
    setTouched({ name: true, email: true, phone: true, org_id: true, password: true, password_confirmation: true })
    if (hasErrors(errors)) return
    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: formData.role,
      phone: formData.phone.trim(),
      org_id: formData.org_id ? parseInt(formData.org_id) : null,
    }
    onInvite(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col my-auto">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-poppins text-sm font-bold text-gray-900">Add User</h2>
            <p className="text-[10px] text-gray-400 mt-0.5">Create a new user account</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 overflow-y-auto flex-1">
          <Field label="Full Name" required error={touched.name && errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); touch('name') }}
              onBlur={() => touch('name')}
              className={`${inputBase} ${touched.name && errors.name ? inputError : inputNormal}`}
              placeholder="e.g. John Doe"
            />
          </Field>

          <Field label="Email" required error={touched.email && errors.email}>
            <input
              type="text"
              value={formData.email}
              onChange={(e) => { setFormData(p => ({ ...p, email: e.target.value })); touch('email') }}
              onBlur={() => touch('email')}
              className={`${inputBase} ${touched.email && errors.email ? inputError : inputNormal}`}
              placeholder="user@example.com"
            />
          </Field>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-gray-700">Role <span className="text-red-500">*</span></label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
              className={`${inputBase} ${inputNormal} bg-white`}
            >
              {(fixedOrgId
              ? ROLE_OPTIONS.filter(r => r.value !== 'org_admin')
              : ROLE_OPTIONS
            ).map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {!fixedOrgId && (
            <Field label="Organization" required error={touched.org_id && errors.org_id}>
              <select
                value={formData.org_id}
                onChange={(e) => { setFormData(p => ({ ...p, org_id: e.target.value })); touch('org_id') }}
                onBlur={() => touch('org_id')}
                className={`${inputBase} ${touched.org_id && errors.org_id ? inputError : inputNormal} bg-white`}
              >
                <option value="">— Select organization —</option>
                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </Field>
          )}

          <Field label="Password" required error={touched.password && errors.password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => { setFormData(p => ({ ...p, password: e.target.value })); touch('password') }}
                onBlur={() => touch('password')}
                className={`${inputBase} pr-9 ${touched.password && errors.password ? inputError : inputNormal}`}
                placeholder="Min. 8 characters"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </Field>

          <Field label="Confirm Password" required error={touched.password_confirmation && errors.password_confirmation}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.password_confirmation}
              onChange={(e) => { setFormData(p => ({ ...p, password_confirmation: e.target.value })); touch('password_confirmation') }}
              onBlur={() => touch('password_confirmation')}
              className={`${inputBase} ${touched.password_confirmation && errors.password_confirmation ? inputError : inputNormal}`}
              placeholder="Re-enter password"
            />
          </Field>

          <Field label="Phone" required error={touched.phone && errors.phone}>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => { setFormData(p => ({ ...p, phone: e.target.value })); touch('phone') }}
              onBlur={() => touch('phone')}
              className={`${inputBase} ${touched.phone && errors.phone ? inputError : inputNormal}`}
              placeholder="+91 98765 43210"
            />
          </Field>
        </form>

        <div className="flex-shrink-0 border-t border-gray-100">
          {saveError && (
            <div className="flex items-start gap-2 px-4 pt-3 text-xs text-red-700">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500 mt-0.5" />
              {saveError}
            </div>
          )}
          <div className="flex gap-3 px-4 py-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold py-3 rounded-lg transition-all disabled:opacity-60">
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {saving ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
