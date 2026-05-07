import api from '../../../../core/interceptors/axiosInterceptor'

const eventTypeService = {
	getEventTypes: async (params = {}) => {
		const response = await api.get('/event-types', { params })
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

	deleteEventType: async (id) => {
		const response = await api.delete(`/event-types/${id}`)
		return response.data
	},
}

export default eventTypeService
