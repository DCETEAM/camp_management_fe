import { isoToDisplay } from './dateFormat'

export function formatParticipantFieldValue(value, type) {
	if (value === null || value === undefined || value === '') return '—'
	if (type === 'date') {
		const display = isoToDisplay(value)
		return display || String(value)
	}
	if (type === 'checkbox' || type === 'boolean') {
		return value === true || value === 'true' || value === 1 || value === '1' ? 'Yes' : 'No'
	}
	if (Array.isArray(value)) return value.map(v => String(v)).join(', ')
	if (typeof value === 'object') return JSON.stringify(value)
	return String(value)
}
