import { Info, AlertTriangle, Sparkles } from 'lucide-react'
import { resolveNoteContent } from '../utils/noteFieldUtils'

const STYLES = {
	info: {
		wrap: 'bg-blue-50 border-blue-200 text-blue-900',
		icon: Info,
		iconClass: 'text-blue-500',
	},
	warning: {
		wrap: 'bg-amber-50 border-amber-300 text-amber-950',
		icon: AlertTriangle,
		iconClass: 'text-amber-500',
	},
	success: {
		wrap: 'bg-emerald-50 border-emerald-200 text-emerald-900',
		icon: Sparkles,
		iconClass: 'text-emerald-500',
	},
}

export default function FormNoteField({ field, campContext = {} }) {
	const count = Number(campContext.participant_count ?? campContext.registration_count ?? 0)
	const limit = field.limit != null && field.limit !== '' ? parseInt(field.limit, 10) : null
	const offerEnded = limit != null && !Number.isNaN(limit) && Math.max(0, limit - count) === 0

	const style = offerEnded
		? { wrap: 'bg-gray-100 border-gray-300 text-gray-600', icon: AlertTriangle, iconClass: 'text-gray-400' }
		: (STYLES[field.style] || STYLES.success)
	const Icon = style.icon
	const text = resolveNoteContent(field.content || field.label, field, campContext)

	if (!text.trim()) return null

	return (
		<div className={`flex gap-2.5 px-3.5 py-3 rounded-lg border ${style.wrap}`}>
			<Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${style.iconClass}`} />
			<p className="text-xs leading-relaxed whitespace-pre-wrap">{text}</p>
		</div>
	)
}
