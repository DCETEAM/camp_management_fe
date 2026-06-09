import { useState, useEffect } from 'react'
import {
	X, Loader, AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
	Hash, Calendar, Activity, FileText, Download, Clock, IndianRupee, Tent, Image,
} from 'lucide-react'
import organizerService from '../../features/organizer/services/organizer-service'
import AuthImage from './AuthImage'
import { getParticipantName } from '../utils/participantDisplay'
import { fieldsGroupedByStep, nonTableFields } from '../utils/participantColumns'
import { formatParticipantFieldValue } from '../utils/formatParticipantField'
const outcomeBadge = (o) => ({
	Completed: 'bg-green-100 text-green-700',
	Normal: 'bg-blue-100 text-blue-700',
	Referred: 'bg-orange-100 text-orange-700',
	Treated: 'bg-purple-100 text-purple-700',
	'No Action': 'bg-gray-100 text-gray-600',
	Incomplete: 'bg-red-100 text-red-700',
}[o] || 'bg-gray-100 text-gray-600')

const statusBadge = (s) => ({
	completed: 'bg-green-100 text-green-700',
	in_progress: 'bg-yellow-100 text-yellow-700',
	not_started: 'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600')

const fmtStatus = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function stepTemplateId(resp) {
	return Number(resp.step_template_id ?? resp.step_template?.id ?? 0)
}

function fileFieldsForStep(stepId, catalog) {
	return (catalog?.fields ?? []).filter(
		f => f.step_template_id === stepId && ['file', 'image'].includes(f.type),
	)
}

function fieldsForStepResponse(resp, catalog) {
	const data = resp.response_data ?? {}
	const stepId = stepTemplateId(resp)
	const catalogFields = (catalog?.fields ?? []).filter(
		f => f.step_template_id === stepId && !['file', 'image', 'note'].includes(f.type),
	)

	if (catalogFields.length) {
		return catalogFields.map(f => ({
			key: f.key,
			label: f.label,
			type: f.type,
			value: formatParticipantFieldValue(data[f.key], f.type),
		}))
	}

	return Object.entries(data)
		.filter(([, v]) => v !== null && v !== undefined && v !== '')
		.map(([k, v]) => ({
			key: k,
			label: k.replace(/_/g, ' '),
			type: 'text',
			value: String(v),
		}))
}

export default function ParticipantDetailModal({
	participant: participantProp,
	participantId,
	catalog,
	tableColumnIds = [],
	onClose,
	showCamp = false,
	showPayment = false,
}) {
	const [participant, setParticipant] = useState(participantProp || null)
	const [stepResponses, setStepResponses] = useState([])
	const [media, setMedia] = useState([])
	const [loading, setLoading] = useState(!participantProp)
	const [error, setError] = useState(null)
	const [expandedSteps, setExpandedSteps] = useState(new Set())

	const id = participantProp?.id || participantId

	useEffect(() => {
		if (!id) return
		if (participantProp?.field_values) {
			setParticipant(participantProp)
		}
		const load = async () => {
			try {
				setLoading(true)
				const [p, sr, m] = await Promise.all([
					participantProp?.token_number ? Promise.resolve(participantProp) : organizerService.getParticipantDetail(id),
					organizerService.getParticipantStepResponses(id),
					organizerService.getParticipantMedia(id),
				])
				setParticipant(prev => ({ ...prev, ...p }))
				setStepResponses([...sr].sort((a, b) => (a.step_template?.step_order ?? 0) - (b.step_template?.step_order ?? 0)))
				setMedia(Array.isArray(m) ? m : m.data ?? [])
			} catch (e) {
				setError(e.response?.data?.message || 'Failed to load participant')
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [id, participantProp])

	const toggleStep = (stepId) => setExpandedSteps(prev => {
		const next = new Set(prev)
		next.has(stepId) ? next.delete(stepId) : next.add(stepId)
		return next
	})

	const detailFields = nonTableFields(catalog, tableColumnIds)
	const detailByStep = fieldsGroupedByStep({ ...catalog, fields: detailFields })
	const fieldValues = participant?.field_values || {}

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 overflow-y-auto" onClick={onClose}>
			<div
				className="bg-white w-full max-w-2xl rounded-xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[85vh] my-auto"
				onClick={e => e.stopPropagation()}
			>
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
							{(getParticipantName(participant) || 'U').charAt(0).toUpperCase()}
						</div>
						<div>
							<p className="font-poppins text-sm font-bold text-gray-900">{getParticipantName(participant) || '…'}</p>
							<p className="text-[11px] text-gray-500">
								{participant?.token_number} · {stepResponses.length} step{stepResponses.length !== 1 ? 's' : ''} done
							</p>
						</div>
					</div>
					<button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
						<X className="w-4 h-4 text-gray-500" />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto p-5 space-y-4">
					{loading ? (
						<div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
							<Loader className="w-5 h-5 animate-spin" /> Loading…
						</div>
					) : error ? (
						<div className="flex flex-col items-center justify-center py-12 gap-2">
							<AlertCircle className="w-7 h-7 text-red-400" />
							<p className="text-sm text-red-600">{error}</p>
						</div>
					) : (
						<>
							<div className="bg-gray-50 rounded-xl p-4">
								<div className="flex flex-wrap items-center gap-2 mb-3">
									<span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(participant?.status)}`}>
										{fmtStatus(participant?.status)}
									</span>
									{showPayment && participant?.payment_status === 'paid' && (
										<span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700">
											<IndianRupee className="w-2.5 h-2.5" />Paid
										</span>
									)}
									{showPayment && participant?.payment_status === 'pending' && (
										<span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-100 text-yellow-700">Pending</span>
									)}
								</div>
								<div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
									<div className="flex items-center gap-2">
										<Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
										<div>
											<p className="text-[10px] text-gray-400">Token</p>
											<p className="text-xs font-bold text-primary-600">{participant?.token_number}</p>
										</div>
									</div>
									{showCamp && participant?.camp?.name && (
										<div className="flex items-center gap-2">
											<Tent className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
											<div>
												<p className="text-[10px] text-gray-400">Camp</p>
												<p className="text-xs font-semibold text-gray-800">{participant.camp.name}</p>
											</div>
										</div>
									)}
									<div className="flex items-center gap-2">
										<Activity className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
										<div>
											<p className="text-[10px] text-gray-400">Steps Done</p>
											<p className="text-xs font-semibold text-gray-800">{stepResponses.length}</p>
										</div>
									</div>
								</div>
								{participant?.registered_at && (
									<div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-1.5 text-[11px] text-gray-400">
										<Calendar className="w-3 h-3" />
										Registered {new Date(participant.registered_at).toLocaleString('en-GB', {
											year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
										})}
									</div>
								)}
							</div>

							{detailByStep.length > 0 && (
								<div>
									<h3 className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Details</h3>
									<div className="space-y-3">
										{detailByStep.map(({ step, fields }) => (
											<div key={step.id ?? step.step_name} className="border border-gray-100 rounded-xl p-4">
												<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
													{step.step_name || `Step ${step.step_order}`}
												</p>
												<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
													{fields.map(field => (
														<div key={field.id}>
															<p className="text-[10px] text-gray-400">{field.label}</p>
															<p className="text-xs font-semibold text-gray-800">
																{formatParticipantFieldValue(fieldValues[field.id], field.type)}
															</p>
														</div>
													))}
												</div>
											</div>
										))}
									</div>
								</div>
							)}

							{stepResponses.length > 0 && (
								<div>
									<h3 className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Step Journey</h3>
									<div className="space-y-2">
										{stepResponses.map(resp => {
											const isExpanded = expandedSteps.has(resp.id)
											const stepName = resp.step_template?.step_name || `Step ${resp.step_template?.step_order}`
											return (
												<div key={resp.id} className="border border-gray-100 rounded-xl overflow-hidden">
													<button
														onClick={() => toggleStep(resp.id)}
														className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
													>
														<div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
															<CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
														</div>
														<div className="flex-1 min-w-0">
															<div className="flex items-center gap-2 flex-wrap">
																<p className="text-xs font-semibold text-gray-800">{stepName}</p>
																{resp.outcome && (
																	<span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${outcomeBadge(resp.outcome)}`}>
																		{resp.outcome}
																	</span>
																)}
															</div>
															<p className="text-[11px] text-gray-400 mt-0.5">
																{resp.handler?.name && `By ${resp.handler.name}`}
																{resp.completed_at && ` · ${new Date(resp.completed_at).toLocaleString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
															</p>
														</div>
														{isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
													</button>
													{isExpanded && (
														<div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
															{(() => {
																const fields = fieldsForStepResponse(resp, catalog)
																const stepId = stepTemplateId(resp)
																const stepFiles = media.filter(
																	m => Number(m.step_template_id ?? m.step_template?.id) === stepId,
																)
																const fileFieldDefs = fileFieldsForStep(stepId, catalog)
																const showFiles = fileFieldDefs.length > 0 || stepFiles.length > 0
																if (!fields.length && !showFiles) {
																	return <p className="text-xs text-gray-400 pt-3">No data recorded for this step</p>
																}
																return (
																	<>
																		{fields.length > 0 && (
																			<div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
																				{fields.map(field => (
																					<div key={field.key}>
																						<p className="text-[10px] text-gray-400">{field.label}</p>
																						<p className="text-xs font-semibold text-gray-800">{field.value}</p>
																					</div>
																				))}
																			</div>
																		)}
																		{showFiles && (
																			<div className={`${fields.length ? 'mt-3 pt-3 border-t border-gray-200' : 'pt-3'}`}>
																				<p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Photos &amp; Files</p>
																				<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
																					{(fileFieldDefs.length ? fileFieldDefs : [{ key: '_file', label: 'File' }]).map(field => {
																						const file = stepFiles.find(m => m.field_key === field.key)
																						return (
																							<div key={field.key} className="border border-gray-100 rounded-lg p-2 bg-white">
																								<div className="w-full h-20 rounded overflow-hidden mb-1.5">
																									{file?.file_type?.startsWith('image/') ? (
																										<AuthImage
																											src={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
																											alt={file.file_name}
																											className="w-full h-full object-cover"
																											placeholderClass="w-full h-full"
																										/>
																									) : file ? (
																										<div className="w-full h-full bg-gray-50 flex items-center justify-center">
																											<FileText className="w-5 h-5 text-gray-300" />
																										</div>
																									) : (
																										<div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-1">
																											<Image className="w-5 h-5 text-gray-300" />
																											<span className="text-[9px] text-gray-400">Not uploaded</span>
																										</div>
																									)}
																								</div>
																								<p className="text-[10px] text-gray-700 truncate">{field.label}</p>
																								{file && (
																									<a
																										href={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
																										target="_blank"
																										rel="noopener noreferrer"
																										className="text-[10px] text-primary-600 hover:text-primary-700"
																									>
																										View
																									</a>
																								)}
																							</div>
																						)
																					})}
																				</div>
																			</div>
																		)}
																	</>
																)
															})()}
														</div>
													)}
												</div>
											)
										})}
									</div>
								</div>
							)}

							{stepResponses.length === 0 && (
								<div className="text-center py-6">
									<Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
									<p className="text-xs text-gray-400">No steps completed yet</p>
								</div>
							)}

							{media.length > 0 && (
								<div>
									<h3 className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Uploaded Files</h3>
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
										{media.map(file => (
											<div key={file.id} className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow">
												<div className="w-full h-12 rounded-lg overflow-hidden mb-2">
													{file.file_type?.startsWith('image/')
														? (
															<AuthImage
																src={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
																alt={file.file_name}
																className="w-full h-full object-cover"
																placeholderClass="w-full h-full"
															/>
														)
														: <div className="w-full h-full bg-gray-50 flex items-center justify-center"><FileText className="w-5 h-5 text-gray-300" /></div>
													}
												</div>
												<p className="text-[11px] text-gray-700 truncate font-medium">{file.file_name}</p>
												<p className="text-[10px] text-gray-400 mt-0.5">{file.step_template?.step_name || '—'}</p>
												<a
													href={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1 text-primary-600 text-[11px] font-medium mt-2 hover:text-primary-700"
												>
													<Download className="w-3 h-3" /> Download
												</a>
											</div>
										))}
									</div>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	)
}
