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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Event Types</h1>
          <p className="text-xs text-gray-500">Define and manage camp event types</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Event Type
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <p className="text-primary-100 text-xs font-medium">Total Event Types</p>
          </div>
          <p className="text-2xl font-bold">{eventTypes.length}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Active</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {eventTypes.filter(t => t.status === 'active').length}
          </p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListChecks className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Total Steps</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {eventTypes.reduce((sum, t) => sum + t.steps, 0)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search event types..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Event Type</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Steps</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-2.5 text-right text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEventTypes.map((type) => (
                <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-accent-100 to-accent-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CalendarCheck className="w-4 h-4 text-accent-600" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900">{type.name}</p>
                        {type.description && (
                          <p className="text-[11px] text-gray-500">{type.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <ListChecks className="w-3 h-3 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-700">{type.steps} steps</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      type.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {type.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                      <Calendar className="w-3 h-3" />
                      {new Date(type.dateCreated).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right">
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
          <div className="p-8 text-center">
            <CalendarCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No event types found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search or create a new event type</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-poppins text-sm font-bold text-gray-900">
                {editingType ? 'Edit Event Type' : 'Create Event Type'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Event Type Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                  placeholder="e.g., Eye Camp, Dental Camp"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all resize-none"
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
                  <span className="text-xs font-medium text-gray-700">Active</span>
                </label>
              </div>

              <div className="flex gap-2 pt-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
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
