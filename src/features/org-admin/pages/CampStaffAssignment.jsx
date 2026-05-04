import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  User, 
  UserPlus, 
  Trash2,
  ListChecks
} from 'lucide-react'

export default function CampStaffAssignment() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [selectedStep, setSelectedStep] = useState(null)

  const [camp] = useState({
    id: id,
    name: 'Chennai Dental Camp',
    steps: [
      { id: 1, name: 'Registration' },
      { id: 2, name: 'Dental Checkup' },
      { id: 3, name: 'Consultation' }
    ],
    assignments: {
      1: [
        { id: 1, name: 'David Brown', role: 'staff' }
      ],
      2: [
        { id: 3, name: 'Sarah Williams', role: 'staff' }
      ],
      3: []
    }
  })

  const [availableUsers] = useState([
    { id: 1, name: 'David Brown', role: 'staff' },
    { id: 2, name: 'Mike Johnson', role: 'organizer' },
    { id: 3, name: 'Sarah Williams', role: 'staff' },
    { id: 4, name: 'Jane Smith', role: 'org_admin' }
  ])

  const currentStep = camp.steps.find(s => s.id === selectedStep) || camp.steps[0]
  const currentAssignments = camp.assignments[currentStep?.id] || []
  const assignedUserIds = currentAssignments.map(u => u.id)
  const availableForAssignment = availableUsers.filter(u => !assignedUserIds.includes(u.id))

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/org-dashboard/camps/${id}`)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Staff Assignment</h1>
          <p className="text-xs text-gray-500">{camp.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h2 className="font-poppins text-sm font-bold text-gray-900 mb-3">Steps</h2>
            <div className="space-y-1.5">
              {camp.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setSelectedStep(step.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all flex items-center justify-between ${
                    (selectedStep === step.id || (!selectedStep && step.id === camp.steps[0].id))
                      ? 'bg-primary-50 border border-primary-200 text-primary-700'
                      : 'bg-gray-50 border border-transparent text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    <span className="text-xs font-semibold">{step.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-200 rounded-full">
                    {camp.assignments[step.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-poppins text-sm font-bold text-gray-900">
                {currentStep?.name} - Assigned Staff
              </h2>
            </div>

            <div className="space-y-2 mb-4">
              {currentAssignments.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs">No staff assigned yet</p>
                </div>
              ) : (
                currentAssignments.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{staff.name}</p>
                        <p className="text-[11px] text-gray-500">{staff.role}</p>
                      </div>
                    </div>
                    <button className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {availableForAssignment.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-700 mb-3">Add Staff</h3>
                <div className="flex gap-2">
                  <select className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                    <option value="">Select a user...</option>
                    {availableForAssignment.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                  <button className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all">
                    <UserPlus className="w-3.5 h-3.5" />
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
