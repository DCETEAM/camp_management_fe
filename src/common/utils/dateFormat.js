/** Date helpers — display dd/mm/yyyy, store yyyy-mm-dd for API. */

export function isoToDisplay(iso) {
	if (!iso) return ''
	const part = String(iso).split('T')[0]
	const [y, m, d] = part.split('-')
	if (!y || !m || !d) return ''
	return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
}

export function displayToIso(display) {
	const trimmed = (display || '').trim()
	const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
	if (!match) return null

	const day = parseInt(match[1], 10)
	const month = parseInt(match[2], 10)
	const year = parseInt(match[3], 10)
	if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1000) return null

	const date = new Date(year, month - 1, day)
	if (
		date.getFullYear() !== year
		|| date.getMonth() !== month - 1
		|| date.getDate() !== day
	) {
		return null
	}

	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function formatDateInputMask(raw) {
	const digits = String(raw || '').replace(/\D/g, '').slice(0, 8)
	if (digits.length <= 2) return digits
	if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
	return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

export function formatDateDisplay(iso, fallback = '—') {
	const text = isoToDisplay(iso)
	return text || fallback
}

export function isIsoOnOrAfter(iso, minIso) {
	if (!iso || !minIso) return true
	return iso >= minIso
}
