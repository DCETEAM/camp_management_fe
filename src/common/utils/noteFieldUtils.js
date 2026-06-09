/** Resolve dynamic placeholders in camp registration notes. */

export const NOTE_PLACEHOLDERS = [
	{ token: '{{limit}}', description: 'Spot limit (e.g. 10)' },
	{ token: '{{reward}}', description: 'Reward name you set (e.g. gold coin)' },
	{ token: '{{spots_remaining}}', description: 'Spots left for the reward' },
	{ token: '{{registration_count}}', description: 'People registered so far' },
	{ token: '{{offer_status}}', description: 'Available or Ended' },
	{ token: '{{registration_fee}}', description: 'Fee (only if payment enabled)' },
	{ token: '{{camp_name}}', description: 'Camp name' },
]

export const REWARD_NOTE_TEMPLATE =
	'First {{limit}} participants will get {{reward}}! Only {{spots_remaining}} spots left.'

export function buildNoteFieldFromDraft(note = {}) {
	const content = note.content?.trim()
	if (!content) return null

	return {
		content,
		style: note.style || 'success',
	}
}

export function serializeRegistrationNote(note) {
	return buildNoteFieldFromDraft(note)
}

export function resolveNoteContent(content = '', field = {}, campContext = {}) {
	if (!content) return ''

	const count = Number(campContext.participant_count ?? campContext.registration_count ?? 0)
	const fee = campContext.registration_fee
	const feeText = fee !== undefined && fee !== null && fee !== ''
		? `₹${parseFloat(fee).toFixed(2)}`
		: '—'

	const limit = field.limit != null && field.limit !== '' ? parseInt(field.limit, 10) : null
	const spotsLeft = limit != null && !Number.isNaN(limit) ? Math.max(0, limit - count) : null
	const spotsRemaining = spotsLeft != null ? String(spotsLeft) : '—'
	const reward = field.reward?.trim() || '—'

	const replacements = {
		'{{registration_count}}': String(count),
		'{{registration_fee}}': feeText,
		'{{spots_remaining}}': spotsRemaining,
		'{{limit}}': limit != null && !Number.isNaN(limit) ? String(limit) : '—',
		'{{reward}}': reward,
		'{{offer_status}}': spotsLeft != null ? (spotsLeft > 0 ? 'Available' : 'Ended') : '—',
		'{{camp_name}}': campContext.name ?? '—',
		'{{payment_description}}': campContext.payment_description?.trim() || '—',
	}

	let text = content
	for (const [token, value] of Object.entries(replacements)) {
		text = text.split(token).join(value)
	}
	return text
}
