import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Tent, User, CheckCircle2, Loader, CreditCard, IndianRupee } from 'lucide-react'
import kioskService from '../services/kiosk-service'
import PaymentModal from '../../../common/components/PaymentModal'
import { validate as validateUtil } from '../../../common/utils/validation'

export default function KioskRegistration() {
  const [searchParams] = useSearchParams()
  const [submitted, setSubmitted] = useState(false)
  const [tokenNumber, setTokenNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: ''
  })
  
  // Payment related states
  const [camp, setCamp] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentData, setPaymentData] = useState(null)
  const [registrationComplete, setRegistrationComplete] = useState(false)

  // Get kiosk token from URL - ALWAYS use URL token if present
  const urlToken = searchParams.get('token')
  if (urlToken) {
    kioskService.setKioskToken(urlToken)
    console.log('Kiosk token set from URL:', urlToken)
  }
  
  // Load camp details on mount to check if payment is required
  useEffect(() => {
    const loadCamp = async () => {
      try {
        const token = kioskService.getKioskToken()
        console.log('Current kiosk token:', token)
        if (!token) {
          setError('No kiosk token found. Please use a valid kiosk link.')
          return
        }
        const campData = await kioskService.getCamp()
        console.log('Camp loaded:', campData)
        setCamp(campData)
      } catch (err) {
        console.error('Failed to load camp:', err)
        setError('Invalid or expired kiosk link: ' + (err.response?.data?.message || err.message))
      }
    }
    loadCamp()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate
    const nameErr = validateUtil.name(formData.name)
    const phoneErr = validateUtil.phone(formData.phone)
    
    if (nameErr || phoneErr) {
      setError(nameErr || phoneErr)
      return
    }
    
    // Check if payment is required
    if (camp?.payment_enabled && camp?.registration_fee > 0) {
      setShowPaymentModal(true)
      return
    }
    
    // No payment required, proceed with registration
    await completeRegistration()
  }
  
  const completeRegistration = async (paymentResult = null) => {
    try {
      setLoading(true)
      
      // If payment was made, the participant was already created during payment verification
      if (paymentResult?.participant) {
        setTokenNumber(paymentResult.participant.token_number)
        setSubmitted(true)
        setRegistrationComplete(true)
        setShowPaymentModal(false)
        
        // Reset after 5 seconds
        setTimeout(() => {
          setSubmitted(false)
          setRegistrationComplete(false)
          setTokenNumber('')
          setFormData({ name: '', age: '', gender: 'Male', phone: '' })
        }, 5000)
        return
      }
      
      // No payment required - create participant directly
      const response = await kioskService.registerParticipant({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone || undefined
      })
      setTokenNumber(response.token_number)
      setSubmitted(true)
      setRegistrationComplete(true)
      setError(null)
      
      // Reset after 5 seconds
      setTimeout(() => {
        setSubmitted(false)
        setRegistrationComplete(false)
        setTokenNumber('')
        setFormData({ name: '', age: '', gender: 'Male', phone: '' })
      }, 5000)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePaymentSuccess = (result) => {
    completeRegistration(result)
  }
  
  const handlePaymentError = (error) => {
    setError(error?.response?.data?.message || 'Payment failed. Please try again.')
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="font-poppins text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
          <p className="text-gray-600 mb-6">Please note down your token number</p>
          
          <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-500 mb-1">Your Token Number</p>
            <p className="text-5xl font-bold text-primary-700 tracking-wider">{tokenNumber}</p>
          </div>
          
          <p className="text-xs text-gray-400">Form will reset in a few seconds...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Tent className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-poppins text-xl font-bold text-white">Camp Registration</h1>
          <p className="text-primary-100 text-sm">Enter your details to register</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Full Name - Full Width */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              <span className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name <span className="text-red-500">*</span>
              </span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              placeholder="Enter your full name"
            />
          </div>

          {/* Age | Gender | Phone - 3 Column Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Age <span className="text-red-500">*</span></label>
              <input
                type="number"
                required
                min="0"
                max="130"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Age"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Gender <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Phone <span className="text-red-500">*</span></label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
                placeholder="Mobile number"
              />
            </div>
          </div>

          {/* Payment Info Display */}
          {camp?.payment_enabled && camp?.registration_fee > 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">Registration Fee</span>
              </div>
              <div className="flex items-center gap-1 font-semibold text-blue-900">
                <IndianRupee className="w-4 h-4" />
                {camp.registration_fee.toFixed(2)}
              </div>
            </div>
          ) : camp && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
              <span className="text-xs text-gray-500">Free Registration (No payment required)</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3.5 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-400 disabled:shadow-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {camp?.payment_enabled && camp?.registration_fee > 0 ? 'Processing...' : 'Registering...'}
              </>
            ) : (
              <>
                {camp?.payment_enabled && camp?.registration_fee > 0 ? (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay & Register
                  </>
                ) : (
                  'Register'
                )}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        paymentData={paymentData}
        onCreateOrder={kioskService.createPaymentOrder}
        onVerifyPayment={kioskService.verifyPayment}
        participantData={formData}
        campId={camp?.id}
      />
    </div>
  )
}
