import api from '../../../core/interceptors/axiosInterceptor'

const staffService = {
	// Queue
	getQueue: async (campId, stepTemplateId) => {
		const response = await api.get(`/camps/${campId}/queue`, {
			params: { step_template_id: stepTemplateId }
		})
		return response.data
	},

	// Step Template
	getStepTemplate: async (stepTemplateId) => {
		const response = await api.get(`/step-templates/${stepTemplateId}`)
		return response.data
	},

	// Participant Status
	updateParticipantStatus: async (participantId, data) => {
		const response = await api.patch(`/participants/${participantId}/status`, data)
		return response.data
	},

	// Step Responses
	createStepResponse: async (data) => {
		const response = await api.post('/step-responses', data)
		return response.data
	},

	// Media Upload
	uploadMedia: async (formData) => {
		const response = await api.post('/media', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})
		return response.data
	},

	downloadMedia: async (mediaId) => {
		const response = await api.get(`/media/${mediaId}/file`, {
			responseType: 'blob'
		})
		return response.data
	},

	// Get participant's previous responses for a step
	getParticipantStepResponses: async (participantId, stepTemplateId) => {
		const response = await api.get(`/participants/${participantId}/step-responses`, {
			params: stepTemplateId ? { step_template_id: stepTemplateId } : {}
		})
		return response.data
	},
}

export default staffService
