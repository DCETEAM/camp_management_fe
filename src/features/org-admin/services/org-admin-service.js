import api from '../../../core/interceptors/axiosInterceptor'

const orgAdminService = {
	// Organization Users
	getOrgUsers: async (orgId) => {
		const response = await api.get(`/organizations/${orgId}/users`)
		return response.data
	},

	inviteUser: async (data) => {
		const response = await api.post('/users/invite', data)
		return response.data
	},

	updateUser: async (id, data) => {
		const response = await api.put(`/users/${id}`, data)
		return response.data
	},

	// Camps
	getCamps: async (params = {}) => {
		const response = await api.get('/camps', { params })
		return response.data
	},

	getCampDetail: async (id) => {
		const response = await api.get(`/camps/${id}`)
		return response.data
	},

	createCamp: async (data) => {
		const response = await api.post('/camps', data)
		return response.data
	},

	updateCamp: async (id, data) => {
		const response = await api.put(`/camps/${id}`, data)
		return response.data
	},

	getCampSummary: async (id) => {
		const response = await api.get(`/camps/${id}/summary`)
		return response.data
	},

	getCampStaff: async (id) => {
		const response = await api.get(`/camps/${id}/staff`)
		return response.data
	},

	// Camp Staff Assignment
	assignStaff: async (data) => {
		const response = await api.post('/camp-staff', data)
		return response.data
	},

	removeStaff: async (campStaffId) => {
		const response = await api.delete(`/camp-staff/${campStaffId}`)
		return response.data
	},

	// Kiosk Token
	generateKioskToken: async (campId) => {
		const response = await api.post(`/camps/${campId}/kiosk-token`)
		return response.data
	},
}

export default orgAdminService
