import { AlertTriangle, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, confirmLabel, confirmClass, icon: Icon, onConfirm, onCancel, loading }) {
	if (!open) return null

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
				<div className="flex items-start justify-between p-4 pb-3">
					<div className="flex items-center gap-3">
						<div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${confirmClass === 'danger' ? 'bg-red-100' : 'bg-amber-100'}`}>
							{Icon
								? <Icon className={`w-5 h-5 ${confirmClass === 'danger' ? 'text-red-600' : 'text-amber-600'}`} />
								: <AlertTriangle className="w-5 h-5 text-amber-600" />
							}
						</div>
						<h3 className="font-poppins text-sm font-bold text-gray-900">{title}</h3>
					</div>
					<button onClick={onCancel} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors -mt-0.5">
						<X className="w-4 h-4 text-gray-400" />
					</button>
				</div>

				<p className="px-4 pb-4 text-xs text-gray-500 leading-relaxed">{message}</p>

				<div className="flex gap-2 px-4 pb-4">
					<button
						onClick={onCancel}
						disabled={loading}
						className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
					>
						Cancel
					</button>
					<button
						onClick={onConfirm}
						disabled={loading}
						className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-50 ${
							confirmClass === 'danger'
								? 'bg-red-600 hover:bg-red-700 text-white'
								: 'bg-amber-500 hover:bg-amber-600 text-white'
						}`}
					>
						{loading ? (
							<span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
						) : Icon ? (
							<Icon className="w-3.5 h-3.5" />
						) : null}
						{confirmLabel}
					</button>
				</div>
			</div>
		</div>
	)
}
