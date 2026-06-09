import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatParticipantFieldValue } from './formatParticipantField'
import { formatDateDisplay } from './dateFormat'

const fmtStatus = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export function getExportCellValue(participant, column, fieldMeta) {
	if (column.kind === 'system') {
		switch (column.id) {
			case 'sys:token':
				return participant.token_number || '—'
			case 'sys:camp':
				return participant.camp?.name || '—'
			case 'sys:current_step':
				return participant.current_step?.step_name || '—'
			case 'sys:status':
				return fmtStatus(participant.status)
			case 'sys:payment':
				if (participant.payment_status === 'paid') return 'Paid'
				if (participant.payment_status === 'pending') return 'Pending'
				return '—'
			case 'sys:registered':
				return participant.registered_at
					? formatDateDisplay(String(participant.registered_at).split('T')[0])
					: '—'
			default:
				return '—'
		}
	}

	const value = participant.field_values?.[column.id]
	return formatParticipantFieldValue(value, fieldMeta?.type || column.type)
}

export function buildExportSheet(participants, columnDefs, fieldMetaById) {
	const headers = columnDefs.map(col => col.label)
	const rows = participants.map(p => columnDefs.map(col => {
		const raw = getExportCellValue(p, col, fieldMetaById[col.id])
		return raw === '—' ? '' : raw
	}))
	return { headers, rows }
}

export async function fetchAllPaginated(fetchPage) {
	const all = []
	let page = 1
	let lastPage = 1

	do {
		const result = await fetchPage(page)
		const items = result.data ?? result
		all.push(...(Array.isArray(items) ? items : []))
		lastPage = result.meta?.last_page ?? 1
		page += 1
	} while (page <= lastPage)

	return all
}

export function stampExportFilename(base, ext) {
	const date = new Date().toISOString().slice(0, 10)
	const safe = String(base || 'participants').replace(/[^\w\-]+/g, '_').replace(/_+/g, '_')
	return `${safe}_${date}.${ext}`
}

export function buildParticipantsPdfDoc(participants, columnDefs, fieldMetaById, title) {
	const { headers, rows } = buildExportSheet(participants, columnDefs, fieldMetaById)
	const landscape = columnDefs.length > 5
	const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' })

	doc.setFontSize(14)
	doc.text(title || 'Registered Participants', 14, 14)
	doc.setFontSize(9)
	doc.setTextColor(100)
	doc.text(`Exported ${new Date().toLocaleString('en-GB')}`, 14, 20)
	doc.setTextColor(0)

	autoTable(doc, {
		startY: 24,
		head: [headers],
		body: rows,
		styles: { fontSize: landscape ? 7 : 8, cellPadding: 2 },
		headStyles: { fillColor: [59, 130, 246], textColor: 255 },
		margin: { left: 10, right: 10 },
	})

	return doc
}

export function createParticipantsPdfPreview(participants, columnDefs, fieldMetaById, filenameBase, title) {
	const doc = buildParticipantsPdfDoc(participants, columnDefs, fieldMetaById, title)
	const previewUrl = URL.createObjectURL(doc.output('blob'))
	return {
		doc,
		previewUrl,
		filename: stampExportFilename(filenameBase, 'pdf'),
		rowCount: participants.length,
	}
}

export function downloadPdfDoc(doc, filename) {
	doc.save(filename)
}

export function downloadParticipantsExcel(participants, columnDefs, fieldMetaById, filenameBase) {
	if (!columnDefs.length) return
	const { headers, rows } = buildExportSheet(participants, columnDefs, fieldMetaById)
	const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows])
	const workbook = XLSX.utils.book_new()
	XLSX.utils.book_append_sheet(workbook, sheet, 'Participants')
	XLSX.writeFile(workbook, stampExportFilename(filenameBase, 'xlsx'))
}
