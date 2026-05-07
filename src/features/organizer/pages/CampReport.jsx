import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Users, CheckCircle2, BarChart3, Download, PieChart, Loader, AlertCircle, RefreshCw
} from 'lucide-react'
import api from '../../../core/interceptors/axiosInterceptor'

export default function CampReport() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [report, setReport]     = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [exporting, setExporting] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`/camps/${id}/report`)
      setReport(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load report.')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    try {
      setExporting(true)
      const res = await api.get(`/camps/${id}/report/export`, { responseType: 'blob' })
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `camp_${id}_report.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Export failed.')
    } finally {
      setExporting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20 gap-2 text-xs text-gray-400">
      <Loader className="w-5 h-5 animate-spin" /> Loading report…
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center py-20 gap-3">
      <AlertCircle className="w-8 h-8 text-red-400" />
      <p className="text-sm text-red-600">{error}</p>
      <button onClick={load} className="flex items-center gap-1.5 text-xs text-primary-600 hover:underline">
        <RefreshCw className="w-3.5 h-3.5" /> Retry
      </button>
    </div>
  )

  const genderColors = {
    Male: { bg: 'bg-blue-100', text: 'text-blue-700', bar: 'bg-blue-500' },
    Female: { bg: 'bg-pink-100', text: 'text-pink-700', bar: 'bg-pink-500' },
    Other: { bg: 'bg-purple-100', text: 'text-purple-700', bar: 'bg-purple-500' },
  }

  const ageGroupColors = [
    { bar: 'bg-cyan-500' },
    { bar: 'bg-teal-500' },
    { bar: 'bg-amber-500' },
    { bar: 'bg-rose-500' },
  ]

  const totalParticipants = report?.total_participants || 0
  const completionRate = report?.completion_rate || 0
  const genderBreakdown = report?.gender_breakdown || {}
  const ageGroups = report?.age_groups || {}
  const stepOutcomes = report?.per_step_outcomes || []
  const maxGenderCount = Math.max(...Object.values(genderBreakdown).map(Number), 1)
  const ageGroupEntries = Object.entries(ageGroups)
  const maxAgeCount = Math.max(...Object.values(ageGroups).map(Number), 1)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <h1 className="font-poppins text-lg font-bold text-gray-900">Camp Report</h1>
            <p className="text-xs text-gray-500">Summary statistics and outcomes</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 px-4 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60"
        >
          {exporting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {exporting ? 'Exporting…' : 'Export to CSV'}
        </button>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-primary-100 text-xs font-medium">Total Participants</p>
          </div>
          <p className="text-2xl font-bold">{totalParticipants}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Completion Rate</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Gender & Age Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Gender Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-4 h-4 text-gray-500" />
            <h2 className="font-poppins text-sm font-bold text-gray-900">Gender Breakdown</h2>
          </div>
          {Object.keys(genderBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(genderBreakdown).map(([gender, count]) => {
                const colors = genderColors[gender] || genderColors.Other
                const pct = maxGenderCount > 0 ? (count / maxGenderCount) * 100 : 0
                return (
                  <div key={gender}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-800">{gender}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${colors.bg} ${colors.text}`}>
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${colors.bar} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-xs text-center py-3">No gender data available.</p>
          )}
        </div>

        {/* Age Groups */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h2 className="font-poppins text-sm font-bold text-gray-900">Age Groups</h2>
          </div>
          {ageGroupEntries.length > 0 ? (
            <div className="space-y-3">
              {ageGroupEntries.map(([group, count], index) => {
                const color = ageGroupColors[index % ageGroupColors.length]
                const pct = maxAgeCount > 0 ? (count / maxAgeCount) * 100 : 0
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-800">{group}</span>
                      <span className="text-[11px] font-bold text-gray-600">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`${color.bar} h-2 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-xs text-center py-3">No age data available.</p>
          )}
        </div>
      </div>

      {/* Per-Step Outcome Breakdown */}
      {Array.isArray(stepOutcomes) && stepOutcomes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gray-500" />
            <h2 className="font-poppins text-sm font-bold text-gray-900">Per-Step Outcome Breakdown</h2>
          </div>
          <div className="space-y-4">
            {stepOutcomes.map((step, index) => {
              const outcomes = step.outcomes || {}
              const outcomeEntries = Object.entries(outcomes)
              const maxVal = Math.max(...Object.values(outcomes).map(Number), 1)

              const outcomeColors = {
                Normal: 'bg-green-500',
                Treated: 'bg-green-500',
                Cataract: 'bg-amber-500',
                Glaucoma: 'bg-orange-500',
                Referred: 'bg-red-400',
                'No action': 'bg-gray-400',
                Incomplete: 'bg-red-300',
              }

              return (
                <div key={step.step_name || index} className="px-3 py-3 bg-gray-50 rounded-lg">
                  <h3 className="text-xs font-semibold text-gray-800 mb-3">{step.step_name}</h3>
                  {outcomeEntries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {outcomeEntries.map(([outcome, count]) => {
                        const barColor = outcomeColors[outcome] || 'bg-primary-500'
                        return (
                          <div key={outcome} className="bg-white rounded-md p-2.5 border border-gray-100">
                            <p className="text-[10px] text-gray-400 font-medium mb-0.5">{outcome}</p>
                            <p className="text-lg font-bold text-gray-900">{count}</p>
                            <div className="w-full bg-gray-100 rounded-full h-1 mt-1.5">
                              <div
                                className={`${barColor} h-1 rounded-full transition-all`}
                                style={{ width: `${(count / maxVal) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-xs">No outcomes recorded.</p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
