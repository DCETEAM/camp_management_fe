import { Trash2 } from 'lucide-react'
import FormNoteField from './FormNoteField'
import { buildNoteFieldFromDraft } from '../utils/noteFieldUtils'

const STYLE_OPTIONS = [
	{ value: 'success', label: 'Green highlight' },
	{ value: 'warning', label: 'Amber highlight' },
	{ value: 'info', label: 'Blue highlight' },
]

export default function RegistrationNoteEditor({
	note,
	onChange,
	onRemove,
	campPreview = {},
	showRemove = false,
	compact = false,
}) {
	const previewField = buildNoteFieldFromDraft(note)
	const canPreview = !!previewField

	const update = (patch) => onChange?.({ ...note, ...patch })

	return (
		<div className={`space-y-2.5 ${compact ? '' : 'p-2.5 border border-dashed border-gray-300 rounded-lg bg-gray-50/50'}`}>
			<div>
				<label className="block text-[10px] font-semibold text-gray-600 mb-1">
					Message <span className="text-red-500">*</span>
				</label>
				<textarea
					value={note.content ?? ''}
					onChange={(e) => update({ content: e.target.value })}
					rows={3}
					className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
					placeholder="e.g. First 10 participants will get a gold coin!"
				/>
			</div>

			<div className="flex gap-2 items-end">
				<div className="flex-1">
					<label className="block text-[10px] font-semibold text-gray-600 mb-1">Highlight colour</label>
					<select
						value={note.style || 'success'}
						onChange={(e) => update({ style: e.target.value })}
						className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500 outline-none"
					>
						{STYLE_OPTIONS.map((o) => (
							<option key={o.value} value={o.value}>{o.label}</option>
						))}
					</select>
				</div>
				{showRemove && onRemove && (
					<button
						type="button"
						onClick={onRemove}
						className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
						title="Remove note"
					>
						<Trash2 className="w-4 h-4" />
					</button>
				)}
			</div>

			<div className="pt-1">
				<p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
					Preview — shown on registration form
				</p>
				{canPreview ? (
					<FormNoteField field={previewField} campContext={{ participant_count: 0, ...campPreview }} />
				) : (
					<p className="text-[10px] text-gray-400 italic px-1">
						Type your message above to see the preview.
					</p>
				)}
			</div>
		</div>
	)
}
