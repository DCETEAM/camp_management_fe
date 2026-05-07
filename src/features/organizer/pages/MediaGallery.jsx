import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Search, Filter, Image as ImageIcon, FileText, Download, Eye, X, Calendar, User, Tag, ListChecks, Loader, AlertCircle, RefreshCw } from 'lucide-react'
import organizerService from '../services/organizer-service'
import api from '../../../core/interceptors/axiosInterceptor'
import AuthImage from '../../../common/components/AuthImage'

const isImage = (mime) => mime?.startsWith('image/')

export default function MediaGallery() {
  const { id } = useParams()

  const [files, setFiles]           = useState([])
  const [steps, setSteps]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [search, setSearch]         = useState('')
  const [stepFilter, setStepFilter] = useState('')
  const [previewFile, setPreviewFile] = useState(null)
  const [meta, setMeta]             = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [mediaRes, campRes] = await Promise.all([
        api.get(`/camps/${id}/media`, {
          params: {
            step_template_id: stepFilter || undefined,
          }
        }),
        organizerService.getStepStats(id),
      ])
      const data = mediaRes.data
      setFiles(data.data ?? data)
      setMeta(data.meta ?? null)
      setSteps(Array.isArray(campRes) ? campRes : campRes.step_completion ?? [])
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load media')
    } finally {
      setLoading(false)
    }
  }, [id, stepFilter])

  useEffect(() => { load() }, [load])

  // Client-side search filter
  const filtered = search
    ? files.filter(f => {
        const q = search.toLowerCase()
        return (
          (f.file_name || '').toLowerCase().includes(q) ||
          (f.participant?.token_number || '').toLowerCase().includes(q) ||
          (f.participant?.name || '').toLowerCase().includes(q)
        )
      })
    : files

  const imageCount = filtered.filter(f => isImage(f.file_type)).length
  const docCount   = filtered.filter(f => !isImage(f.file_type)).length

  const handleDownload = (file) => {
    const token = localStorage.getItem('access_token')
    const url = `${import.meta.env.VITE_API_URL}/media/${file.id}/file`
    fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(r => r.blob())
      .then(blob => {
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = file.file_name || 'file'
        a.click()
        setTimeout(() => URL.revokeObjectURL(a.href), 1000)
      })
  }

  const fmtSize = (bytes) => {
    if (!bytes) return '—'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes/1024).toFixed(0)} KB`
    return `${(bytes/1048576).toFixed(1)} MB`
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-poppins text-lg font-bold text-gray-900">Media Gallery</h1>
          <p className="text-xs text-gray-500">All uploaded files for this camp</p>
        </div>
        <button onClick={load} disabled={loading} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-4 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-primary-100 text-xs font-medium">Total Files</p>
          </div>
          <p className="text-2xl font-bold">{meta?.total ?? filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Images</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{imageCount}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-gray-500 text-xs font-medium">Documents</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">{docCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search by filename, token or name…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select value={stepFilter} onChange={e => setStepFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white">
                <option value="">All Steps</option>
                {steps.map(s => (
                  <option key={s.step_template_id} value={s.step_template_id}>{s.step_name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16 gap-2 text-xs text-gray-400">
            <Loader className="w-5 h-5 animate-spin" /> Loading…
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <AlertCircle className="w-7 h-7 text-red-400" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <ImageIcon className="w-8 h-8 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-700">No files found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map(file => {
              const name    = file.file_name || 'file'
              const isImg   = isImage(file.file_type)
              return (
                <div key={file.id}
                  className="border border-gray-200 rounded-xl overflow-hidden hover:border-primary-300 hover:shadow-md transition-all group">
                  {/* Thumbnail */}
                  <div className="relative h-32 bg-gray-50 flex items-center justify-center overflow-hidden">
                    {isImg ? (
                      <AuthImage
                        src={`${import.meta.env.VITE_API_URL}/media/${file.id}/file`}
                        alt={name}
                        className="w-full h-full object-cover"
                        placeholderClass="w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
                        <FileText className="w-10 h-10 text-red-300" />
                      </div>
                    )}
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button onClick={() => setPreviewFile(file)}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50">
                        <Eye className="w-4 h-4 text-gray-700" />
                      </button>
                      <button onClick={() => handleDownload(file)}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50">
                        <Download className="w-4 h-4 text-gray-700" />
                      </button>
                    </div>
                    <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${isImg ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isImg ? 'IMG' : 'DOC'}
                    </span>
                  </div>
                  {/* Meta */}
                  <div className="p-2.5 space-y-1">
                    <p className="text-xs font-semibold text-gray-900 truncate" title={name}>{name}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Tag className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{file.participant?.token_number} · {file.participant?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <ListChecks className="w-3 h-3 flex-shrink-0" />
                      <span>{file.step_template?.step_name || '—'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{file.uploader?.name || '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {file.created_at ? new Date(file.created_at).toLocaleString('en-US',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}) : '—'}
                      </span>
                      <span>{fmtSize(file.size)}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="font-poppins text-sm font-bold text-gray-900 truncate max-w-xs">
                  {previewFile.file_name}
                </h2>
                <p className="text-[11px] text-gray-500">{fmtSize(previewFile.size)}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {/* Preview */}
              <div className="w-full rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center min-h-48">
                {isImage(previewFile.file_type) ? (
                  <AuthImage
                    src={`${import.meta.env.VITE_API_URL}/media/${previewFile.id}/file`}
                    alt={previewFile.file_name}
                    className="max-w-full max-h-72 object-contain"
                    placeholderClass="w-full h-48"
                  />
                ) : (
                  <div className="text-center py-10">
                    <FileText className="w-14 h-14 text-red-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Document — download to view</p>
                  </div>
                )}
              </div>
              {/* Details */}
              <div className="space-y-2">
                {[
                  { label: 'Participant', value: `${previewFile.participant?.token_number || ''} · ${previewFile.participant?.name || '—'}` },
                  { label: 'Step', value: previewFile.step_template?.step_name || '—' },
                  { label: 'Uploaded by', value: previewFile.uploader?.name || '—' },
                  { label: 'Date', value: previewFile.created_at ? new Date(previewFile.created_at).toLocaleString('en-US',{dateStyle:'medium',timeStyle:'short'}) : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                    <span className="text-[11px] text-gray-500">{label}</span>
                    <span className="text-xs font-medium text-gray-800 text-right max-w-[60%] truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => { handleDownload(previewFile); setPreviewFile(null) }}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2.5 rounded-xl">
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
