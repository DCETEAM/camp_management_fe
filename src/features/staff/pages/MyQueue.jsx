import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Users, 
  ArrowRight, 
  ArrowDown,
  Clock,
  Activity,
  User
} from 'lucide-react'

export default function MyQueue() {
  const { campId } = useParams()
  const navigate = useNavigate()

  const [stepInfo] = useState({
    stepName: 'Doctor Checkup',
    staffName: 'Dr. Ravi Kumar',
    campName: 'Chennai Dental Camp',
    campId: campId
  })

  const [queue, setQueue] = useState([
    { id: 1, tokenNumber: 'T-001', name: 'Ramesh Kumar', age: 45, gender: 'Male', status: 'waiting', arrivedAt: '09:10 AM' },
    { id: 2, tokenNumber: 'T-004', name: 'Priya Sharma', age: 32, gender: 'Female', status: 'waiting', arrivedAt: '09:22 AM' },
    { id: 3, tokenNumber: 'T-007', name: 'Suresh Babu', age: 58, gender: 'Male', status: 'waiting', arrivedAt: '09:35 AM' },
    { id: 4, tokenNumber: 'T-009', name: 'Lakshmi Devi', age: 41, gender: 'Female', status: 'waiting', arrivedAt: '09:42 AM' },
    { id: 5, tokenNumber: 'T-012', name: 'Vijay Anand', age: 29, gender: 'Male', status: 'waiting', arrivedAt: '09:55 AM' },
  ])

  const [currentlyServing, setCurrentlyServing] = useState(null)

  const handleCallNext = () => {
    if (queue.length === 0) return
    const next = queue[0]
    setCurrentlyServing(next)
    setQueue(queue.slice(1))
    navigate(`/staff-workstation/${campId}/step-form/${next.id}`)
  }

  const handleSkip = (participantId) => {
    const idx = queue.findIndex(p => p.id === participantId)
    if (idx === -1) return
    const skipped = queue[idx]
    const newQueue = [...queue.slice(0, idx), ...queue.slice(idx + 1), skipped]
    setQueue(newQueue)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">{stepInfo.stepName}</h1>
          <p className="text-xs text-gray-500">{stepInfo.staffName} &middot; {stepInfo.campName}</p>
        </div>
        <button
          onClick={handleCallNext}
          disabled={queue.length === 0}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          Call Next
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-primary-100 text-xs font-medium">Waiting</p>
          </div>
          <p className="text-2xl font-bold">{queue.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-yellow-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">In Progress</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{currentlyServing ? 1 : 0}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Est. Wait</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{queue.length * 5}m</p>
        </div>
      </div>

      {/* Currently Serving */}
      {currentlyServing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-yellow-600" />
            <span className="text-xs font-semibold text-yellow-700">Currently Serving</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-yellow-200 rounded-full flex items-center justify-center text-yellow-700 text-xs font-bold">
                {currentlyServing.tokenNumber.split('-')[1]}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">{currentlyServing.name}</p>
                <p className="text-[11px] text-gray-500">{currentlyServing.tokenNumber} &middot; {currentlyServing.age}y &middot; {currentlyServing.gender}</p>
              </div>
            </div>
            <button
              onClick={() => navigate(`/staff-workstation/${campId}/step-form/${currentlyServing.id}`)}
              className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              Continue <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Queue List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-poppins text-sm font-bold text-gray-900">Waiting Queue</h2>
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{queue.length} participants</span>
        </div>

        {queue.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Queue is empty</h3>
            <p className="text-xs text-gray-400">No participants waiting for this step</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {queue.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                {/* Position */}
                <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-[10px] font-bold text-gray-500 flex-shrink-0">
                  {index + 1}
                </div>

                {/* Token badge */}
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-primary-700">
                    {participant.tokenNumber.split('-')[1]}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900">{participant.name}</p>
                  <p className="text-[11px] text-gray-500">
                    {participant.tokenNumber} &middot; {participant.age}y &middot; {participant.gender}
                  </p>
                </div>

                {/* Arrived time */}
                <div className="flex items-center gap-1 text-[11px] text-gray-400">
                  <Clock className="w-3 h-3" />
                  {participant.arrivedAt}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setCurrentlyServing(participant)
                      setQueue(queue.filter(p => p.id !== participant.id))
                      navigate(`/staff-workstation/${campId}/step-form/${participant.id}`)
                    }}
                    className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 hover:text-primary-700 px-2 py-1 rounded hover:bg-primary-50 transition-colors"
                  >
                    <User className="w-3 h-3" />
                    Call
                  </button>
                  <button
                    onClick={() => handleSkip(participant.id)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
                  >
                    <ArrowDown className="w-3 h-3" />
                    Skip
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
