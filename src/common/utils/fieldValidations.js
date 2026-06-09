/** Validation presets — keep in sync with backend App\Support\FieldValidation */

export const FIELD_VALIDATION_OPTIONS = [
	{ value: 'none', label: 'None (basic text)', types: ['text', 'textarea'] },
	{ value: 'name', label: 'Name (letters & spaces only)', types: ['text', 'textarea'] },
	{ value: 'phone_in', label: 'Phone (10 digits, starts 6–9)', types: ['text'] },
	{ value: 'email', label: 'Email address', types: ['text'] },
	{ value: 'pincode', label: 'PIN code (6 digits)', types: ['text', 'number'] },
	{ value: 'date', label: 'Date', types: ['date', 'text'] },
	{ value: 'integer', label: 'Whole number', types: ['number', 'text'] },
	{ value: 'decimal', label: 'Decimal number', types: ['number', 'text'] },
	{ value: 'age', label: 'Age (0–130)', types: ['number', 'text'] },
]

export const FIELD_VALIDATION_LABELS = Object.fromEntries(
	FIELD_VALIDATION_OPTIONS.map((o) => [o.value, o.label])
)

export function getValidationsForFieldType(type) {
	const t = type || 'text'
	if (t === 'dropdown' || t === 'boolean' || t === 'file' || t === 'image') {
		return [{ value: 'none', label: 'None', types: [t] }]
	}
	if (t === 'date') {
		return [{ value: 'date', label: 'Date', types: ['date'] }]
	}
	return FIELD_VALIDATION_OPTIONS.filter((o) => o.types.includes(t))
}

export function defaultValidationForType(type) {
	if (type === 'date') return 'date'
	if (type === 'number') return 'decimal'
	return 'none'
}

export function resolveFieldValidation(field) {
	if (field?.validation && field.validation !== 'none') {
		return field.validation
	}
	const key = (field?.key || '').toLowerCase()
	if (key === 'phone' || key === 'phone_number') return 'phone_in'
	if (['name', 'full_name', 'fullname', 'patient_name'].includes(key)) return 'name'
	return defaultValidationForType(field?.type)
}

function isEmpty(value) {
	return value === undefined || value === null || value === ''
}

export function validateByPreset(preset, value, { required = false, label = 'This field' } = {}) {
	if (isEmpty(value) || (typeof value === 'string' && !value.trim())) {
		return required ? `${label} is required.` : null
	}

	const v = typeof value === 'string' ? value.trim() : value

	switch (preset) {
		case 'name': {
			if (!/^[a-zA-Z\s.'-]+$/.test(v)) {
				return 'Only letters and spaces are allowed.'
			}
			if (v.length < 2) return 'Must be at least 2 characters.'
			return null
		}
		case 'phone_in': {
			const digits = String(v).replace(/\D/g, '')
			if (!/^[6-9]\d{9}$/.test(digits)) {
				return 'Enter a valid 10-digit mobile number starting with 6–9.'
			}
			return null
		}
		case 'email': {
			if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
				return 'Enter a valid email address.'
			}
			return null
		}
		case 'date': {
			const d = new Date(v)
			if (Number.isNaN(d.getTime())) return 'Enter a valid date.'
			return null
		}
		case 'integer': {
			if (!/^-?\d+$/.test(String(v))) return 'Enter a whole number.'
			return null
		}
		case 'decimal': {
			const n = Number(v)
			if (Number.isNaN(n)) return 'Enter a valid number.'
			return null
		}
		case 'age': {
			const age = parseInt(v, 10)
			if (Number.isNaN(age) || age < 0 || age > 130) return 'Enter a valid age (0–130).'
			return null
		}
		case 'pincode': {
			if (!/^\d{6}$/.test(String(v).replace(/\s/g, ''))) {
				return 'Enter a valid 6-digit PIN code.'
			}
			return null
		}
		default:
			return null
	}
}
