import api from '../../../../core/interceptors/axiosInterceptor'

const stepTemplateService = {
	getStepTemplates: async (eventTypeId) => {
		const response = await api.get('/step-templates', { params: { event_type_id: eventTypeId } })
		return response.data
	},

	getStepTemplate: async (id) => {
		const response = await api.get(`/step-templates/${id}`)
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
			ordered_ids: orderedIds,
		})
		return response.data
	},
}

export default stepTemplateService
