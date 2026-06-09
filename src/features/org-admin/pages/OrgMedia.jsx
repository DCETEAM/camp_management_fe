import { useState, useEffect, useCallback } from 'react'
import { Search, Image, FileText, Download, Loader, AlertCircle, RefreshCw, X } from 'lucide-react'
import AuthImage from '../../../common/components/AuthImage'
import MediaFolderGallery from '../../../common/components/MediaFolderGallery'
import { useAuth } from '../../auth/contexts/auth-context'
import DateRangeFilter from '../../../common/components/DateRangeFilter'
import { isImageFile } from '../../../common/utils/mediaGrouping'
import api from '../../../core/interceptors/axiosInterceptor'

export default function OrgMedia() {
	const { user } = useAuth()
	const [files, setFiles] = useState([])
	const [camps, setCamps] = useState([])
	const [meta, setMeta] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [search, setSearch] = useState('')
	const [campFilter, setCampFilter] = useState('')
	const [page, setPage] = useState(1)
	const [preview, setPreview] = useState(null)
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')

	const load = useCallback(async (pg = 1) => {
		if (!user?.org_id) return
		try {
			setLoading(true)
			const res = await api.get(`/organizations/${user.org_id}/media`, {
				params: {
					search: search || undefined,
					camp_id: campFilter || undefined,
					start_date: startDate || undefined,
					end_date: endDate || undefined,
					page: pg,
					per_page: 200,
				},
			})
			setFiles(res.data.data ?? res.data)
			setMeta(res.data.meta ?? null)
		} catch (e) {
			setError(e.response?.data?.message || 'Failed to load media')
		} finally {
			setLoading(false)
		}
	}, [user, search, campFilter, startDate, endDate])

	useEffect(() => {
		if (!user?.org_id) return
		api.get('/camps', { params: { per_page: 100 } })
			.then(r => setCamps(r.data?.data ?? r.data ?? []))
			.catch(() => {})
	}, [user])

	useEffect(() => { load(1); setPage(1) }, [load])

	const images = files.filter(isImageFile).length
	const docs = files.length - images
	const selectedCampName = camps.find(c => String(c.id) === String(campFilter))?.name

	if (error) return (
		<div className="flex flex-col items-center justify-center py-20 gap-2">
			<AlertCircle className="w-8 h-8 text-red-400" />
			<p className="text-sm text-red-600">{error}</p>
		</div>
	)

	return (
		<div className="space-y-4">
			{preview && (
				<div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setPreview(null)}>
					<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5" onClick={e => e.stopPropagation()}>
						<div className="flex items-center justify-between mb-4">
							<p className="text-sm font-semibold text-gray-900 truncate">{preview.file_name}</p>
							<button onClick={() => setPreview(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
								<X className="w-4 h-4 text-gray-500" />
							</button>
						</div>
						{isImageFile(preview) ? (
							<AuthImage
								src={`${import.meta.env.VITE_API_URL}/media/${preview.id}/file`}
								alt={preview.file_name}
								className="w-full rounded-xl object-contain max-h-72"
								placeholderClass="w-full h-48 rounded-xl"
							/>
						) : (
							<div className="flex flex-col items-center py-8 gap-2">
								<FileText className="w-12 h-12 text-gray-300" />
								<p className="text-xs text-gray-500">{preview.file_type}</p>
							</div>
						)}
						<div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
							<div><p className="text-gray-400">Field</p><p className="font-semibold text-gray-800">{preview.field_label || '—'}</p></div>
							<div><p className="text-gray-400">Participant</p><p className="font-semibold text-gray-800">{preview.participant?.name} ({preview.participant?.token_number})</p></div>
							<div><p className="text-gray-400">Camp</p><p className="font-semibold text-gray-800">{preview.participant?.camp?.name || '—'}</p></div>
							<div><p className="text-gray-400">Step</p><p className="font-semibold text-gray-800">{preview.step_template?.step_name || '—'}</p></div>
						</div>
						{preview.id && (
							<a
								href={`${import.meta.env.VITE_API_URL}/media/${preview.id}/file`}
								download
								target="_blank"
								rel="noopener noreferrer"
								className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-primary-500 text-white text-xs font-semibold rounded-xl hover:bg-primary-600 transition-colors"
							>
								<Download className="w-3.5 h-3.5" /> Download
							</a>
						)}
					</div>
				</div>
			)}

			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-poppins text-lg font-bold text-gray-900">Media Gallery</h1>
					<p className="text-xs text-gray-500">{meta?.total ?? files.length} files · {images} images · {docs} documents</p>
				</div>
				<button onClick={() => load(page)} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg">
					<RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
				</button>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col sm:flex-row gap-3">
				<div className="flex-1 relative">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
					<input
						value={search}
						onChange={e => setSearch(e.target.value)}
						placeholder="Search filename or field…"
						className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
					/>
				</div>
				<select
					value={campFilter}
					onChange={e => setCampFilter(e.target.value)}
					className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"
				>
					<option value="">All Camps</option>
					{camps.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
				</select>
				<DateRangeFilter
					startDate={startDate}
					endDate={endDate}
					onStartChange={setStartDate}
					onEndChange={setEndDate}
					onClear={() => { setStartDate(''); setEndDate('') }}
				/>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
					<Loader className="w-5 h-5 animate-spin" /> Loading…
				</div>
			) : (
				<MediaFolderGallery
					key={campFilter || 'all-camps'}
					files={files}
					showCampFolders={!campFilter}
					fixedCampName={selectedCampName}
					onPreview={setPreview}
				/>
			)}
		</div>
	)
}
