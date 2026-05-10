import api from '../core/interceptors/axiosInterceptor'

const paymentService = {
  // Check if camp requires payment
  checkCampPayment: async (campId) => {
    const response = await api.get(`/camps/${campId}/payment-status`)
    return response.data
  },

  // Create payment order
  createOrder: async (data) => {
    const response = await api.post('/payments/create-order', data)
    return response.data
  },

  // Verify payment
  verifyPayment: async (data) => {
    const response = await api.post('/payments/verify', data)
    return response.data
  },

  // Get payment details
  getPayment: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`)
    return response.data
  },

  // Get camp payments summary
  getCampPayments: async (campId) => {
    const response = await api.get(`/camps/${campId}/payments`)
    return response.data
  },
}

export default paymentService
