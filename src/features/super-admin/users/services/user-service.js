import api from '../../../../core/interceptors/axiosInterceptor'

const userService = {
	getUsers: async (params = {}) => {
		const response = await api.get('/users', { params })
		return response.data
	},

	updateUser: async (id, data) => {
		const response = await api.put(`/users/${id}`, data)
		return response.data
	},

	inviteUser: async (data) => {
		const response = await api.post('/users/invite', data)
		return response.data
	},
}

export default userService
