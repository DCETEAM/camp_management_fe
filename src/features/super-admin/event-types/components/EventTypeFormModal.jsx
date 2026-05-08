import { X, Save, Loader } from 'lucide-react'

export default function EventTypeFormModal({ editingType, formData, setFormData, onSubmit, onClose, actionLoading }) {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col my-auto">
				<div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
					<h2 className="font-poppins text-sm font-bold text-gray-900">
						{editingType ? 'Edit Event Type' : 'Create Event Type'}
					</h2>
					<button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				<form onSubmit={onSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
					<div className="space-y-1.5">
						<label className="block text-xs font-semibold text-gray-700">Event Type Name <span className="text-red-500">*</span></label>
						<input
							type="text"
							required
							minLength={2}
							title="Name must be at least 2 characters"
							value={formData.name}
							onChange={(e) => setFormData({ ...formData, name: e.target.value })}
							className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
							placeholder="e.g., Eye Camp, Dental Camp"
						/>
					</div>

					<div className="space-y-1.5">
						<label className="block text-xs font-semibold text-gray-700">Description <span className="text-gray-400 font-normal">(Optional)</span></label>
						<textarea
							value={formData.description}
							onChange={(e) => setFormData({ ...formData, description: e.target.value })}
							rows={3}
							className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
							placeholder="Enter a short description"
						/>
					</div>

					<label className="flex items-center gap-3 cursor-pointer">
						<div className="relative">
							<input
								type="checkbox"
								checked={formData.active}
								onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
								className="sr-only peer"
							/>
							<div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
						</div>
						<span className="text-xs font-medium text-gray-700">Active</span>
					</label>

					<div className="flex-shrink-0 border-t border-gray-100 pt-4">
						<div className="flex gap-3">
							<button type="button" onClick={onClose} className="flex-1 px-4 py-3 text-sm border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
								Cancel
							</button>
							<button type="submit" disabled={actionLoading} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold py-3 rounded-lg transition-all disabled:from-gray-400 disabled:to-gray-400">
								{actionLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
								{editingType ? 'Save Changes' : 'Create'}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	)
}
