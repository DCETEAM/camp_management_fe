import { useState } from 'react'
import { X, Save, Loader } from 'lucide-react'
import { validateOrgForm, hasErrors } from '../../../../common/utils/validation'

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

export default function OrganizationFormModal({ editingOrg, formData, setFormData, onSubmit, onClose, actionLoading }) {
	const [touched, setTouched] = useState({})
	const errors = validateOrgForm(formData)

	const touch = (field) => setTouched(t => ({ ...t, [field]: true }))

	const handleSubmit = (e) => {
		e.preventDefault()
		setTouched({ name: true, type: true, email: true, phone: true })
		if (hasErrors(errors)) return
		onSubmit(e)
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto">
				<div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
					<h2 className="font-poppins text-sm font-bold text-gray-900">
						{editingOrg ? 'Edit Organization' : 'Create Organization'}
					</h2>
					<button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

					<form onSubmit={handleSubmit} className="px-4 py-4 space-y-4 overflow-y-auto flex-1">
					<Field label="Organization Name" required error={touched.name && errors.name}>
						<input
							type="text"
							value={formData.name}
							onChange={(e) => { setFormData({ ...formData, name: e.target.value }); touch('name') }}
							onBlur={() => touch('name')}
							className={`${inputBase} ${touched.name && errors.name ? inputError : inputNormal}`}
							placeholder="e.g. City General Hospital"
						/>
					</Field>

					<Field label="Type" required error={touched.type && errors.type}>
						<input
							type="text"
							value={formData.type}
							onChange={(e) => { setFormData({ ...formData, type: e.target.value }); touch('type') }}
							onBlur={() => touch('type')}
							className={`${inputBase} ${touched.type && errors.type ? inputError : inputNormal}`}
							placeholder="e.g., Hospital, NGO, Government"
						/>
					</Field>

					<Field label="Email" required error={touched.email && errors.email}>
						<input
							type="text"
							value={formData.email}
							onChange={(e) => { setFormData({ ...formData, email: e.target.value }); touch('email') }}
							onBlur={() => touch('email')}
							className={`${inputBase} ${touched.email && errors.email ? inputError : inputNormal}`}
							placeholder="contact@organization.org"
						/>
					</Field>

					<Field label="Phone" required error={touched.phone && errors.phone}>
						<input
							type="tel"
							value={formData.phone}
							onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); touch('phone') }}
							onBlur={() => touch('phone')}
							className={`${inputBase} ${touched.phone && errors.phone ? inputError : inputNormal}`}
							placeholder="+91 98765 43210"
						/>
					</Field>

					<div className="space-y-1.5">
						<label className="block text-xs font-semibold text-gray-700">Address <span className="text-gray-400 font-normal">(Optional)</span></label>
						<textarea
							value={formData.address}
							onChange={(e) => setFormData({ ...formData, address: e.target.value })}
							rows={3}
							className={`${inputBase} resize-none`}
							placeholder="Enter address"
						/>
					</div>

					<label className="flex items-center gap-3 cursor-pointer">
						<div className="relative">
							<input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} className="sr-only peer" />
							<div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
						</div>
						<span className="text-xs font-medium text-gray-700">Active</span>
					</label>
				</form>

				<div className="flex-shrink-0 border-t border-gray-100 px-4 py-4">
					<div className="flex gap-3">
						<button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
						<button onClick={handleSubmit} disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold py-3 rounded-lg transition-all disabled:from-gray-400 disabled:to-gray-400">
							{actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
							{editingOrg ? 'Save Changes' : 'Create'}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
