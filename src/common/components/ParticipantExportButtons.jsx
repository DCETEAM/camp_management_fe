import { useState } from 'react'
import { FileSpreadsheet, FileText, Loader } from 'lucide-react'
import ParticipantPdfPreviewModal from './ParticipantPdfPreviewModal'
import {
	downloadParticipantsExcel,
	createParticipantsPdfPreview,
	fetchAllPaginated,
} from '../utils/participantExport'

export default function ParticipantExportButtons({
	onFetchPage,
	columnDefs,
	fieldMetaById,
	filenameBase,
	title,
	disabled = false,
}) {
	const [exporting, setExporting] = useState(null)
	const [pdfPreview, setPdfPreview] = useState(null)

	const closePdfPreview = () => setPdfPreview(null)

	const runExport = async (format) => {
		if (!columnDefs.length || disabled) return
		try {
			setExporting(format)
			const participants = await fetchAllPaginated(onFetchPage)
			if (!participants.length) {
				alert('No participants to export for the current filters.')
				return
			}
			if (format === 'excel') {
				downloadParticipantsExcel(participants, columnDefs, fieldMetaById, filenameBase)
			} else {
				setPdfPreview(createParticipantsPdfPreview(
					participants,
					columnDefs,
					fieldMetaById,
					filenameBase,
					title,
				))
			}
		} catch {
			alert('Export failed. Please try again.')
		} finally {
			setExporting(null)
		}
	}

	const busy = exporting !== null

	return (
		<>
			<ParticipantPdfPreviewModal preview={pdfPreview} onClose={closePdfPreview} />

			<div className="flex items-center gap-1">
				<button
					type="button"
					onClick={() => runExport('excel')}
					disabled={busy || disabled || !columnDefs.length}
					title="Download Excel"
					className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
				>
					{exporting === 'excel'
						? <Loader className="w-3.5 h-3.5 animate-spin" />
						: <FileSpreadsheet className="w-3.5 h-3.5 text-green-600" />}
					Excel
				</button>
				<button
					type="button"
					onClick={() => runExport('pdf')}
					disabled={busy || disabled || !columnDefs.length}
					title="Preview PDF"
					className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40"
				>
					{exporting === 'pdf'
						? <Loader className="w-3.5 h-3.5 animate-spin" />
						: <FileText className="w-3.5 h-3.5 text-red-500" />}
					PDF
				</button>
			</div>
		</>
	)
}
