import { IndianRupee, Tent } from 'lucide-react'
import { formatParticipantFieldValue } from '../utils/formatParticipantField'
import { formatDateDisplay } from '../utils/dateFormat'

const statusBadge = (s) => ({
	completed: 'bg-green-100 text-green-700',
	in_progress: 'bg-yellow-100 text-yellow-700',
	not_started: 'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600')

const fmtStatus = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function ParticipantTableCell({ column, participant, fieldMeta }) {
	if (column.kind === 'system') {
		switch (column.id) {
			case 'sys:token':
				return (
					<span className="inline-flex px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 font-bold text-[11px]">
						{participant.token_number}
					</span>
				)
			case 'sys:camp':
				return (
					<span className="flex items-center gap-1 text-xs text-gray-600">
						<Tent className="w-3 h-3 text-gray-400" />
						{participant.camp?.name || '—'}
					</span>
				)
			case 'sys:current_step':
				return <span className="text-xs text-gray-600">{participant.current_step?.step_name || '—'}</span>
			case 'sys:status':
				return (
					<span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(participant.status)}`}>
						{fmtStatus(participant.status)}
					</span>
				)
			case 'sys:payment':
				if (participant.payment_status === 'paid') {
					return (
						<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
							<IndianRupee className="w-2.5 h-2.5" />Paid
						</span>
					)
				}
				if (participant.payment_status === 'pending') {
					return (
						<span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">
							Pending
						</span>
					)
				}
				return <span className="text-[10px] text-gray-400">—</span>
			case 'sys:registered':
				return (
					<span className="text-[11px] text-gray-500">
						{participant.registered_at
							? formatDateDisplay(String(participant.registered_at).split('T')[0])
							: '—'}
					</span>
				)
			default:
				return <span className="text-xs text-gray-600">—</span>
		}
	}

	const value = participant.field_values?.[column.id]
	return (
		<span className="text-xs text-gray-600">
			{formatParticipantFieldValue(value, fieldMeta?.type || column.type)}
		</span>
	)
}
