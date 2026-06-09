import { useState, useEffect, useCallback, useMemo } from 'react'
import { Search, Users, Filter, Loader, AlertCircle, RefreshCw, Columns3 } from 'lucide-react'
import { useAuth } from '../../auth/contexts/auth-context'
import DateRangeFilter from '../../../common/components/DateRangeFilter'
import ParticipantColumnPicker from '../../../common/components/ParticipantColumnPicker'
import ParticipantDetailModal from '../../../common/components/ParticipantDetailModal'
import ParticipantTableCell from '../../../common/components/ParticipantTableCell'
import ParticipantExportButtons from '../../../common/components/ParticipantExportButtons'
import api from '../../../core/interceptors/axiosInterceptor'
import {
	getColumnStorageKey,
	resolveColumnPrefs,
	saveColumnPrefs,
	buildColumnDefs,
	isPaymentEnabled,
} from '../../../common/utils/participantColumns'

export default function OrgParticipants() {
	const { user } = useAuth()
	const [participants, setParticipants] = useState([])
	const [camps, setCamps] = useState([])
	const [catalog, setCatalog] = useState(null)
	const [meta, setMeta] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [search, setSearch] = useState('')
	const [statusFilter, setStatusFilter] = useState('')
	const [campFilter, setCampFilter] = useState('')
	const [page, setPage] = useState(1)
	const [startDate, setStartDate] = useState('')
	const [endDate, setEndDate] = useState('')
	const [columnIds, setColumnIds] = useState([])
	const [showColumnPicker, setShowColumnPicker] = useState(false)
	const [selectedParticipant, setSelectedParticipant] = useState(null)

	const storageKey = useMemo(
		() => getColumnStorageKey('org', user?.org_id, campFilter || 'none'),
		[user?.org_id, campFilter],
	)

	const paymentEnabled = useMemo(() => {
		if (!campFilter) return false
		const camp = camps.find(c => String(c.id) === String(campFilter))
		return isPaymentEnabled(camp)
	}, [campFilter, camps])

	const columnDefs = useMemo(
		() => buildColumnDefs(columnIds, catalog, 'org', { paymentEnabled }),
		[columnIds, catalog, paymentEnabled],
	)

	const fieldMetaById = useMemo(
		() => Object.fromEntries((catalog?.fields || []).map(f => [f.id, f])),
		[catalog],
	)

	const loadCatalog = useCallback(async () => {
		if (!user?.org_id || !campFilter) {
			setCatalog(null)
			setColumnIds(resolveColumnPrefs(storageKey, 'org', { paymentEnabled: false }))
			return
		}
		try {
			const res = await api.get(`/organizations/${user.org_id}/participant-field-catalog`, {
				params: { camp_id: campFilter },
			})
			const data = res.data
			setCatalog(data)
			const camp = camps.find(c => String(c.id) === String(campFilter))
			setColumnIds(resolveColumnPrefs(storageKey, 'org', { paymentEnabled: isPaymentEnabled(camp) }))
		} catch {
			setCatalog(null)
		}
	}, [user?.org_id, campFilter, storageKey, camps])

	const load = useCallback(async (pg = 1) => {
		if (!user?.org_id) return
		try {
			setLoading(true)
			const res = await api.get(`/organizations/${user.org_id}/participants`, {
				params: {
					search: search || undefined,
					status: statusFilter || undefined,
					camp_id: campFilter || undefined,
					start_date: startDate || undefined,
					end_date: endDate || undefined,
					page: pg,
				},
			})
			setParticipants(res.data.data ?? res.data)
			setMeta(res.data.meta ?? null)
		} catch (e) {
			setError(e.response?.data?.message || 'Failed to load')
		} finally {
			setLoading(false)
		}
	}, [user, search, statusFilter, campFilter, startDate, endDate])

	useEffect(() => {
		if (!user?.org_id) return
		api.get('/camps', { params: { per_page: 100 } })
			.then(r => setCamps(r.data?.data ?? r.data ?? []))
			.catch(() => {})
	}, [user])

	useEffect(() => { loadCatalog() }, [loadCatalog])

	useEffect(() => { load(1); setPage(1) }, [load])

	const handleSaveColumns = (ids) => {
		setColumnIds(ids)
		saveColumnPrefs(storageKey, ids)
	}

	const fetchExportPage = useCallback(async (pg) => {
		const res = await api.get(`/organizations/${user.org_id}/participants`, {
			params: {
				search: search || undefined,
				status: statusFilter || undefined,
				camp_id: campFilter || undefined,
				start_date: startDate || undefined,
				end_date: endDate || undefined,
				page: pg,
			},
		})
		return { data: res.data.data ?? res.data, meta: res.data.meta ?? null }
	}, [user?.org_id, search, statusFilter, campFilter, startDate, endDate])

	const exportFilename = campFilter
		? (camps.find(c => String(c.id) === String(campFilter))?.name || 'participants')
		: 'all_participants'

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
					showCamp={!campFilter}
					showPayment={paymentEnabled || isPaymentEnabled(
						camps.find(c => String(c.id) === String(selectedParticipant?.camp?.id ?? selectedParticipant?.camp_id)),
					)}
					onClose={() => setSelectedParticipant(null)}
				/>
			)}

			<ParticipantColumnPicker
				open={showColumnPicker}
				onClose={() => setShowColumnPicker(false)}
				catalog={catalog}
				scope="org"
				selectedIds={columnIds}
				onSave={handleSaveColumns}
				campRequired
				paymentEnabled={paymentEnabled}
			/>

			<div className="flex items-center justify-between">
				<div>
					<h1 className="font-poppins text-lg font-bold text-gray-900">All Participants</h1>
					<p className="text-xs text-gray-500">{meta?.total ?? participants.length} across all camps</p>
				</div>
				<div className="flex items-center gap-2">
					<ParticipantExportButtons
						onFetchPage={fetchExportPage}
						columnDefs={columnDefs}
						fieldMetaById={fieldMetaById}
						filenameBase={exportFilename}
						title="All Participants"
					/>
					<button
						onClick={() => setShowColumnPicker(true)}
						className="p-2 hover:bg-gray-100 rounded-lg"
						title={campFilter ? 'Choose table columns' : 'Select a camp to customize columns'}
					>
						<Columns3 className="w-4 h-4 text-gray-400" />
					</button>
					<button onClick={() => load(page)} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg">
						<RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
					</button>
				</div>
			</div>

			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
				<div className="flex flex-col sm:flex-row gap-3">
					<div className="flex-1 relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
						<input
							value={search}
							onChange={e => setSearch(e.target.value)}
							placeholder="Search name, token, phone…"
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
				{!campFilter && (
					<p className="text-[11px] text-gray-400 mt-2">
						Select a camp to pick form fields as table columns. System columns always apply.
					</p>
				)}
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
					<Loader className="w-5 h-5 animate-spin" /> Loading…
				</div>
			) : participants.length === 0 ? (
				<div className="bg-white rounded-xl border border-gray-100 p-10 text-center">
					<Users className="w-8 h-8 text-gray-200 mx-auto mb-2" />
					<p className="text-sm font-semibold text-gray-700">No participants found</p>
				</div>
			) : (
				<div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
					<div className="overflow-x-auto">
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
