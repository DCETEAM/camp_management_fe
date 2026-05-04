import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Phone,
  Hash,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Image,
  Download,
} from 'lucide-react'

export default function ParticipantDetail() {
  const { id: campId, participantId } = useParams()
  const navigate = useNavigate()

  const [participant] = useState({
    id: participantId,
    name: 'Ramesh Kumar',
    token_number: 'A001',
    age: 55,
    gender: 'Male',
    phone: '9876543210',
    created_at: '2025-01-15T09:00:00',
  })

  const [stepResponses] = useState([
    {
      id: 1,
      step_name: 'Registration',
      handled_by_name: 'Anitha S',
      outcome: 'Registered',
      completed_at: '2025-01-15T09:00:00',
      response_data: { name: 'Ramesh Kumar', age: '55', gender: 'Male', phone: '9876543210' },
    },
    {
      id: 2,
      step_name: 'Vision Test',
      handled_by_name: 'Dr. Meena P',
      outcome: 'Normal',
      completed_at: '2025-01-15T09:25:00',
      response_data: { vision_right: '6/6', vision_left: '6/12', notes: 'Mild strain in left eye' },
    },
    {
      id: 3,
      step_name: 'Doctor Checkup',
      handled_by_name: 'Dr. Suresh R',
      outcome: 'Referred',
      completed_at: '2025-01-15T09:45:00',
      response_data: { diagnosis: 'Early cataract', prescription: 'Eye drops prescribed', follow_up: 'Yes' },
    },
    {
      id: 4,
      step_name: 'Pharmacy',
      handled_by_name: null,
      outcome: null,
      completed_at: null,
      response_data: null,
    },
  ])

  const [media] = useState([
    { id: 1, original_name: 'prescription_scan.pdf', mime_type: 'application/pdf', step_name: 'Doctor Checkup' },
    { id: 2, original_name: 'eye_photo_left.jpg', mime_type: 'image/jpeg', step_name: 'Vision Test' },
  ])

  const [expandedStep, setExpandedStep] = useState(null)

  const toggleStep = (stepId) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  const getOutcomeBadge = (outcome) => {
    switch (outcome?.toLowerCase()) {
      case 'treated': return 'bg-green-100 text-green-700'
      case 'referred': return 'bg-orange-100 text-orange-700'
      case 'no action': return 'bg-gray-100 text-gray-600'
      case 'incomplete': return 'bg-red-100 text-red-700'
      case 'normal': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/camp-dashboard/${campId}/participants`)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <h1 className="font-poppins text-lg font-bold text-gray-900">Participant Detail</h1>
      </div>

      {/* Participant Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-400 to-primary-500 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {(participant?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Name</p>
                <p className="text-xs font-semibold text-gray-900">{participant?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Token</p>
                <p className="text-xs font-bold text-primary-600">{participant?.token_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Age / Gender</p>
                <p className="text-xs font-semibold text-gray-900">{participant?.age} · {participant?.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] text-gray-400 font-medium">Phone</p>
                <p className="text-xs font-semibold text-gray-900">{participant?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        {participant?.created_at && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar className="w-3 h-3" />
            Registered {new Date(participant.created_at).toLocaleString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        )}
      </div>

      {/* Step Journey Timeline */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <h2 className="font-poppins text-sm font-bold text-gray-900 mb-4">Step Journey</h2>

        {Array.isArray(stepResponses) && stepResponses.length > 0 ? (
          <div className="space-y-2.5">
            {stepResponses.map((step, index) => {
              const isCompleted = !!step.completed_at
              const isExpanded = expandedStep === (step.id || index)

              return (
                <div key={step.id || index} className="border border-gray-100 rounded-lg overflow-hidden">
                  {/* Step Header */}
                  <button
                    onClick={() => isCompleted && toggleStep(step.id || index)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                      isCompleted ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-semibold text-gray-800">{step.step_name || step.name}</p>
                        {step.outcome && (
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium ${getOutcomeBadge(step.outcome)}`}>
                            {step.outcome}
                          </span>
                        )}
                        {!isCompleted && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-700">
                            Waiting
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                        {step.handled_by_name && <span>By: {step.handled_by_name}</span>}
                        {step.completed_at && (
                          <span>
                            {new Date(step.completed_at).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                        )}
                      </div>
                    </div>

                    {isCompleted && (
                      <div className="flex-shrink-0">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Expanded Response Data */}
                  {isExpanded && step.response_data && (
                    <div className="px-3 pb-3 ml-9">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <h4 className="text-[11px] font-semibold text-gray-600 mb-2">Response Data</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {typeof step.response_data === 'object' ? (
                            Object.entries(step.response_data).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <span className="text-[10px] text-gray-400 font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-xs text-gray-800 font-medium">{String(value)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-600">{String(step.response_data)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <Clock className="w-7 h-7 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-400">No step responses recorded yet.</p>
          </div>
        )}
      </div>

      {/* Media Files */}
      {Array.isArray(media) && media.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Uploaded Files</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {media.map((file, index) => (
              <div key={file.id || index} className="border border-gray-100 rounded-lg p-2.5 hover:shadow-md transition-shadow">
                <div className="w-full h-16 bg-gray-50 rounded-md flex items-center justify-center mb-2">
                  {file.mime_type?.startsWith('image/') ? (
                    <Image className="w-6 h-6 text-gray-300" />
                  ) : (
                    <FileText className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <p className="text-[11px] text-gray-700 truncate font-medium">{file.original_name || file.file_name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{file.step_name || 'Unknown step'}</p>
                <a
                  href={file.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 text-[11px] font-medium mt-1.5 hover:text-primary-700"
                >
                  <Download className="w-3 h-3" />
                  Download
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
