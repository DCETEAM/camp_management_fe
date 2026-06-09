import { useState, useEffect, useCallback, useMemo } from 'react'

import { useParams, useNavigate } from 'react-router-dom'

import {

	Search, ArrowLeft, Users, Filter, Loader, AlertCircle, RefreshCw, ChevronRight,

	Columns3, IndianRupee,

} from 'lucide-react'

import organizerService from '../services/organizer-service'

import DateRangeFilter from '../../../common/components/DateRangeFilter'

import ParticipantColumnPicker from '../../../common/components/ParticipantColumnPicker'

import ParticipantDetailModal from '../../../common/components/ParticipantDetailModal'

import ParticipantTableCell from '../../../common/components/ParticipantTableCell'

import ParticipantExportButtons from '../../../common/components/ParticipantExportButtons'

import { getParticipantName, getParticipantSubtitle } from '../../../common/utils/participantDisplay'

import {

	getColumnStorageKey,

	resolveColumnPrefs,

	saveColumnPrefs,

	buildColumnDefs,

	isPaymentEnabled,

} from '../../../common/utils/participantColumns'



const statusBadge = (s) => ({

	completed: 'bg-green-100 text-green-700',

	in_progress: 'bg-yellow-100 text-yellow-700',

	not_started: 'bg-gray-100 text-gray-600',

}[s] || 'bg-gray-100 text-gray-600')



const fmtStatus = (s) => (s || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())



