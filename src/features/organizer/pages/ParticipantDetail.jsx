import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User, Phone, Hash, Calendar, CheckCircle2, Clock, ChevronDown, ChevronUp, FileText, Image, Download, Loader, AlertCircle, Activity } from 'lucide-react'
import organizerService from '../services/organizer-service'

const outcomeBadge = (o) => ({
  Completed:  'bg-green-100 text-green-700',
  Normal:     'bg-blue-100 text-blue-700',
  Referred:   'bg-orange-100 text-orange-700',
  Treated:    'bg-purple-100 text-purple-700',
  'No Action':'bg-gray-100 text-gray-600',
  Incomplete: 'bg-red-100 text-red-700',
}[o] || 'bg-gray-100 text-gray-600')

const statusBadge = (s) => ({
  completed:   'bg-green-100 text-green-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  not_started: 'bg-gray-100 text-gray-600',
}[s] || 'bg-gray-100 text-gray-600')

export default function ParticipantDetail() {
  const { id: campId, participantId } = useParams()
  const navigate = useNavigate()

  const [participant, setParticipant]     = useState(null)
  const [stepResponses, setStepResponses] = useState([])
  const [media, setMedia]                 = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [expandedStep, setExpandedStep]   = useState(null)

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
        setError(e.response?.data?.message || 'Failed to load participant data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [participantId])

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
      <Loader className="w-5 h-5 animate-spin" /> Loading…
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
    </div>
  )

  const stepsCompleted = stepResponses.length

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/camp-dashboard/${campId}/participants`)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Participant Detail</h1>
          <p className="text-xs text-gray-500">{participant?.token_number} &middot; {stepsCompleted} step{stepsCompleted !== 1 ? 's' : ''} completed</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-white text-base font-bold flex-shrink-0">
            {(participant?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="font-poppins text-sm font-bold text-gray-900">{participant?.name}</p>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge(participant?.status)}`}>
                {(participant?.status || 'unknown').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
              {[
                { icon: Hash, label: 'Token', value: participant?.token_number, bold: true },
                { icon: User, label: 'Age / Gender', value: `${participant?.age}y · ${participant?.gender}` },
                { icon: Phone, label: 'Phone', value: participant?.phone || 'N/A' },
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
          </div>
        </div>
        {participant?.registered_at && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar className="w-3 h-3" />
            Registered {new Date(participant.registered_at).toLocaleString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
          </div>
        )}
      </div>

      {/* Step Journey */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-poppins text-sm font-bold text-gray-900 mb-4">Step Journey</h2>
        {stepResponses.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-7 h-7 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No steps completed yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stepResponses.map((resp) => {
              const isExpanded = expandedStep === resp.id
              const stepName = resp.step_template?.step_name || `Step ${resp.step_template?.step_order}`
              return (
                <div key={resp.id} className="border border-gray-100 rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedStep(isExpanded ? null : resp.id)}
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

      {/* Media Files */}
      {media.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Uploaded Files</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map((file) => (
              <div key={file.id} className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                <div className="w-full h-14 bg-gray-50 rounded-lg flex items-center justify-center mb-2">
                  {file.mime_type?.startsWith('image/') ? <Image className="w-6 h-6 text-gray-300" /> : <FileText className="w-6 h-6 text-gray-300" />}
                </div>
                <p className="text-[11px] text-gray-700 truncate font-medium">{file.original_name || file.file_name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{file.step_template?.step_name || '—'}</p>
                <a href={file.url || '#'} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 text-[11px] font-medium mt-2 hover:text-primary-700">
                  <Download className="w-3 h-3" /> Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
