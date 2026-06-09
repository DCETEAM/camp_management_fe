import { useEffect } from 'react'
import { X, Download, FileText } from 'lucide-react'
import { downloadPdfDoc } from '../utils/participantExport'

export default function ParticipantPdfPreviewModal({ preview, onClose }) {
	useEffect(() => () => {
		if (preview?.previewUrl) URL.revokeObjectURL(preview.previewUrl)
	}, [preview?.previewUrl])

	if (!preview) return null

	const handleDownload = () => {
		downloadPdfDoc(preview.doc, preview.filename)
		onClose()
	}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60" onClick={onClose}>
			<div
				className="bg-white w-full max-w-5xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
					<div className="flex items-center gap-2 min-w-0">
						<FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
						<div className="min-w-0">
							<h2 className="font-poppins text-sm font-bold text-gray-900">PDF Preview</h2>
							<p className="text-[11px] text-gray-500 truncate">
								{preview.rowCount} participant{preview.rowCount !== 1 ? 's' : ''} · {preview.filename}
							</p>
						</div>
					</div>
					<button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
						<X className="w-4 h-4 text-gray-500" />
					</button>
				</div>

				<div className="flex-1 min-h-0 bg-gray-100 p-3">
					<iframe
						title="PDF preview"
						src={preview.previewUrl}
						className="w-full h-full min-h-[60vh] rounded-lg border border-gray-200 bg-white"
					/>
				</div>

				<div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 flex-shrink-0">
					<button
						onClick={onClose}
						className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 rounded-lg"
					>
						Cancel
					</button>
					<button
						onClick={handleDownload}
						className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-primary-500 text-white rounded-lg hover:bg-primary-600"
					>
						<Download className="w-3.5 h-3.5" />
						Download PDF
					</button>
				</div>
			</div>
		</div>
	)
}
