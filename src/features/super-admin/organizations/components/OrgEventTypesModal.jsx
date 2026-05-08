import { useState, useEffect } from 'react'
import { X, Save, Loader, CheckSquare, Square, AlertCircle } from 'lucide-react'
import organizationService from '../services/organization-service'
import eventTypeService from '../../event-types/services/event-type-service'

export default function OrgEventTypesModal({ org, onClose }) {
	const [allEventTypes, setAllEventTypes] = useState([])
	const [selected, setSelected] = useState(new Set())
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState(null)

	useEffect(() => {
		const load = async () => {
			try {
				setLoading(true)
				const [all, assigned] = await Promise.all([
					eventTypeService.getEventTypes({ per_page: 100 }),
					organizationService.getOrgEventTypes(org.id),
				])
				const allList = Array.isArray(all) ? all : (all.data || [])
				setAllEventTypes(allList.filter(et => et.active))
				setSelected(new Set(assigned.map(et => et.id)))
			} catch {
				setError('Failed to load event types.')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [org.id])

	const toggle = (id) => {
		setSelected(prev => {
			const next = new Set(prev)
			next.has(id) ? next.delete(id) : next.add(id)
			return next
		})
	}

	const handleSave = async () => {
		setSaving(true)
		setError(null)
		try {
			await organizationService.syncOrgEventTypes(org.id, [...selected])
			onClose()
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to save.')
		} finally {
			setSaving(false)
		}
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
			<div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col my-auto">
				<div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
					<div>
						<h2 className="font-poppins text-sm font-bold text-gray-900">Allowed Event Types</h2>
						<p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[220px]">{org.name}</p>
					</div>
					<button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
						<X className="w-5 h-5 text-gray-500" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-4 py-3">
					{loading ? (
						<div className="flex items-center justify-center py-10 gap-2 text-xs text-gray-400">
							<Loader className="w-4 h-4 animate-spin" /> Loading…
						</div>
					) : allEventTypes.length === 0 ? (
						<p className="text-xs text-gray-400 text-center py-10">No active event types found.</p>
					) : (
						<div className="space-y-1.5">
							<p className="text-[10px] text-gray-500 mb-2">Select which event types this organization is allowed to use when creating camps. If none are selected, all active types are allowed.</p>
							{allEventTypes.map(et => (
								<button
									key={et.id}
									type="button"
									onClick={() => toggle(et.id)}
									className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
										selected.has(et.id)
											? 'bg-primary-50 border-primary-300'
											: 'bg-gray-50 border-gray-100 hover:border-gray-300'
									}`}
								>
									{selected.has(et.id)
										? <CheckSquare className="w-4 h-4 text-primary-600 flex-shrink-0" />
										: <Square className="w-4 h-4 text-gray-300 flex-shrink-0" />
									}
									<div className="min-w-0">
										<p className={`text-xs font-medium ${selected.has(et.id) ? 'text-primary-700' : 'text-gray-800'}`}>{et.name}</p>
										{et.description && <p className="text-[10px] text-gray-400 truncate">{et.description}</p>}
									</div>
								</button>
							))}
						</div>
					)}
				</div>

				<div className="flex-shrink-0 border-t border-gray-100">
					{error && (
						<div className="flex items-center gap-2 px-4 pt-3 text-xs text-red-700">
							<AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-500" />
							{error}
						</div>
					)}
					<div className="flex gap-2 px-4 py-3.5">
						<button type="button" onClick={onClose} className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
						<button onClick={handleSave} disabled={saving || loading} className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-60">
							{saving ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
							{saving ? 'Saving…' : `Save (${selected.size} selected)`}
						</button>
					</div>
				</div>
			</div>
		</div>
	)
}
