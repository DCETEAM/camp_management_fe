import api from '../../../../core/interceptors/axiosInterceptor'

const organizationService = {
	getOrganizations: async (params = {}) => {
		const response = await api.get('/organizations', { params })
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

	getOrgEventTypes: async (orgId) => {
		const response = await api.get(`/organizations/${orgId}/event-types`)
		return response.data
	},

	syncOrgEventTypes: async (orgId, eventTypeIds) => {
		const response = await api.put(`/organizations/${orgId}/event-types`, { event_type_ids: eventTypeIds })
		return response.data
	},
}

export default organizationService
