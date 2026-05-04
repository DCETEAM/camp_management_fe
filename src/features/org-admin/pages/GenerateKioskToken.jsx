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
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(`/org-dashboard/camps/${id}`)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Kiosk Token</h1>
          <p className="text-xs text-gray-500">Generate access token for registration kiosk</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="text-center mb-6">
            <h2 className="font-poppins text-sm font-bold text-gray-900 mb-1">
              {camp.name}
            </h2>
            <div className="flex items-center justify-center gap-3 text-[11px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {new Date(camp.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>
          </div>

          {token ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                  <QrCode className="w-36 h-36 text-gray-900" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Kiosk URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`http://localhost:5173/kiosk?token=${token}`}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-mono"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleGenerateToken}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="w-14 h-14 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">No Token Generated Yet</h3>
              <p className="text-xs text-gray-400 mb-4 max-w-md mx-auto">
                Generate a kiosk token to allow the registration device to access this camp.
                The token expires at midnight on the camp day.
              </p>
              <button
                onClick={handleGenerateToken}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg"
              >
                <QrCode className="w-3.5 h-3.5" />
                Generate Token
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
