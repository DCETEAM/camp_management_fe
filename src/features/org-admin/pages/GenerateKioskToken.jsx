import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  QrCode, 
  RefreshCw, 
  Copy,
  Calendar,
  CheckCircle2
} from 'lucide-react'

export default function GenerateKioskToken() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [token, setToken] = useState(null)
  const [copied, setCopied] = useState(false)

  const [camp] = useState({
    id: id,
    name: 'Chennai Dental Camp',
    date: '2025-01-20',
    location: 'Chennai Dental College'
  })

  const handleGenerateToken = () => {
    setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjYW1wX2lkIjoyLCJleHAiOjE3Mzc0MTQ0MDB9.example-token')
    setCopied(false)
  }

  const handleCopy = () => {
    if (token) {
      navigator.clipboard.writeText(`http://localhost:5173/kiosk?token=${token}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/org-dashboard/camps/${id}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">
            Kiosk Token
          </h1>
          <p className="text-gray-600 mt-1">Generate access token for registration kiosk</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <h2 className="font-poppins text-xl font-bold text-gray-900 mb-2">
              {camp.name}
            </h2>
            <div className="flex items-center justify-center gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {token ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <div className="p-6 bg-white border-2 border-gray-200 rounded-2xl">
                  <QrCode className="w-48 h-48 text-gray-900" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Kiosk URL
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    readOnly
                    value={`http://localhost:5173/kiosk?token=${token}`}
                    className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleGenerateToken}
                  className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <QrCode className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Token Generated Yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Generate a kiosk token to allow the registration device to access this camp.
                The token expires at midnight on the camp day.
              </p>
              <button
                onClick={handleGenerateToken}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <QrCode className="w-5 h-5" />
                Generate Token
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
