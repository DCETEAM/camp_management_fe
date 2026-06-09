import api from '../../../core/interceptors/axiosInterceptor'

const organizerService = {
	getCampSummary: async (campId) => {
		const response = await api.get(`/camps/${campId}/summary`)
		return response.data
	},

	getStepStats: async (campId) => {
		const response = await api.get(`/camps/${campId}/step-stats`)
		return response.data
	},

	getCampStaff: async (campId) => {
		const response = await api.get(`/camps/${campId}/staff`)
		return response.data
	},

	getCampDetail: async (campId) => {
		const response = await api.get(`/camps/${campId}`)
		return response.data
	},

	getParticipants: async (campId, params = {}) => {
		const response = await api.get(`/camps/${campId}/participants`, { params })
		return response.data
	},

	getParticipantFieldCatalog: async (campId) => {
		const response = await api.get(`/camps/${campId}/participant-field-catalog`)
		return response.data
	},

	getParticipantDetail: async (participantId) => {
		const response = await api.get(`/participants/${participantId}`)
		return response.data
	},

	getParticipantStepResponses: async (participantId) => {
		const response = await api.get(`/participants/${participantId}/step-responses`)
		return response.data
	},

	getParticipantMedia: async (participantId) => {
		const response = await api.get(`/participants/${participantId}/media`)
		return response.data
	},

}

export default organizerService
