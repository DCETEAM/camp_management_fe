import api from '../../../core/interceptors/axiosInterceptor'

const superAdminService = {
	// Organizations
	getOrganizations: async (search = '') => {
		const response = await api.get('/organizations', {
			params: search ? { search } : {}
		})
		return response.data
	},

	createOrganization: async (data) => {
		const response = await api.post('/organizations', data)
		return response.data
	},

	updateOrganization: async (id, data) => {
		const response = await api.put(`/organizations/${id}`, data)
		return response.data
	},

	// Users (All Users across orgs)
	getUsers: async (params = {}) => {
		const response = await api.get('/users', { params })
		return response.data
	},

	updateUser: async (id, data) => {
		const response = await api.put(`/users/${id}`, data)
		return response.data
	},

	// Event Types
	getEventTypes: async () => {
		const response = await api.get('/event-types')
		return response.data
	},

	createEventType: async (data) => {
		const response = await api.post('/event-types', data)
		return response.data
	},

	updateEventType: async (id, data) => {
		const response = await api.put(`/event-types/${id}`, data)
		return response.data
	},

	// Step Templates
	getStepTemplates: async (eventTypeId) => {
		const response = await api.get('/step-templates', {
			params: { event_type_id: eventTypeId }
		})
		return response.data
	},

	createStepTemplate: async (data) => {
		const response = await api.post('/step-templates', data)
		return response.data
	},

	updateStepTemplate: async (id, data) => {
		const response = await api.put(`/step-templates/${id}`, data)
		return response.data
	},

	deleteStepTemplate: async (id) => {
		const response = await api.delete(`/step-templates/${id}`)
		return response.data
	},

	reorderStepTemplates: async (eventTypeId, orderedIds) => {
		const response = await api.patch('/step-templates/reorder', {
			event_type_id: eventTypeId,
			ordered_ids: orderedIds
		})
		return response.data
	},
}

export default superAdminService
