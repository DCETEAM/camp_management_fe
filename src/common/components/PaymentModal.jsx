import { useState, useEffect, useRef } from 'react'
import { X, Loader, CreditCard, CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react'

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve(window.Razorpay)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(window.Razorpay)
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}

export default function PaymentModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  onError,
  paymentData,
  onCreateOrder,
  onVerifyPayment,
  participantData,
  campId
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [orderData, setOrderData] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState('initial') // initial, creating, ready, processing, success, failed
  const razorpayInstanceRef = useRef(null)

  useEffect(() => {
    if (isOpen && paymentData?.payment_required) {
      setOrderData(paymentData)
      setPaymentStatus('ready')
    } else if (isOpen && !paymentData) {
      createOrder()
    }
  }, [isOpen, paymentData])

  useEffect(() => {
    return () => {
      if (razorpayInstanceRef.current) {
        razorpayInstanceRef.current.close()
      }
    }
  }, [])

  const createOrder = async () => {
    try {
      setLoading(true)
      setError(null)
      setPaymentStatus('creating')

      const data = await onCreateOrder({
        camp_id: campId,
        participant_data: participantData
      })

      if (!data.payment_required) {
        // No payment required, proceed directly
        onSuccess({ payment_required: false })
        return
      }

      setOrderData(data)
      setPaymentStatus('ready')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment order')
      setPaymentStatus('failed')
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    try {
      setLoading(true)
      setError(null)
      setPaymentStatus('processing')

      // Load Razorpay script
      const Razorpay = await loadRazorpayScript()

      const options = {
        key: orderData.key_id,
        amount: orderData.amount * 100, // Amount in paise
        currency: orderData.currency,
        name: orderData.camp_name || 'Camp Registration',
        description: orderData.description || 'Registration Fee',
        order_id: orderData.order_id,
        prefill: {
          name: orderData.prefill?.name || participantData?.name || '',
          contact: orderData.prefill?.contact || participantData?.phone || '',
        },
        theme: {
          color: '#3B82F6', // Primary blue color
        },
        handler: async function (response) {
          try {
            // Verify payment on backend
            const verifyData = await onVerifyPayment({
              payment_id: orderData.payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              camp_id: campId,
              participant_data: participantData
            })

            setPaymentStatus('success')
            onSuccess(verifyData)
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed')
            setPaymentStatus('failed')
            onError?.(err)
          } finally {
            setLoading(false)
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
            setPaymentStatus('ready')
          }
        }
      }

      razorpayInstanceRef.current = new Razorpay(options)
      razorpayInstanceRef.current.open()

    } catch (err) {
      setError(err.message || 'Failed to initialize payment')
      setPaymentStatus('failed')
      setLoading(false)
      onError?.(err)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary-600" />
            <h2 className="font-poppins text-sm font-bold text-gray-900">Payment Required</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-5 flex-1 overflow-y-auto">
          {paymentStatus === 'initial' || paymentStatus === 'creating' ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="w-8 h-8 text-primary-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Creating payment order...</p>
            </div>
          ) : paymentStatus === 'ready' ? (
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IndianRupee className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  ₹{orderData?.amount?.toFixed(2)}
                </h3>
                <p className="text-sm text-gray-500">{orderData?.description || 'Registration Fee'}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Camp</span>
                  <span className="font-medium text-gray-900">{orderData?.camp_name || '-'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Participant</span>
                  <span className="font-medium text-gray-900">{participantData?.name || '-'}</span>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
            </div>
          ) : paymentStatus === 'processing' ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader className="w-8 h-8 text-primary-600 animate-spin mb-3" />
              <p className="text-sm text-gray-600">Processing payment...</p>
              <p className="text-xs text-gray-400 mt-1">Please complete the payment in the popup</p>
            </div>
          ) : paymentStatus === 'success' ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Successful!</h3>
              <p className="text-sm text-gray-500">Your registration is complete.</p>
            </div>
          ) : paymentStatus === 'failed' ? (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Payment Failed</h3>
                {error && <p className="text-sm text-red-600">{error}</p>}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-gray-100 px-4 py-3.5">
          {paymentStatus === 'ready' && (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all disabled:opacity-60"
              >
                {loading ? (
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CreditCard className="w-3.5 h-3.5" />
                )}
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          )}

          {paymentStatus === 'failed' && (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-3 py-2 text-xs border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createOrder}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          {paymentStatus === 'success' && (
            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs font-semibold py-2 rounded-lg transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
