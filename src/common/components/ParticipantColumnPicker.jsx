import { useState, useEffect, useRef, useMemo } from 'react'
import { X, Columns3, GripVertical, Lock } from 'lucide-react'
import {
	getAvailableSystemColumns,
	fieldsGroupedByStep,
	orderTableColumnIds,
	getColumnLabelById,
	withoutPaymentColumn,
} from '../utils/participantColumns'

const TOKEN_ID = 'sys:token'

export default function ParticipantColumnPicker({
	open,
	onClose,
	catalog,
	scope,
	selectedIds,
	onSave,
	campRequired = false,
	paymentEnabled = false,
}) {
	const [draft, setDraft] = useState(selectedIds)
	const [draggingId, setDraggingId] = useState(null)
	const dragIndex = useRef(null)

	useEffect(() => {
		if (!open) return
		const ids = paymentEnabled ? selectedIds : withoutPaymentColumn(selectedIds)
		setDraft(ids)
	}, [open, selectedIds, paymentEnabled])

	const systemCols = getAvailableSystemColumns(scope, { paymentEnabled })
	const stepGroups = fieldsGroupedByStep(catalog)

	const orderedDraft = useMemo(() => orderTableColumnIds(draft), [draft])
	const tokenPinned = orderedDraft.includes(TOKEN_ID)
	const reorderableIds = useMemo(
		() => orderedDraft.filter(id => id !== TOKEN_ID),
		[orderedDraft],
	)

	if (!open) return null

	const toggle = (id) => {
		setDraft(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
	}

	const setReorderable = (nextReorderable) => {
		setDraft(tokenPinned ? [TOKEN_ID, ...nextReorderable] : nextReorderable)
	}

	const onDragStart = (index, id) => {
		dragIndex.current = index
		setDraggingId(id)
	}

	const onDragOver = (e, index) => {
		e.preventDefault()
		if (dragIndex.current === null || dragIndex.current === index) return
		const next = [...reorderableIds]
		const [moved] = next.splice(dragIndex.current, 1)
		next.splice(index, 0, moved)
		dragIndex.current = index
		setReorderable(next)
	}

	const onDragEnd = () => {
		dragIndex.current = null
		setDraggingId(null)
	}

	const handleSave = () => {
		const ids = paymentEnabled ? draft : withoutPaymentColumn(draft)
		onSave(orderTableColumnIds(ids))
		onClose()
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
			<div
				className="bg-white w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[85vh]"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
					<div className="flex items-center gap-2">
						<Columns3 className="w-4 h-4 text-primary-600" />
						<h2 className="font-poppins text-sm font-bold text-gray-900">Table Columns</h2>
					</div>
					<button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
						<X className="w-4 h-4 text-gray-500" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-5 space-y-5">
					{campRequired && !catalog ? (
						<p className="text-xs text-gray-500 text-center py-6">
							Select a camp first to choose form fields from its registration steps.
						</p>
					) : (
						<>
							{orderedDraft.length > 0 && (
								<div>
									<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Column order</p>
									<p className="text-[11px] text-gray-400 mb-2">Drag to reorder. Token stays first when enabled.</p>
									<div className="space-y-1.5 rounded-lg border border-gray-100 p-2 bg-gray-50/50">
										{tokenPinned && (
											<div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border border-gray-100">
												<Lock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
												<span className="text-xs font-medium text-gray-700 flex-1">
													{getColumnLabelById(TOKEN_ID, catalog, scope)}
												</span>
												<span className="text-[10px] text-gray-400">1st</span>
											</div>
										)}
										{reorderableIds.map((id, index) => (
											<div
												key={id}
												draggable
												onDragStart={() => onDragStart(index, id)}
												onDragOver={e => onDragOver(e, index)}
												onDragEnd={onDragEnd}
												className={`flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white border transition-all ${
													draggingId === id
														? 'opacity-50 border-primary-400 shadow-md'
														: 'border-gray-100 hover:border-gray-200'
												}`}
											>
												<div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 flex-shrink-0">
													<GripVertical className="w-4 h-4" />
												</div>
												<span className="text-xs font-medium text-gray-700 flex-1">
													{getColumnLabelById(id, catalog, scope)}
												</span>
											</div>
										))}
									</div>
								</div>
							)}

							<div>
								<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">System</p>
								<div className="space-y-1.5">
									{systemCols.map(col => (
										<label key={col.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
											<input
												type="checkbox"
												checked={draft.includes(col.id)}
												onChange={() => toggle(col.id)}
												className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
											/>
											<span className="text-xs text-gray-700">{col.label}</span>
										</label>
									))}
								</div>
							</div>

							{stepGroups.map(({ step, fields }) => (
								<div key={step.id ?? step.step_name}>
									<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
										{step.step_name || `Step ${step.step_order}`}
									</p>
									<div className="space-y-1.5">
										{fields.map(field => (
											<label key={field.id} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer">
												<input
													type="checkbox"
													checked={draft.includes(field.id)}
													onChange={() => toggle(field.id)}
													className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
												/>
												<span className="text-xs text-gray-700">{field.label}</span>
												<span className="text-[10px] text-gray-400 ml-auto">{field.type}</span>
											</label>
										))}
									</div>
								</div>
							))}

							{!stepGroups.length && (
								<p className="text-xs text-gray-400 text-center py-4">No form fields found for this camp.</p>
							)}
						</>
					)}
				</div>

				<div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
					<button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg">
						Cancel
					</button>
					<button
						onClick={handleSave}
						disabled={campRequired && !catalog}
						className="px-4 py-2 text-xs font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-40"
					>
						Save Columns
					</button>
				</div>
			</div>
		</div>
	)
}
