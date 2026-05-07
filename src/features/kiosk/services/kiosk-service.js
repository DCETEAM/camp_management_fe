import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

// Kiosk service uses special kiosk token auth, not the regular JWT
const kioskApi = axios.create({
	baseURL: API_URL,
})

// Add kiosk token to requests
kioskApi.interceptors.request.use(
	(config) => {
		const kioskToken = localStorage.getItem('kiosk_token')
		if (kioskToken) {
			config.headers.Authorization = `Bearer ${kioskToken}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

const kioskService = {
	registerParticipant: async (data) => {
		const response = await kioskApi.post('/kiosk/participants', data)
		return response.data
	},

	setKioskToken: (token) => {
		localStorage.setItem('kiosk_token', token)
	},

	getKioskToken: () => {
		return localStorage.getItem('kiosk_token')
	},

	clearKioskToken: () => {
		localStorage.removeItem('kiosk_token')
	},
}

export default kioskService
