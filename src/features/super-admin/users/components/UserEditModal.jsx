import { useState, useEffect } from 'react'
import { X, Save, Loader, Eye, EyeOff } from 'lucide-react'
import { validate, hasErrors } from '../../../../common/utils/validation'
import organizationService from '../../organizations/services/organization-service'

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'org_admin', label: 'Org Admin' },
  { value: 'organizer', label: 'Organizer' },
  { value: 'staff', label: 'Staff' },
]

const inputBase = 'w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all'
const inputError = 'border-red-400 bg-red-50'
const inputNormal = 'border-gray-200'

function Field({ label, error, children, required = false }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-[10px] text-red-600">{error}</p>}
    </div>
  )
}

const validateUserForm = (data) => ({
  name: validate.name(data.name),
  email: validate.email(data.email),
  phone: validate.required(data.phone, 'Phone number'),
  new_password: data.new_password && data.new_password.length < 8 ? 'Minimum 8 characters.' : null,
  confirm_password: data.new_password && data.confirm_password !== data.new_password ? 'Passwords do not match.' : null,
})

export default function UserEditModal({ user, onSave, onClose, saving, saveError, fixedOrgId }) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    role: user.role || 'staff',
    phone: user.phone || '',
    org_id: user.organization?.id || user.org_id || '',
    active: Boolean(user.active),
    new_password: '',
    confirm_password: '',
  })
  const [touched, setTouched] = useState({})
  const [organizations, setOrganizations] = useState([])
  const [showPassword, setShowPassword] = useState(false)
  const errors = validateUserForm(formData)

  useEffect(() => {
    organizationService.getOrganizations({ per_page: 100 }).then(data => {
      const list = Array.isArray(data) ? data : (data.data || [])
      setOrganizations(list.filter(o => o.active))
    }).catch(() => {})
  }, [])

  const touch = (field) => setTouched(t => ({ ...t, [field]: true }))

  const handleSubmit = (e) => {
    e?.preventDefault()
    setTouched({ name: true, email: true, phone: true, new_password: true, confirm_password: true })
    if (hasErrors(errors)) return
    const payload = { ...formData }
    delete payload.confirm_password
    if (!payload.new_password) delete payload.new_password
    onSave(payload)
  }

  const needsOrg = !fixedOrgId && formData.role !== 'super_admin'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col my-auto">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-poppins text-sm font-bold text-gray-900">Edit User</h2>
            <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[220px]">{user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-3 overflow-y-auto flex-1">
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

          <Field label="Full Name" required error={touched.name && errors.name}>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => { setFormData(p => ({ ...p, name: e.target.value })); touch('name') }}
              onBlur={() => touch('name')}
              className={`${inputBase} ${touched.name && errors.name ? inputError : inputNormal}`}
              placeholder="Enter full name"
            />
          </Field>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
              className={`${inputBase} ${inputNormal} bg-white`}
            >
              {ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {needsOrg && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Organization</label>
              <select
                value={formData.org_id}
                onChange={(e) => setFormData(p => ({ ...p, org_id: e.target.value ? parseInt(e.target.value) : '' }))}
                className={`${inputBase} ${inputNormal} bg-white`}
              >
                <option value="">— Select organization —</option>
                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
          )}

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

          <Field label="New Password (optional)" error={touched.new_password && errors.new_password}>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.new_password}
                onChange={(e) => { setFormData(p => ({ ...p, new_password: e.target.value })); touch('new_password') }}
                onBlur={() => touch('new_password')}
                className={`${inputBase} pr-9 ${touched.new_password && errors.new_password ? inputError : inputNormal}`}
                placeholder="Leave blank to keep current"
              />
              <button type="button" onClick={() => setShowPassword(s => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </Field>

          {formData.new_password ? (
            <Field label="Confirm New Password" error={touched.confirm_password && errors.confirm_password}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.confirm_password}
                onChange={(e) => { setFormData(p => ({ ...p, confirm_password: e.target.value })); touch('confirm_password') }}
                onBlur={() => touch('confirm_password')}
                className={`${inputBase} ${touched.confirm_password && errors.confirm_password ? inputError : inputNormal}`}
                placeholder="Re-enter new password"
              />
            </Field>
          ) : null}

          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input type="checkbox" checked={formData.active} onChange={(e) => setFormData(p => ({ ...p, active: e.target.checked }))} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </div>
            <span className="text-xs font-medium text-gray-700">Active</span>
          </label>
        </form>

        <div className="flex-shrink-0 border-t border-gray-100">
          {saveError && (
            <div className="px-4 pt-3 text-xs text-red-700 flex items-center gap-2">
              <span className="w-3.5 h-3.5 flex-shrink-0 text-red-500">!</span>
              {saveError}
            </div>
          )}
          <div className="flex gap-2 px-4 py-3.5">
            <button type="button" onClick={onClose} className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            <button onClick={handleSubmit} disabled={saving} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-60">
              {saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
