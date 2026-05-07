import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, QrCode, RefreshCw, Copy, Calendar, MapPin, CheckCircle2, Loader, AlertCircle } from 'lucide-react'
import orgAdminService from '../services/org-admin-service'

const kioskBase = `${window.location.origin}/kiosk`

export default function GenerateKioskToken() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [camp, setCamp]         = useState(null)
  const [token, setToken]       = useState(null)
  const [copied, setCopied]     = useState(false)
  const [loading, setLoading]   = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError]       = useState(null)

  const loadCamp = useCallback(async () => {
    try {
      setLoading(true)
      const data = await orgAdminService.getCampDetail(id)
      setCamp(data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load camp.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadCamp() }, [loadCamp])

  const handleGenerate = async () => {
    try {
      setGenerating(true)
      setError(null)
      const data = await orgAdminService.generateKioskToken(id)
      setToken(data.token ?? data.plain_token ?? data)
      setCopied(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate token.')
    } finally {
      setGenerating(false)
    }
  }

  const kioskUrl = token ? `${kioskBase}?token=${token}` : ''

  const handleCopy = () => {
    if (!kioskUrl) return
    navigator.clipboard.writeText(kioskUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
      <Loader className="w-5 h-5 animate-spin" /> Loading…
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(`/org-dashboard/camps/${id}`)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-500" />
        </button>
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Kiosk Token</h1>
          <p className="text-xs text-gray-500">Generate access token for registration kiosk</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
          {/* Camp info */}
          <div className="text-center pb-4 border-b border-gray-100">
            <h2 className="font-poppins text-sm font-bold text-gray-900 mb-1">{camp?.name}</h2>
            <div className="flex items-center justify-center flex-wrap gap-3 text-[11px] text-gray-500 mt-1">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {camp?.camp_date && new Date(camp.camp_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3 h-3" />
                {camp?.location}
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          {token ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-5 bg-white border-2 border-gray-200 rounded-xl">
                  <QrCode className="w-36 h-36 text-gray-900" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <label className="block text-xs font-semibold text-gray-700">Kiosk URL</label>
                <div className="flex gap-2">
                  <input readOnly value={kioskUrl}
                    className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-mono min-w-0" />
                  <button onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0">
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <p className="text-[10px] text-gray-400">Share this URL with the kiosk device. Token expires at midnight on the camp date.</p>
              </div>

              <button onClick={handleGenerate} disabled={generating}
                className="w-full flex items-center justify-center gap-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-semibold py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50">
                {generating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                Regenerate Token
              </button>
            </div>
          ) : (
            <div className="text-center py-6 space-y-3">
              <QrCode className="w-14 h-14 text-gray-300 mx-auto" />
              <div>
                <h3 className="text-sm font-semibold text-gray-900">No Token Generated Yet</h3>
                <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                  Generate a kiosk token to allow the registration device to access this camp. Token expires at midnight on the camp date.
                </p>
              </div>
              <button onClick={handleGenerate} disabled={generating}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                {generating ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <QrCode className="w-3.5 h-3.5" />}
                {generating ? 'Generating…' : 'Generate Token'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
