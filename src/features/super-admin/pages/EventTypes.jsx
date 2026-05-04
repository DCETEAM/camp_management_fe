import { useState } from 'react'
import { 
  Search, 
  Plus, 
  Edit, 
  ToggleLeft, 
  ToggleRight,
  CalendarCheck,
  ListChecks,
  Calendar,
  X,
  Save
} from 'lucide-react'

export default function EventTypes() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingType, setEditingType] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  })

  const [eventTypes, setEventTypes] = useState([
    {
      id: 1,
      name: 'Eye Camp',
      description: 'Comprehensive eye checkup and vision screening',
      steps: 5,
      status: 'active',
      dateCreated: '2024-01-05'
    },
    {
      id: 2,
      name: 'Dental Camp',
      description: 'Dental health checkup and oral hygiene',
      steps: 4,
      status: 'active',
      dateCreated: '2024-01-20'
    },
    {
      id: 3,
      name: 'General Health Check',
      description: 'Complete health screening and vital checks',
      steps: 6,
      status: 'inactive',
      dateCreated: '2024-02-10'
    }
  ])

  const filteredEventTypes = eventTypes.filter(type =>
    type.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleStatus = (id) => {
    setEventTypes(eventTypes.map(type =>
      type.id === id 
        ? { ...type, status: type.status === 'active' ? 'inactive' : 'active' }
        : type
    ))
  }

  const handleOpenModal = (type = null) => {
    if (type) {
      setEditingType(type)
      setFormData({
        name: type.name,
        description: type.description || '',
        active: type.status === 'active'
      })
    } else {
      setEditingType(null)
      setFormData({
        name: '',
        description: '',
        active: true
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (editingType) {
      setEventTypes(eventTypes.map(type =>
        type.id === editingType.id
          ? { ...type, ...formData, status: formData.active ? 'active' : 'inactive' }
          : type
      ))
    } else {
      setEventTypes([
        ...eventTypes,
        {
          id: Date.now(),
          ...formData,
          steps: 0,
          status: formData.active ? 'active' : 'inactive',
          dateCreated: new Date().toISOString().split('T')[0]
        }
      ])
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">Event Types</h1>
          <p className="text-gray-600 mt-1">Define and manage camp event types</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-2.5 px-5 rounded-xl transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create Event Type
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
          </div>
          <p className="text-primary-100 text-sm font-medium mb-1">Total Event Types</p>
          <p className="text-3xl font-bold">{eventTypes.length}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Active</p>
          <p className="text-3xl font-bold text-gray-900">
            {eventTypes.filter(t => t.status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ListChecks className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Total Steps</p>
          <p className="text-3xl font-bold text-gray-900">
            {eventTypes.reduce((sum, t) => sum + t.steps, 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search event types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Event Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Steps
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEventTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-accent-100 to-accent-200 rounded-xl flex items-center justify-center">
                        <CalendarCheck className="w-5 h-5 text-accent-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{type.name}</p>
                        {type.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-700">{type.steps} steps</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      type.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {type.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(type.dateCreated).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(type)}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(type.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          type.status === 'active'
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {type.status === 'active' ? (
                          <ToggleRight className="w-4 h-4" />
                        ) : (
                          <ToggleLeft className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredEventTypes.length === 0 && (
          <div className="p-12 text-center">
            <CalendarCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No event types found</h3>
            <p className="text-gray-500">Try adjusting your search or create a new event type</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-poppins text-xl font-bold text-gray-900">
                {editingType ? 'Edit Event Type' : 'Create Event Type'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Type Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="e.g., Eye Camp, Dental Camp"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
                  placeholder="Enter a short description"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-primary-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-3 rounded-xl transition-all"
                >
                  <Save className="w-5 h-5" />
                  {editingType ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
