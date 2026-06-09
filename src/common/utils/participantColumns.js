const STORAGE_PREFIX = 'participant-columns'

export const PAYMENT_COLUMN_ID = 'sys:payment'

export const SYSTEM_COLUMNS = [
	{ id: 'sys:token', label: 'Token' },
	{ id: 'sys:camp', label: 'Camp', orgOnly: true },
	{ id: 'sys:current_step', label: 'Current Step', campOnly: true },
	{ id: 'sys:status', label: 'Status' },
	{ id: PAYMENT_COLUMN_ID, label: 'Payment', requiresPayment: true },
	{ id: 'sys:registered', label: 'Registered' },
]

export function isPaymentEnabled(camp) {
	return camp?.payment_enabled === true || camp?.payment_enabled === 1
}

export function withoutPaymentColumn(columnIds) {
	return columnIds.filter(id => id !== PAYMENT_COLUMN_ID)
}

export function getColumnStorageKey(scope, scopeId, campId = null) {
	if (scope === 'org') {
		return `${STORAGE_PREFIX}:org:${scopeId}:${campId || 'none'}`
	}
	return `${STORAGE_PREFIX}:camp:${scopeId}`
}

export function loadColumnPrefs(storageKey) {
	try {
		const raw = localStorage.getItem(storageKey)
		if (!raw) return null
		const parsed = JSON.parse(raw)
		return Array.isArray(parsed) ? parsed : null
	} catch {
		return null
	}
}

export function orderTableColumnIds(columnIds) {
	if (!columnIds.includes('sys:token')) return columnIds
	return ['sys:token', ...columnIds.filter(id => id !== 'sys:token')]
}

export function saveColumnPrefs(storageKey, columnIds) {
	localStorage.setItem(storageKey, JSON.stringify(orderTableColumnIds(columnIds)))
}

export function defaultSystemColumnIds(scope, { paymentEnabled = false } = {}) {
	return SYSTEM_COLUMNS
		.filter(col => {
			if (col.orgOnly && scope !== 'org') return false
			if (col.campOnly && scope !== 'camp') return false
			if (col.requiresPayment && !paymentEnabled) return false
			return true
		})
		.map(col => col.id)
}

export function resolveColumnPrefs(storageKey, scope, { paymentEnabled = false } = {}) {
	const saved = loadColumnPrefs(storageKey)
	const ids = saved || defaultSystemColumnIds(scope, { paymentEnabled })
	const filtered = paymentEnabled ? ids : withoutPaymentColumn(ids)
	return orderTableColumnIds(filtered)
}

export function getAvailableSystemColumns(scope, { paymentEnabled = false } = {}) {
	return SYSTEM_COLUMNS.filter(col => {
		if (col.orgOnly && scope !== 'org') return false
		if (col.campOnly && scope !== 'camp') return false
		if (col.requiresPayment && !paymentEnabled) return false
		return true
	})
}

export function buildColumnDefs(selectedIds, catalog, scope, { paymentEnabled = false } = {}) {
	const systemById = Object.fromEntries(SYSTEM_COLUMNS.map(c => [c.id, c]))
	const fieldById = Object.fromEntries((catalog?.fields || []).map(f => [f.id, f]))
	const ids = paymentEnabled ? selectedIds : withoutPaymentColumn(selectedIds)

	return orderTableColumnIds(ids)
		.map(id => {
			if (systemById[id]) {
				const col = systemById[id]
				if (col.orgOnly && scope !== 'org') return null
				if (col.campOnly && scope !== 'camp') return null
				if (col.requiresPayment && !paymentEnabled) return null
				return { id, label: col.label, kind: 'system' }
			}
			const field = fieldById[id]
			if (!field) return null
			return {
				id,
				label: field.label,
				kind: 'field',
				type: field.type,
				stepName: field.step_name,
			}
		})
		.filter(Boolean)
}

export function fieldsGroupedByStep(catalog) {
	if (!catalog?.fields?.length) return []
	const steps = catalog.steps || []
	const groups = steps.map(step => ({
		step,
		fields: catalog.fields.filter(f => f.step_template_id === step.id),
	}))
	const knownStepIds = new Set(steps.map(s => s.id))
	const orphanFields = catalog.fields.filter(f => !knownStepIds.has(f.step_template_id))
	if (orphanFields.length) {
		groups.push({ step: { step_name: 'Other', step_order: 999 }, fields: orphanFields })
	}
	return groups.filter(g => g.fields.length > 0)
}

export function nonTableFields(catalog, tableColumnIds) {
	const tableSet = new Set(tableColumnIds)
	return (catalog?.fields || []).filter(f => !tableSet.has(f.id))
}

export function getColumnLabelById(id, catalog, scope) {
	const systemCol = SYSTEM_COLUMNS.find(c => c.id === id)
	if (systemCol) {
		if (systemCol.orgOnly && scope !== 'org') return null
		if (systemCol.campOnly && scope !== 'camp') return null
		return systemCol.label
	}
	return (catalog?.fields || []).find(f => f.id === id)?.label || id
}
