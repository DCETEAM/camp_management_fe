import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Search, ArrowLeft, Users, Filter, Loader, AlertCircle, RefreshCw, ChevronRight,
  X, CheckCircle2, ChevronDown, ChevronUp, Phone, Hash, Calendar,
  Activity, User, FileText, Image, Download, Clock
} from 'lucide-react'
import organizerService from '../services/organizer-service'
import AuthImage from '../../../common/components/AuthImage'

const outcomeBadge = (o) => ({
  Completed:   'bg-green-100 text-green-700',
  Normal:      'bg-blue-100 text-blue-700',
  Referred:    'bg-orange-100 text-orange-700',
  Treated:     'bg-purple-100 text-purple-700',
  'No Action': 'bg-gray-100 text-gray-600',
  Incomplete:  'bg-red-100 text-red-700',
}[o] || 'bg-gray-100 text-gray-600')

const statusBadge = (s) => ({
  completed:   'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  not_started: 'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600')

const fmtStatus = (s) => (s || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

function ParticipantModal({ participantId, campId, onClose }) {
  const [participant, setParticipant]     = useState(null)
  const [stepResponses, setStepResponses] = useState([])
  const [media, setMedia]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [expandedSteps, setExpandedSteps] = useState(new Set())
  const allExpanded = stepResponses.length > 0 && expandedSteps.size === stepResponses.length

  const toggleStep = (id) => setExpandedSteps(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })
  const toggleAll = () => setExpandedSteps(
    allExpanded ? new Set() : new Set(stepResponses.map(r => r.id))
  )

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [p, sr, m] = await Promise.all([
          organizerService.getParticipantDetail(participantId),
          organizerService.getParticipantStepResponses(participantId),
          organizerService.getParticipantMedia(participantId),
        ])
        setParticipant(p)
        setStepResponses([...sr].sort((a, b) => (a.step_template?.step_order ?? 0) - (b.step_template?.step_order ?? 0)))
        setMedia(Array.isArray(m) ? m : m.data ?? [])
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load participant')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [participantId])

  const stepsCompleted = stepResponses.length
  const fmtStatus = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  const statusBadge = (s) => ({ completed: 'bg-green-100 text-green-700', in_progress: 'bg-yellow-100 text-yellow-700', not_started: 'bg-gray-100 text-gray-600' }[s] || 'bg-gray-100 text-gray-600')

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60"
      onClick={onClose}>
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] rounded-t-2xl"
        onClick={e => e.stopPropagation()}>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(participant?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-poppins text-sm font-bold text-gray-900">{participant?.name || '…'}</p>
              <p className="text-[11px] text-gray-500">{participant?.token_number} · {stepsCompleted} step{stepsCompleted !== 1 ? 's' : ''} done</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Scrollable body */}
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
              {/* Info */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(participant?.status)}`}>
                    {fmtStatus(participant?.status)}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { icon: Hash,     label: 'Token',      value: participant?.token_number, bold: true },
                    { icon: User,     label: 'Age / Gender', value: `${participant?.age}y · ${participant?.gender}` },
                    { icon: Phone,    label: 'Phone',      value: participant?.phone || 'N/A' },
                    { icon: Activity, label: 'Steps Done', value: `${stepsCompleted}` },
                  ].map(({ icon: Icon, label, value, bold }) => (
                    <div key={label} className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400">{label}</p>
                        <p className={`text-xs ${bold ? 'font-bold text-primary-600' : 'font-semibold text-gray-800'}`}>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {participant?.registered_at && (
                  <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    Registered {new Date(participant.registered_at).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </div>
                )}
              </div>

              {/* Step Journey */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider">Step Journey</h3>
                  {stepResponses.length > 0 && (
                    <button onClick={toggleAll}
                      className="text-[11px] font-semibold text-primary-600 hover:text-primary-700 transition-colors">
                      {allExpanded ? 'Collapse All' : 'Expand All'}
                    </button>
                  )}
                </div>
                {stepResponses.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">No steps completed yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {stepResponses.map(resp => {
                      const isExpanded = expandedSteps.has(resp.id)
                      const stepName = resp.step_template?.step_name || `Step ${resp.step_template?.step_order}`
                      return (
                        <div key={resp.id} className="border border-gray-100 rounded-xl overflow-hidden">
                          <button onClick={() => toggleStep(resp.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors">
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
                                {resp.completed_at && ` · ${new Date(resp.completed_at).toLocaleString('en-US', { month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}`}
                              </p>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          </button>
                          {isExpanded && (
                            <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                              {resp.response_data && Object.keys(resp.response_data).length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                                  {Object.entries(resp.response_data).map(([k, v]) => (
                                    <div key={k}>
                                      <p className="text-[10px] text-gray-400 capitalize">{k.replace(/_/g, ' ')}</p>
                                      <p className="text-xs font-semibold text-gray-800">{String(v) || '—'}</p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 pt-3">No data recorded</p>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Media */}
              {media.length > 0 && (
                <div>
                  <h3 className="font-poppins text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Uploaded Files</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {media.map(file => (
                      <div key={file.id} className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                        <div className="w-full h-12 rounded-lg overflow-hidden mb-2">
                          {file.file_type?.startsWith('image/')
                            ? <AuthImage
                                src={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
                                alt={file.file_name}
                                className="w-full h-full object-cover"
                                placeholderClass="w-full h-full"
                              />
                            : <div className="w-full h-full bg-gray-50 flex items-center justify-center"><FileText className="w-5 h-5 text-gray-300" /></div>
                          }
                        </div>
                        <p className="text-[11px] text-gray-700 truncate font-medium">{file.file_name}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{file.step_template?.step_name || '—'}</p>
                        <a href={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary-600 text-[11px] font-medium mt-2 hover:text-primary-700">
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

export default function ParticipantList() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [participants, setParticipants] = useState([])
  const [stepStats, setStepStats]       = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState(null)
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [stepFilter, setStepFilter]     = useState(null) // step_template_id or null
  const [page, setPage]                 = useState(1)
  const [meta, setMeta]                 = useState(null)
  const [selectedId, setSelectedId]     = useState(null)

  const load = useCallback(async (pg = 1) => {
    try {
      setLoading(true)
      const [pData, sData] = await Promise.all([
        organizerService.getParticipants(id, {
          search: search || undefined,
          status: statusFilter || undefined,
          step_template_id: stepFilter || undefined,
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
  }, [id, search, statusFilter, stepFilter])

  useEffect(() => { load(1); setPage(1) }, [id, search, statusFilter, stepFilter])

  const filtered = participants

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )

  return (
    <div className="space-y-4">
      {selectedId && (
        <ParticipantModal
          participantId={selectedId}
          campId={id}
          onClose={() => setSelectedId(null)}
        />
      )}
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/camp-dashboard/${id}`)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <h1 className="font-poppins text-lg font-bold text-gray-900">Participants</h1>
            <p className="text-xs text-gray-500">{meta?.total ?? participants.length} registered</p>
          </div>
        </div>
        <button onClick={() => load(page)} disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Step filter tabs */}
      {stepStats.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setStepFilter(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!stepFilter ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
            All Steps
          </button>
          {stepStats.map(s => (
            <button key={s.step_template_id} onClick={() => setStepFilter(s.step_template_id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${stepFilter === s.step_template_id ? 'bg-primary-500 text-white border-primary-500' : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'}`}>
              {s.step_name}
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold ${stepFilter === s.step_template_id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {s.done ?? 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Search & Status filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or token…"
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none" />
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-gray-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-gray-200 rounded-lg bg-white text-gray-600 focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
          <Loader className="w-5 h-5 animate-spin" /> Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-10 text-center">
          <Users className="w-8 h-8 text-gray-200 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700 mb-1">No participants found</p>
          <p className="text-xs text-gray-400">{search || statusFilter ? 'Try adjusting filters.' : 'No participants registered yet.'}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Mobile: card list */}
          <div className="divide-y divide-gray-50 sm:hidden">
            {filtered.map(p => (
              <button key={p.id} onClick={() => setSelectedId(p.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-700">{p.token_number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                  <p className="text-[11px] text-gray-500">{p.age}y · {p.gender}{p.phone ? ` · ${p.phone}` : ''}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {p.current_step ? `Next: ${p.current_step.step_name}` : 'All steps done'}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(p.status)}`}>
                    {fmtStatus(p.status)}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
                </div>
              </button>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {['Token','Name','Age','Gender','Phone','Current Step','Status','Registered'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => (
                  <tr key={p.id} onClick={() => setSelectedId(p.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-2.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-primary-50 text-primary-700 font-bold text-[11px]">{p.token_number}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-gray-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.age}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.gender}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.phone || '—'}</td>
                    <td className="px-4 py-2.5 text-xs text-gray-600">{p.current_step?.step_name || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${statusBadge(p.status)}`}>
                        {fmtStatus(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[11px] text-gray-500">
                      {p.registered_at ? new Date(p.registered_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page}</p>
              <div className="flex gap-2">
                <button onClick={() => { setPage(p => p-1); load(page-1) }} disabled={page <= 1}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Prev</button>
                <button onClick={() => { setPage(p => p+1); load(page+1) }} disabled={page >= meta.last_page}
                  className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">Next</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
