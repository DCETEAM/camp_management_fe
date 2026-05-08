import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Link, RefreshCw, Copy, Calendar, MapPin, CheckCircle2, Loader, AlertCircle, FileText, ExternalLink, Trash2, QrCode } from 'lucide-react'
import orgAdminService from '../services/org-admin-service'
import stepTemplateService from '../../super-admin/step-templates/services/step-template-service'

const publicFormBase = `${window.location.origin}/public-form`

export default function GeneratePublicFormLink() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [camp, setCamp] = useState(null)
  const [stepTemplates, setStepTemplates] = useState([])
  const [selectedStep, setSelectedStep] = useState(null)
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [copiedId, setCopiedId] = useState(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const [campData, tokensData] = await Promise.all([
        orgAdminService.getCampDetail(id),
        orgAdminService.getPublicFormTokens(id),
      ])
      setCamp(campData)
      setTokens(tokensData)

      // Load step templates for this camp's event type
      if (campData.event_type_id) {
        const steps = await stepTemplateService.getStepTemplates(campData.event_type_id)
        setStepTemplates(steps)
        // Select step 1 by default
        const step1 = steps.find(s => s.step_order === 1)
        if (step1) setSelectedStep(step1.id)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load data.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { loadData() }, [loadData])

  const handleGenerate = async () => {
    if (!selectedStep) {
      setError('Please select a step.')
      return
    }

    try {
      setGenerating(true)
      setError(null)
      const data = await orgAdminService.generatePublicFormToken(id, selectedStep)
      await loadData() // Refresh tokens list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate link.')
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async (tokenId) => {
    if (!confirm('Are you sure you want to revoke this link? Users will no longer be able to access the form.')) return

    try {
      await orgAdminService.revokePublicFormToken(id, tokenId)
      await loadData()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to revoke link.')
    }
  }

  const handleCopy = (token) => {
    const url = `${publicFormBase}?token=${token}`
    navigator.clipboard.writeText(url)
    setCopiedId(token)
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleOpen = (token) => {
    const url = `${publicFormBase}?token=${token}`
    window.open(url, '_blank')
  }

  const step1 = stepTemplates.find(s => s.step_order === 1)
  const hasStep1Token = tokens.some(t => t.step_template_id === step1?.id)

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
          <h1 className="font-poppins text-lg font-bold text-gray-900">Public Form Link</h1>
          <p className="text-xs text-gray-500">Share step 1 form with participants</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto space-y-4">
        {/* Camp Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
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
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2 mt-4">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
            </div>
          )}

          {/* Step Selection */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Select Step</label>
            {stepTemplates.length === 0 ? (
              <p className="text-xs text-gray-400">No steps configured for this event type.</p>
            ) : (
              <div className="space-y-2">
                {stepTemplates
                  .filter(s => s.step_order === 1) // Only allow step 1 for now
                  .map(step => (
                    <div
                      key={step.id}
                      onClick={() => setSelectedStep(step.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedStep === step.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        selectedStep === step.id ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-500'
                      }`}>
                        <span className="text-xs font-bold">{step.step_order}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${selectedStep === step.id ? 'text-primary-700' : 'text-gray-800'}`}>
                          {step.step_name}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {step.form_fields?.length || 0} fields configured
                        </p>
                      </div>
                      {selectedStep === step.id && (
                        <CheckCircle2 className="w-5 h-5 text-primary-500" />
                      )}
                    </div>
                  ))}
              </div>
            )}
            <p className="text-[11px] text-gray-400 mt-2">
              * Only Step 1 can be shared as a public form link.
            </p>
          </div>

          {/* Generate Button */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <button
              onClick={handleGenerate}
              disabled={generating || !selectedStep || stepTemplates.length === 0}
              className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-semibold py-3 rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Generating…
                </>
              ) : hasStep1Token ? (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Regenerate Link
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  Generate Public Form Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Active Tokens */}
        {tokens.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-poppins text-sm font-bold text-gray-900 mb-4">Active Form Links</h3>
            <div className="space-y-3">
              {tokens.map((token) => {
                const isExpired = new Date(token.expires_at) < new Date()
                const formUrl = `${publicFormBase}?token=${token.token}`

                return (
                  <div
                    key={token.id}
                    className={`p-4 rounded-lg border ${isExpired ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-gray-50/50'}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-800">
                            {token.step_template?.step_name || 'Step Form'}
                          </span>
                          {isExpired && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                              Expired
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          Expires: {new Date(token.expires_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRevoke(token.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Revoke link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {!isExpired && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <label className="block text-[11px] font-medium text-gray-500 mb-1.5">Public Form URL</label>
                        <div className="flex gap-2">
                          <input
                            readOnly
                            value={formUrl}
                            className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[11px] font-mono min-w-0"
                          />
                          <button
                            onClick={() => handleCopy(token.token)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white text-xs font-semibold rounded-lg transition-colors flex-shrink-0"
                          >
                            {copiedId === token.token ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleOpen(token.token)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                            title="Open form"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <QrCode className="w-4 h-4" />
            How to use the public form link
          </h4>
          <ul className="text-xs text-blue-700 space-y-1.5 list-disc list-inside">
            <li>Generate a link for Step 1 of your event</li>
            <li>Share the link via QR code, WhatsApp, email, or any messaging platform</li>
            <li>Users can fill the form from their own devices without logging in</li>
            <li>Submitted data will appear in your camp dashboard immediately</li>
            <li>The link expires at midnight on the camp date</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
