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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/camp-dashboard/${campId}/participants`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">
            Participant Detail
          </h1>
        </div>
      </div>

      {/* Participant Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {(participant?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Name</p>
                <p className="font-semibold text-gray-900">{participant?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Hash className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Token Number</p>
                <p className="font-bold text-primary-600">{participant?.token_number}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Age / Gender</p>
                <p className="font-semibold text-gray-900">{participant?.age} · {participant?.gender}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone</p>
                <p className="font-semibold text-gray-900">{participant?.phone || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
        {participant?.created_at && (
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            Registered at {new Date(participant.created_at).toLocaleString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        )}
      </div>

      {/* Step Journey Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-poppins text-xl font-bold text-gray-900 mb-6">Step Journey</h2>

        {Array.isArray(stepResponses) && stepResponses.length > 0 ? (
          <div className="space-y-4">
            {stepResponses.map((step, index) => {
              const isCompleted = !!step.completed_at
              const isExpanded = expandedStep === (step.id || index)

              return (
                <div key={step.id || index} className="border border-gray-100 rounded-xl overflow-hidden">
                  {/* Step Header */}
                  <button
                    onClick={() => isCompleted && toggleStep(step.id || index)}
                    className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${
                      isCompleted ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {/* Timeline dot */}
                    <div className="flex flex-col items-center flex-shrink-0">
                      {isCompleted ? (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <p className="font-semibold text-gray-900">{step.step_name || step.name}</p>
                        {step.outcome && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getOutcomeBadge(step.outcome)}`}>
                            {step.outcome}
                          </span>
                        )}
                        {!isCompleted && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            Waiting
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
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
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    )}
                  </button>

                  {/* Expanded Response Data */}
                  {isExpanded && step.response_data && (
                    <div className="px-4 pb-4 ml-12">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">Response Data</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {typeof step.response_data === 'object' ? (
                            Object.entries(step.response_data).map(([key, value]) => (
                              <div key={key} className="flex flex-col">
                                <span className="text-xs text-gray-500 font-medium">
                                  {key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                                </span>
                                <span className="text-sm text-gray-900 font-medium">{String(value)}</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-600">{String(step.response_data)}</p>
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
          <div className="text-center py-8">
            <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No step responses recorded yet.</p>
          </div>
        )}
      </div>

      {/* Media Files */}
      {Array.isArray(media) && media.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-poppins text-xl font-bold text-gray-900 mb-4">Uploaded Files</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((file, index) => (
              <div key={file.id || index} className="border border-gray-100 rounded-xl p-3 hover:shadow-md transition-shadow">
                <div className="w-full h-24 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                  {file.mime_type?.startsWith('image/') ? (
                    <Image className="w-8 h-8 text-gray-400" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate font-medium">{file.original_name || file.file_name}</p>
                <p className="text-xs text-gray-400 mt-1">{file.step_name || 'Unknown step'}</p>
                <a
                  href={file.url || `${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary-600 text-xs font-medium mt-2 hover:text-primary-700"
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