export default function ParticipantList() {

	const { id } = useParams()

	const navigate = useNavigate()



	const [participants, setParticipants] = useState([])

	const [catalog, setCatalog] = useState(null)

	const [stepStats, setStepStats] = useState([])

	const [loading, setLoading] = useState(true)

	const [error, setError] = useState(null)

	const [search, setSearch] = useState('')

	const [statusFilter, setStatusFilter] = useState('')

	const [stepFilter, setStepFilter] = useState(null)

	const [page, setPage] = useState(1)

	const [meta, setMeta] = useState(null)

	const [selectedParticipant, setSelectedParticipant] = useState(null)

	const [startDate, setStartDate] = useState('')

	const [endDate, setEndDate] = useState('')

	const [columnIds, setColumnIds] = useState([])

	const [showColumnPicker, setShowColumnPicker] = useState(false)

	const [camp, setCamp] = useState(null)



	const storageKey = useMemo(() => getColumnStorageKey('camp', id), [id])



	const paymentEnabled = useMemo(() => isPaymentEnabled(camp), [camp])



	const columnDefs = useMemo(

		() => buildColumnDefs(columnIds, catalog, 'camp', { paymentEnabled }),

		[columnIds, catalog, paymentEnabled],

	)



	const fieldMetaById = useMemo(

		() => Object.fromEntries((catalog?.fields || []).map(f => [f.id, f])),

		[catalog],

	)



	const loadCatalog = useCallback(async () => {

		if (!id) return

		try {

			const [data, campData] = await Promise.all([

				organizerService.getParticipantFieldCatalog(id),

				organizerService.getCampDetail(id),

			])

			const campRecord = campData?.data ?? campData

			setCatalog(data)

			setCamp(campRecord)

			setColumnIds(resolveColumnPrefs(storageKey, 'camp', { paymentEnabled: isPaymentEnabled(campRecord) }))

		} catch {

			setCatalog(null)

			setCamp(null)

			setColumnIds(resolveColumnPrefs(storageKey, 'camp', { paymentEnabled: false }))

		}

	}, [id, storageKey])



	const load = useCallback(async (pg = 1) => {

		try {

			setLoading(true)

			const [pData, sData] = await Promise.all([

				organizerService.getParticipants(id, {

					search: search || undefined,

					status: statusFilter || undefined,

					step_template_id: stepFilter || undefined,

					start_date: startDate || undefined,

					end_date: endDate || undefined,

					page: pg,

				}),

				organizerService.getStepStats(id),

			])

			setParticipants(pData.data ?? pData)

			setMeta(pData.meta ?? null)

			setStepStats(Array.isArray(sData) ? sData : sData.step_completion ?? [])

		} catch (e) {

			setError(e.response?.data?.message || 'Failed to load participants')

		} finally {

			setLoading(false)

		}

	}, [id, search, statusFilter, stepFilter, startDate, endDate])



	useEffect(() => { loadCatalog() }, [loadCatalog])

	useEffect(() => { load(1); setPage(1) }, [load])



	const handleSaveColumns = (ids) => {

		setColumnIds(ids)

		saveColumnPrefs(storageKey, ids)

	}



	const fetchExportPage = useCallback(async (pg) => {

		const pData = await organizerService.getParticipants(id, {

			search: search || undefined,

			status: statusFilter || undefined,

			step_template_id: stepFilter || undefined,

			start_date: startDate || undefined,

			end_date: endDate || undefined,

			page: pg,

		})

		return { data: pData.data ?? pData, meta: pData.meta ?? null }

	}, [id, search, statusFilter, stepFilter, startDate, endDate])



	if (error) return (

		<div className="flex flex-col items-center justify-center py-20 gap-2">

			<AlertCircle className="w-8 h-8 text-red-400" />

			<p className="text-sm text-red-600">{error}</p>

		</div>

	)



	return (

		<div className="space-y-4">

			{selectedParticipant && (

				<ParticipantDetailModal

					participant={selectedParticipant}

					catalog={catalog}

					tableColumnIds={columnIds}

					showPayment={paymentEnabled}

					onClose={() => setSelectedParticipant(null)}

				/>

			)}



			<ParticipantColumnPicker

				open={showColumnPicker}

				onClose={() => setShowColumnPicker(false)}

				catalog={catalog}

				scope="camp"

				selectedIds={columnIds}

				onSave={handleSaveColumns}

				paymentEnabled={paymentEnabled}

			/>



			<div className="flex items-center justify-between gap-3">

				<div className="flex items-center gap-3">

					<button

						onClick={() => navigate(`/camp-dashboard/${id}`)}

						className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"

					>

						<ArrowLeft className="w-4 h-4 text-gray-500" />

					</button>

					<div>

						<h1 className="font-poppins text-lg font-bold text-gray-900">Participants</h1>

						<p className="text-xs text-gray-500">{meta?.total ?? participants.length} registered</p>

					</div>

				</div>

				<div className="flex items-center gap-2">

					<ParticipantExportButtons

						onFetchPage={fetchExportPage}

						columnDefs={columnDefs}

						fieldMetaById={fieldMetaById}

						filenameBase={`camp_${id}_participants`}

						title="Registered Participants"

					/>

					<button onClick={() => setShowColumnPicker(true)} className="p-2 hover:bg-gray-100 rounded-lg" title="Choose table columns">

						<Columns3 className="w-4 h-4 text-gray-400" />

					</button>

					<button onClick={() => load(page)} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">

						<RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />

					</button>

				</div>

			</div>



			{stepStats.length > 0 && (

				<div className="flex flex-wrap gap-2">

					<button

						onClick={() => setStepFilter(null)}

						className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!stepFilter ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}

					>

						All Steps

					</button>

					{stepStats.map(s => (

						<button

							key={s.step_template_id}

							onClick={() => setStepFilter(s.step_template_id)}

							className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${stepFilter === s.step_template_id ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}

						>

							{s.step_name}

							<span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${stepFilter === s.step_template_id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>

								{s.done ?? 0}

							</span>

						</button>

					))}

				</div>

			)}



			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">

				<div className="flex flex-col sm:flex-row gap-3">

					<div className="flex-1 relative">

						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

						<input

							type="text"

							value={search}

							onChange={e => setSearch(e.target.value)}

							placeholder="Search by name or token…"

							className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"

						/>

					</div>

					<div className="flex items-center gap-1.5">

						<Filter className="w-3.5 h-3.5 text-gray-400" />

						<select

							value={statusFilter}

							onChange={e => setStatusFilter(e.target.value)}

							className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none"

						>

							<option value="">All Status</option>

							<option value="not_started">Not Started</option>

							<option value="in_progress">In Progress</option>

							<option value="completed">Completed</option>

						</select>

					</div>

					<DateRangeFilter

						startDate={startDate}

						endDate={endDate}

						onStartChange={setStartDate}

						onEndChange={setEndDate}

						onClear={() => { setStartDate(''); setEndDate('') }}

					/>

				</div>

			</div>



			{loading ? (

				<div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">

					<Loader className="w-5 h-5 animate-spin" /> Loading…

				</div>

			) : participants.length === 0 ? (

				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">

					<Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />

					<p className="text-sm font-semibold text-gray-700 mb-1">No participants found</p>

					<p className="text-xs text-gray-400">{search || statusFilter ? 'Try adjusting filters.' : 'No participants registered yet.'}</p>

				</div>

			) : (

				<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

					<div className="divide-y divide-gray-50 sm:hidden">

						{participants.map(p => (

							<button

								key={p.id}

								onClick={() => setSelectedParticipant(p)}

								className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"

							>

								<div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">

									<span className="text-xs font-bold text-primary-700">{p.token_number}</span>

								</div>

								<div className="flex-1 min-w-0">

									<p className="text-xs font-semibold text-gray-900 truncate">{getParticipantName(p)}</p>

									{getParticipantSubtitle(p) && (

										<p className="text-[11px] text-gray-500 truncate">{getParticipantSubtitle(p)}</p>

									)}

									<p className="text-[11px] text-gray-400 mt-0.5">

										{p.current_step ? `Next: ${p.current_step.step_name}` : 'All steps done'}

									</p>

								</div>

								<div className="flex flex-col items-end gap-1 flex-shrink-0">

									<span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(p.status)}`}>

										{fmtStatus(p.status)}

									</span>

									{paymentEnabled && p.payment_status === 'paid' && (

										<span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">

											<IndianRupee className="w-2.5 h-2.5" />Paid

										</span>

									)}

									<ChevronRight className="w-3.5 h-3.5 text-gray-300" />

								</div>

							</button>

						))}

					</div>



					<div className="hidden sm:block overflow-x-auto">

						<table className="w-full">

							<thead>

								<tr className="bg-gray-50 border-b border-gray-100">

									{columnDefs.map(col => (

										<th

											key={col.id}

											className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider"

										>

											{col.label}

										</th>

									))}

								</tr>

							</thead>

							<tbody className="divide-y divide-gray-50">

								{participants.map(p => (

									<tr

										key={p.id}

										onClick={() => setSelectedParticipant(p)}

										className="hover:bg-gray-50 cursor-pointer transition-colors"

									>

										{columnDefs.map(col => (

											<td key={col.id} className="px-4 py-2.5">

												<ParticipantTableCell

													column={col}

													participant={p}

													fieldMeta={fieldMetaById[col.id]}

												/>

											</td>

										))}

									</tr>

								))}

							</tbody>

						</table>

					</div>



					{meta && meta.last_page > 1 && (

						<div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">

							<p className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page}</p>

							<div className="flex gap-2">

								<button

									onClick={() => { setPage(p => p - 1); load(page - 1) }}

									disabled={page <= 1}

									className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"

								>

									Prev

								</button>

								<button

									onClick={() => { setPage(p => p + 1); load(page + 1) }}

									disabled={page >= meta.last_page}

									className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50"

								>

									Next

								</button>

							</div>

						</div>

					)}

				</div>

			)}

		</div>

	)

}

