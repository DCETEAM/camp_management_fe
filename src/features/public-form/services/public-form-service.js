import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// Public form service uses special token auth, not the regular JWT
const publicFormApi = axios.create({
	baseURL: API_URL,
})

// Add public form token to requests
publicFormApi.interceptors.request.use(
	(config) => {
		const publicFormToken = localStorage.getItem('public_form_token')
		if (publicFormToken) {
			config.headers.Authorization = `Bearer ${publicFormToken}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

const publicFormService = {
	// Get step template and camp details for the public form
	getStepTemplate: async () => {
		const response = await publicFormApi.get('/public-form/step-template')
		return response.data
	},

	// Submit the public form (creates participant + step response)
	submitForm: async (data) => {
		const response = await publicFormApi.post('/public-form/submit', data)
		return response.data
	},

	// Payment methods
	checkPaymentStatus: async (campId) => {
		const response = await publicFormApi.get(`/public-form/camps/${campId}/payment-status`)
		return response.data
	},

	createPaymentOrder: async (data) => {
		const response = await publicFormApi.post('/public-form/payments/create-order', data)
		return response.data
	},

	verifyPayment: async (data) => {
		const response = await publicFormApi.post('/public-form/payments/verify', data)
		return response.data
	},

	setPublicFormToken: (token) => {
		localStorage.setItem('public_form_token', token)
	},

	getPublicFormToken: () => {
		return localStorage.getItem('public_form_token')
	},

	clearPublicFormToken: () => {
		localStorage.removeItem('public_form_token')
	},
}

export default publicFormService
