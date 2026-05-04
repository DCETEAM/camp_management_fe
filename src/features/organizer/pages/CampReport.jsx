import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  CheckCircle2,
  BarChart3,
  Download,
  PieChart,
} from 'lucide-react'

export default function CampReport() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [report] = useState({
    total_participants: 210,
    completion_rate: 69,
    gender_breakdown: { Male: 118, Female: 85, Other: 7 },
    age_groups: { '0-18': 18, '19-40': 62, '41-60': 88, '60+': 42 },
    step_outcomes: [
      {
        step_name: 'Vision Test',
        outcomes: { Normal: 120, 'Mild Issue': 45, Referred: 15 },
      },
      {
        step_name: 'Doctor Checkup',
        outcomes: { Normal: 95, Cataract: 38, Glaucoma: 12, Referred: 10 },
      },
      {
        step_name: 'Pharmacy',
        outcomes: { Treated: 130, 'No action': 15 },
      },
    ],
  })

  const handleExport = () => {
    alert('CSV export will be available when the backend is connected.')
  }

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (error && !report) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/camp-dashboard/${id}`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">Camp Report</h1>
        </div>
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={fetchReport} className="text-red-600 underline text-sm mt-1">Try again</button>
          </div>
        </div>
      </div>
    )
  }

  const totalParticipants = report?.total_participants || 0
  const completionRate = report?.completion_rate || 0
  const genderBreakdown = report?.gender_breakdown || {}
  const ageGroups = report?.age_groups || {}
  const stepOutcomes = report?.step_outcomes || []
  const maxGenderCount = Math.max(...Object.values(genderBreakdown).map(Number), 1)
  const ageGroupEntries = Object.entries(ageGroups)
  const maxAgeCount = Math.max(...Object.values(ageGroups).map(Number), 1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/camp-dashboard/${id}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="font-poppins text-2xl lg:text-3xl font-bold text-gray-900">Camp Report</h1>
            <p className="text-gray-500 mt-1">Summary statistics and outcomes</p>
          </div>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-2.5 px-5 rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {exporting ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              Export to CSV
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <p className="text-primary-100 text-sm font-medium mb-1">Total Participants</p>
          <p className="text-4xl font-bold">{totalParticipants}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Completion Rate</p>
          <div className="flex items-end gap-2">
            <p className="text-4xl font-bold text-gray-900">{completionRate}%</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
            <div
              className="bg-gradient-to-r from-green-400 to-green-600 h-2.5 rounded-full transition-all"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Gender & Age Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Breakdown */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <PieChart className="w-5 h-5 text-gray-600" />
            <h2 className="font-poppins text-xl font-bold text-gray-900">Gender Breakdown</h2>
          </div>
          {Object.keys(genderBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(genderBreakdown).map(([gender, count]) => {
                const colors = genderColors[gender] || genderColors.Other
                const pct = maxGenderCount > 0 ? (count / maxGenderCount) * 100 : 0
                return (
                  <div key={gender}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{gender}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.bg} ${colors.text}`}>
                        {count}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`${colors.bar} h-3 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No gender data available.</p>
          )}
        </div>

        {/* Age Groups */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="font-poppins text-xl font-bold text-gray-900">Age Groups</h2>
          </div>
          {ageGroupEntries.length > 0 ? (
            <div className="space-y-4">
              {ageGroupEntries.map(([group, count], index) => {
                const color = ageGroupColors[index % ageGroupColors.length]
                const pct = maxAgeCount > 0 ? (count / maxAgeCount) * 100 : 0
                return (
                  <div key={group}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">{group}</span>
                      <span className="text-sm font-bold text-gray-700">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3">
                      <div
                        className={`${color.bar} h-3 rounded-full transition-all`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-4">No age data available.</p>
          )}
        </div>
      </div>

      {/* Per-Step Outcome Breakdown */}
      {Array.isArray(stepOutcomes) && stepOutcomes.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="w-5 h-5 text-gray-600" />
            <h2 className="font-poppins text-xl font-bold text-gray-900">Per-Step Outcome Breakdown</h2>
          </div>
          <div className="space-y-6">
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
                <div key={step.step_name || index} className="p-4 bg-gray-50 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-4">{step.step_name}</h3>
                  {outcomeEntries.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {outcomeEntries.map(([outcome, count]) => {
                        const barColor = outcomeColors[outcome] || 'bg-primary-500'
                        return (
                          <div key={outcome} className="bg-white rounded-lg p-3 border border-gray-100">
                            <p className="text-xs text-gray-500 font-medium mb-1">{outcome}</p>
                            <p className="text-2xl font-bold text-gray-900">{count}</p>
                            <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2">
                              <div
                                className={`${barColor} h-1.5 rounded-full transition-all`}
                                style={{ width: `${(count / maxVal) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No outcomes recorded.</p>
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
