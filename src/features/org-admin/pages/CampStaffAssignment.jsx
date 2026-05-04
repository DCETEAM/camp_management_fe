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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/org-dashboard/camps/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">
            Staff Assignment
          </h1>
          <p className="text-gray-600 mt-1">{camp.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-poppins text-lg font-bold text-gray-900 mb-4">Steps</h2>
            <div className="space-y-2">
              {camp.steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setSelectedStep(step.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all flex items-center justify-between ${
                    (selectedStep === step.id || (!selectedStep && step.id === camp.steps[0].id))
                      ? 'bg-primary-50 border border-primary-200 text-primary-700'
                      : 'bg-gray-50 border border-transparent text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ListChecks className="w-5 h-5" />
                    <span className="font-semibold">{step.name}</span>
                  </div>
                  <span className="text-sm px-2 py-0.5 bg-gray-200 rounded-full">
                    {camp.assignments[step.id]?.length || 0}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-poppins text-lg font-bold text-gray-900">
                {currentStep?.name} - Assigned Staff
              </h2>
            </div>

            <div className="space-y-3 mb-6">
              {currentAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No staff assigned yet</p>
                </div>
              ) : (
                currentAssignments.map((staff) => (
                  <div key={staff.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {staff.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{staff.name}</p>
                        <p className="text-sm text-gray-500">{staff.role}</p>
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
              <div className="pt-6 border-t border-gray-100">
                <h3 className="font-semibold text-gray-700 mb-4">Add Staff</h3>
                <div className="flex gap-3">
                  <select className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none bg-white">
                    <option value="">Select a user...</option>
                    {availableForAssignment.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.role})
                      </option>
                    ))}
                  </select>
                  <button className="flex items-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-5 rounded-xl transition-all">
                    <UserPlus className="w-5 h-5" />
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
