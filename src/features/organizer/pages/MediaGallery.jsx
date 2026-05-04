import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Search,
  Filter,
  Image as ImageIcon,
  FileText,
  Download,
  Eye,
  X,
  Calendar,
  User,
  Tag,
  ListChecks
} from 'lucide-react'

export default function MediaGallery() {
  const { id } = useParams()

  const [searchQuery, setSearchQuery] = useState('')
  const [stepFilter, setStepFilter] = useState('all')

  const steps = [
    { id: 1, name: 'Registration' },
    { id: 2, name: 'Doctor Checkup' },
    { id: 3, name: 'Lab Tests' },
    { id: 4, name: 'Pharmacy' },
  ]

  const [mediaFiles] = useState([
    {
      id: 1,
      filename: 'prescription_001.jpg',
      type: 'image',
      thumbnailUrl: null,
      stepName: 'Doctor Checkup',
      stepId: 2,
      participantToken: 'T-001',
      participantName: 'Ramesh Kumar',
      uploadedBy: 'Dr. Ravi Kumar',
      uploadedAt: '2025-01-20 09:45 AM',
      fileSize: '245 KB',
    },
    {
      id: 2,
      filename: 'lab_report_004.pdf',
      type: 'pdf',
      thumbnailUrl: null,
      stepName: 'Lab Tests',
      stepId: 3,
      participantToken: 'T-004',
      participantName: 'Priya Sharma',
      uploadedBy: 'Nurse Anitha',
      uploadedAt: '2025-01-20 10:12 AM',
      fileSize: '312 KB',
    },
    {
      id: 3,
      filename: 'eye_scan_007.jpg',
      type: 'image',
      thumbnailUrl: null,
      stepName: 'Doctor Checkup',
      stepId: 2,
      participantToken: 'T-007',
      participantName: 'Suresh Babu',
      uploadedBy: 'Dr. Ravi Kumar',
      uploadedAt: '2025-01-20 10:30 AM',
      fileSize: '189 KB',
    },
    {
      id: 4,
      filename: 'consent_form_009.pdf',
      type: 'pdf',
      thumbnailUrl: null,
      stepName: 'Registration',
      stepId: 1,
      participantToken: 'T-009',
      participantName: 'Lakshmi Devi',
      uploadedBy: 'David Brown',
      uploadedAt: '2025-01-20 09:50 AM',
      fileSize: '98 KB',
    },
    {
      id: 5,
      filename: 'retina_photo_012.jpg',
      type: 'image',
      thumbnailUrl: null,
      stepName: 'Doctor Checkup',
      stepId: 2,
      participantToken: 'T-012',
      participantName: 'Vijay Anand',
      uploadedBy: 'Dr. Ravi Kumar',
      uploadedAt: '2025-01-20 11:05 AM',
      fileSize: '410 KB',
    },
    {
      id: 6,
      filename: 'blood_report_001.pdf',
      type: 'pdf',
      thumbnailUrl: null,
      stepName: 'Lab Tests',
      stepId: 3,
      participantToken: 'T-001',
      participantName: 'Ramesh Kumar',
      uploadedBy: 'Nurse Anitha',
      uploadedAt: '2025-01-20 10:55 AM',
      fileSize: '156 KB',
    },
    {
      id: 7,
      filename: 'prescription_scan_004.jpg',
      type: 'image',
      thumbnailUrl: null,
      stepName: 'Pharmacy',
      stepId: 4,
      participantToken: 'T-004',
      participantName: 'Priya Sharma',
      uploadedBy: 'Pharmacist Raj',
      uploadedAt: '2025-01-20 11:20 AM',
      fileSize: '275 KB',
    },
    {
      id: 8,
      filename: 'id_proof_015.jpg',
      type: 'image',
      thumbnailUrl: null,
      stepName: 'Registration',
      stepId: 1,
      participantToken: 'T-015',
      participantName: 'Meena Kumari',
      uploadedBy: 'David Brown',
      uploadedAt: '2025-01-20 11:35 AM',
      fileSize: '132 KB',
    },
  ])

  const [previewFile, setPreviewFile] = useState(null)

  const filteredFiles = mediaFiles.filter(file => {
    const matchesSearch =
      file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.participantToken.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.participantName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStep = stepFilter === 'all' || file.stepId === parseInt(stepFilter)
    return matchesSearch && matchesStep
  })

  const imageCount = filteredFiles.filter(f => f.type === 'image').length
  const pdfCount = filteredFiles.filter(f => f.type === 'pdf').length

  const handleDownload = (file) => {
    alert(`Downloading ${file.filename}`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="font-poppins text-lg font-bold text-gray-900">Media Gallery</h1>
        <p className="text-xs text-gray-500">Browse all uploaded files for this camp</p>
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
          <p className="text-2xl font-bold">{filteredFiles.length}</p>
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
          <p className="text-2xl font-bold text-gray-900">{pdfCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-3 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by filename, token or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={stepFilter}
                onChange={(e) => setStepFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all bg-white"
              >
                <option value="all">All Steps</option>
                {steps.map(step => (
                  <option key={step.id} value={step.id}>{step.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* File Grid */}
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center">
            <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No files found</h3>
            <p className="text-xs text-gray-400">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredFiles.map((file) => (
              <div
                key={file.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-300 hover:shadow-md transition-all group"
              >
                {/* Thumbnail / Icon */}
                <div className="relative h-32 bg-gray-50 flex items-center justify-center">
                  {file.type === 'image' ? (
                    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-blue-300" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center">
                      <FileText className="w-10 h-10 text-red-300" />
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleDownload(file)}
                      className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-700" />
                    </button>
                  </div>

                  {/* File type badge */}
                  <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    file.type === 'image' ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {file.type === 'image' ? 'IMG' : 'PDF'}
                  </span>
                </div>

                {/* Metadata */}
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-gray-900 truncate" title={file.filename}>
                    {file.filename}
                  </p>
                  <div className="mt-1.5 space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Tag className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{file.participantToken} — {file.participantName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <ListChecks className="w-3 h-3 flex-shrink-0" />
                      <span>{file.stepName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <User className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{file.uploadedBy}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {file.uploadedAt}
                      </span>
                      <span>{file.fileSize}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="font-poppins text-sm font-bold text-gray-900">{previewFile.filename}</h2>
                <p className="text-[11px] text-gray-500">{previewFile.fileSize}</p>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-4">
              {/* Preview area */}
              <div className="w-full h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                {previewFile.type === 'image' ? (
                  <div className="text-center">
                    <ImageIcon className="w-16 h-16 text-blue-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Image preview placeholder</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-red-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">PDF preview placeholder</p>
                  </div>
                )}
              </div>

              {/* File details */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-[11px] text-gray-500">Participant</span>
                  <span className="text-xs font-medium text-gray-800">{previewFile.participantToken} — {previewFile.participantName}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-[11px] text-gray-500">Step</span>
                  <span className="text-xs font-medium text-gray-800">{previewFile.stepName}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-[11px] text-gray-500">Uploaded by</span>
                  <span className="text-xs font-medium text-gray-800">{previewFile.uploadedBy}</span>
                </div>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                  <span className="text-[11px] text-gray-500">Uploaded at</span>
                  <span className="text-xs font-medium text-gray-800">{previewFile.uploadedAt}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={() => { handleDownload(previewFile); setPreviewFile(null) }}
                className="w-full flex items-center justify-center gap-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-xs font-semibold py-2 rounded-lg transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Download File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
