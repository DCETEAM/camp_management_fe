import { useMemo, useState } from 'react'
import { Folder, FolderOpen, ChevronRight, Image, FileText, ArrowLeft } from 'lucide-react'
import AuthImage from './AuthImage'
import {
	getCampGroups,
	getFieldGroups,
	filterFilesForCamp,
	isImageFile,
} from '../utils/mediaGrouping'

function FolderCard({ icon: Icon, title, subtitle, onClick, previewFile }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary-200 transition-all p-4 text-left group"
		>
			<div className="flex items-start gap-3">
				<div className="w-14 h-14 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
					{previewFile && isImageFile(previewFile) ? (
						<AuthImage
							src={`${import.meta.env.VITE_API_URL}/media/${previewFile.id}/file`}
							alt={previewFile.file_name}
							className="w-full h-full object-cover"
							placeholderClass="w-full h-full"
						/>
					) : (
						<Icon className="w-6 h-6 text-amber-500 group-hover:text-amber-600" />
					)}
				</div>
				<div className="flex-1 min-w-0">
					<p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
					<p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>
				</div>
				<ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 flex-shrink-0 mt-1" />
			</div>
		</button>
	)
}

function FileGrid({ files, onPreview }) {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
			{files.map(file => (
				<button
					key={file.id}
					type="button"
					onClick={() => onPreview(file)}
					className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-3 text-left"
				>
					<div className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden">
						{isImageFile(file) ? (
							<AuthImage
								src={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
								alt={file.file_name}
								className="w-full h-full object-cover"
								placeholderClass="w-full h-full rounded-lg"
							/>
						) : (
							<FileText className="w-7 h-7 text-gray-300" />
						)}
					</div>
					<p className="text-[11px] font-medium text-gray-800 truncate">{file.file_name}</p>
					<p className="text-[10px] text-gray-500 truncate mt-0.5">
						{file.participant?.token_number} · {file.participant?.name || '—'}
					</p>
					<p className="text-[10px] text-gray-400 mt-0.5">{file.step_template?.step_name || '—'}</p>
				</button>
			))}
		</div>
	)
}

export default function MediaFolderGallery({
	files,
	showCampFolders = true,
	fixedCampName = null,
	onPreview,
	emptyMessage = 'No files found',
}) {
	const [selectedCampId, setSelectedCampId] = useState(null)
	const [selectedFieldKey, setSelectedFieldKey] = useState(null)

	const scopedFiles = useMemo(() => {
		if (!showCampFolders) return files
		return filterFilesForCamp(files, selectedCampId)
	}, [files, showCampFolders, selectedCampId])

	const campGroups = useMemo(() => getCampGroups(files), [files])
	const fieldGroups = useMemo(() => getFieldGroups(scopedFiles), [scopedFiles])

	const currentField = fieldGroups.find(g => g.id === selectedFieldKey)
	const currentCamp = campGroups.find(g => String(g.id) === String(selectedCampId))

	const breadcrumbs = []
	if (showCampFolders) {
		breadcrumbs.push({ label: 'All Camps', action: () => { setSelectedCampId(null); setSelectedFieldKey(null) } })
		if (selectedCampId) {
			breadcrumbs.push({
				label: currentCamp?.name || 'Camp',
				action: () => setSelectedFieldKey(null),
			})
		}
	} else if (fixedCampName) {
		breadcrumbs.push({ label: fixedCampName, action: () => setSelectedFieldKey(null) })
	}
	if (selectedFieldKey && currentField) {
		breadcrumbs.push({ label: currentField.label, action: null })
	}

	if (!files.length) {
		return (
			<div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
				<Image className="w-8 h-8 text-gray-200 mx-auto mb-2" />
				<p className="text-sm font-semibold text-gray-700">{emptyMessage}</p>
				<p className="text-xs text-gray-400 mt-1">Uploaded photos from step forms will appear here.</p>
			</div>
		)
	}

	if (showCampFolders && !selectedCampId) {
		return (
			<div className="space-y-3">
				<p className="text-xs text-gray-500">Choose a camp folder to browse uploads.</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{campGroups.map(camp => (
						<FolderCard
							key={camp.id}
							icon={Folder}
							title={camp.name}
							subtitle={`${camp.files.length} file${camp.files.length !== 1 ? 's' : ''}`}
							previewFile={camp.files.find(isImageFile)}
							onClick={() => setSelectedCampId(camp.id)}
						/>
					))}
				</div>
			</div>
		)
	}

	if (!selectedFieldKey) {
		return (
			<div className="space-y-3">
				{showCampFolders && (
					<button
						type="button"
						onClick={() => setSelectedCampId(null)}
						className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
					>
						<ArrowLeft className="w-3.5 h-3.5" /> Back to camps
					</button>
				)}
				<p className="text-xs text-gray-500">
					{showCampFolders ? `Folders in ${currentCamp?.name}` : 'Choose a field folder'}
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{fieldGroups.map(field => (
						<FolderCard
							key={field.id}
							icon={FolderOpen}
							title={field.label}
							subtitle={`${field.files.length} file${field.files.length !== 1 ? 's' : ''}`}
							previewFile={field.files.find(isImageFile)}
							onClick={() => setSelectedFieldKey(field.id)}
						/>
					))}
				</div>
			</div>
		)
	}

	return (
		<div className="space-y-3">
			<div className="flex flex-wrap items-center gap-1 text-xs">
				{breadcrumbs.map((crumb, index) => (
					<span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
						{index > 0 && <ChevronRight className="w-3 h-3 text-gray-300" />}
						{crumb.action ? (
							<button type="button" onClick={crumb.action} className="font-semibold text-primary-600 hover:text-primary-700">
								{crumb.label}
							</button>
						) : (
							<span className="font-semibold text-gray-700">{crumb.label}</span>
						)}
					</span>
				))}
			</div>
			<button
				type="button"
				onClick={() => setSelectedFieldKey(null)}
				className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
			>
				<ArrowLeft className="w-3.5 h-3.5" /> Back to folders
			</button>
			<FileGrid files={currentField?.files || []} onPreview={onPreview} />
		</div>
	)
}
