import api from '../../../core/interceptors/axiosInterceptor'

const authService = {
	login: async (email, password) => {
		const response = await api.post('/auth/login', {
			email,
			password,
		})
		return response.data
	},

	getCurrentUser: async () => {
		const token = localStorage.getItem('access_token')
		if (!token) return null

		try {
			const response = await api.get('/auth/me')
			return response.data
		} catch (error) {
			localStorage.removeItem('access_token')
			localStorage.removeItem('user')
			return null
		}
	},

	forgotPassword: async (email) => {
		const response = await api.post('/auth/forgot-password', {
			email,
		})
		return response.data
	},

	resetPassword: async (token, password) => {
		const response = await api.post('/auth/reset-password', {
			token,
			password,
		})
		return response.data
	},

	logout: () => {
		localStorage.removeItem('access_token')
		localStorage.removeItem('user')
	},

	getToken: () => {
		return localStorage.getItem('access_token')
	},

	setToken: (token) => {
		localStorage.setItem('access_token', token)
	},
}

export default authService
