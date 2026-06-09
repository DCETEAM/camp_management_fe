import {
	defaultValidationForType,
	resolveFieldValidation,
	validateByPreset,
} from './fieldValidations'
export const PHONE_FIELD_KEYS = ['phone', 'phone_number']

export const PARTICIPANT_FIELD_KEYS = ['name', 'age', 'gender', 'full_name', 'fullname']

export function normalizeFieldKey(key) {
	return (key || '').toLowerCase()
}

export function isPhoneFieldKey(key) {
	return PHONE_FIELD_KEYS.includes(normalizeFieldKey(key))
}

export function isParticipantFieldKey(key) {
	return PARTICIPANT_FIELD_KEYS.includes(normalizeFieldKey(key))
}

export function normalizeParticipantKey(key) {
	switch (normalizeFieldKey(key)) {
		case 'name':
		case 'full_name':
		case 'fullname':
			return 'name'
		case 'age':
			return 'age'
		case 'gender':
			return 'gender'
		default:
			return null
	}
}

export function getEditableFormFields(formFields = []) {
	return formFields
}

export function getCustomFormFields(formFields = []) {
	return formFields
}

export function buildInitialFieldValues(formFields = []) {
	const values = {}
	formFields.forEach((field) => {
		if (field.type === 'note') return
		if (field.type === 'boolean') {
			values[field.key] = ''
			return
		}
		if (field.type === 'dropdown' && field.options?.length) {
			values[field.key] = field.options[0]
			return
		}
		values[field.key] = ''
	})
	return values
}

export function validateFieldValue(field, value, fileValue) {
	if (field.type === 'note') return null

	if (field.type === 'file' || field.type === 'image') {
		if (!field.required) return null
		return fileValue ? null : `${field.label} is required.`
	}

	if (field.type === 'dropdown' || field.type === 'boolean') {
		if (!field.required) return null
		if (value === undefined || value === null || value === '') {
			return `${field.label} is required.`
		}
		return null
	}

	const preset = resolveFieldValidation(field)
	const formatError = validateByPreset(preset, value, {
		required: false,
		label: field.label,
	})

	if (formatError) return formatError

	if (!field.required) return null

	const val = value
	if (val === undefined || val === null || val === '') {
		return `${field.label} is required.`
	}

	return null
}

export function validateFormFields(formFields = [], values = {}, files = {}) {
	const errors = {}

	formFields.forEach((field) => {
		const error = validateFieldValue(
			field,
			values[field.key],
			files[field.key]
		)
		if (error) {
			errors[field.key] = error
		}
	})

	return errors
}

export function buildResponseData(values = {}, formFields = [], extra = {}) {
	const responseData = { ...extra }

	formFields.forEach((field) => {
		if (field.type === 'note' || field.type === 'file' || field.type === 'image') return
		const value = values[field.key]
		if (value !== undefined && value !== null && value !== '') {
			const preset = resolveFieldValidation(field)
			if (preset === 'age' || preset === 'integer') {
				responseData[field.key] = parseInt(value, 10)
			} else if (preset === 'decimal') {
				responseData[field.key] = parseFloat(value)
			} else if (preset === 'phone_in') {
				responseData[field.key] = String(value).replace(/\D/g, '')
			} else {
				responseData[field.key] = value
			}
		}
	})

	return responseData
}

/** Profile snapshot for payment APIs (not stored on participants table). */
export function extractParticipantPayload(values = {}, formFields = []) {
	return buildResponseData(values, formFields)
}
