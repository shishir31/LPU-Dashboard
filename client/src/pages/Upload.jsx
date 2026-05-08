import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, FileText, CheckCircle2, XCircle, Loader2, Users, AlertCircle, Trash2 } from 'lucide-react'
import { studentService } from '../services/api'

const Upload = () => {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [uploadHistory, setUploadHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  useEffect(() => {
    fetchUploadHistory()
  }, [])

  const fetchUploadHistory = async () => {
    try {
      const res = await studentService.getUploads()
      if (res.success) {
        setUploadHistory(res.data)
      }
    } catch (err) {
      console.error('Failed to fetch upload history', err)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleDeleteUpload = async (id) => {
    if (!window.confirm('Are you sure you want to delete this PDF and its extracted students?')) return;
    
    try {
      const res = await studentService.deleteUpload(id);
      if (res.success) {
        // Refresh history
        fetchUploadHistory();
        // If the current result matches the deleted upload, clear it
        if (result && result.uploadId === id) {
          setResult(null);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete upload');
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const fileType = e.dataTransfer.files?.[0]?.type
    if (
      fileType === 'application/pdf' ||
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel' ||
      e.dataTransfer.files?.[0]?.name?.endsWith('.xlsx') ||
      e.dataTransfer.files?.[0]?.name?.endsWith('.xls')
    ) {
      setFile(e.dataTransfer.files[0])
      setResult(null)
      setError(null)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setResult(null)

    const formData = new FormData()
    formData.append('pdf', file)

    try {
      const res = await studentService.uploadPDF(formData)
      if (res.success) {
        setResult(res.data)
        setFile(null)
        fetchUploadHistory() // refresh history
      }
    } catch (err) {
      console.error('Upload error full:', err)
      const msg = err.response?.data?.message 
        || err.message 
        || 'Upload failed. Please try again.'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-8 page-transition max-w-5xl mx-auto">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">Upload Documents</h2>
        <p className="text-slate-500 mt-1">
          Upload a PDF containing student data. The system will extract all Registration IDs and save students to the database for lookup.
        </p>
      </header>

      {/* Upload Area */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 rounded-3xl"
      >
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}
          `}
          onClick={() => document.getElementById('pdf-input').click()}
        >
          <input
            id="pdf-input"
            type="file"
            accept=".pdf,.xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-2xl ${dragActive ? 'bg-primary-100' : 'bg-slate-100'} transition-colors`}>
              <UploadIcon className={`w-10 h-10 ${dragActive ? 'text-primary-600' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-700">
                {file ? file.name : 'Drop your PDF or Excel file here or click to browse'}
              </p>
              <p className="text-sm text-slate-400 mt-1">
                {file ? `${(file.size / 1024).toFixed(1)} KB — Ready to upload` : 'Supports PDF and Excel (.xlsx, .xls) files'}
              </p>
            </div>
          </div>
        </div>

        {file && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 flex items-center gap-4"
          >
            <div className="flex-1 flex items-center gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-bold text-blue-800 text-sm">{file.name}</p>
                <p className="text-xs text-blue-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <button
              onClick={handleUpload}
              disabled={uploading}
              className="btn-primary px-8 py-4 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadIcon className="w-5 h-5" />
                  Upload & Extract
                </>
              )}
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-100 p-5 rounded-2xl flex items-start gap-3"
        >
          <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800">Upload Failed</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-2xl text-center">
                <Users className="w-7 h-7 text-primary-600 mx-auto mb-2" />
                <p className="text-3xl font-black text-slate-800">{result.extractedCount}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">Extracted</p>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <FileText className="w-7 h-7 text-blue-600 mx-auto mb-2" />
                <p className="text-3xl font-black text-slate-800">{result.savedCount}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">Saved to DB</p>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <CheckCircle2 className="w-7 h-7 text-green-600 mx-auto mb-2" />
                <p className="text-3xl font-black text-green-700">{result.verifiedCount}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">Verified</p>
              </div>
              <div className="glass-card p-5 rounded-2xl text-center">
                <XCircle className="w-7 h-7 text-red-500 mx-auto mb-2" />
                <p className="text-3xl font-black text-red-600">{result.notFoundCount}</p>
                <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mt-1">Not Found</p>
              </div>
            </div>

            {/* Extracted Students Table */}
            {result.students && result.students.length > 0 && (
              <div className="glass-card rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary-600" />
                    Students Extracted from PDF
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full ml-2">
                      {result.students.length} found
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 mt-1">
                    These students have been saved to the database. You can now look them up by Registration ID on the Register page.
                  </p>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">#</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Reg. ID</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Father's Name</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">DOB</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Event</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.students.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-3 text-sm text-slate-400">{idx + 1}</td>
                        <td className="px-6 py-3">
                          <span className="font-mono font-bold text-primary-600">{s.registrationId}</span>
                        </td>
                        <td className="px-6 py-3 font-semibold text-slate-800">{s.name}</td>
                        <td className="px-6 py-3 text-slate-600">{s.fatherName || '-'}</td>
                        <td className="px-6 py-3">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold">
                            {s.category || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-slate-600 font-mono text-sm">{s.dob || '-'}</td>
                        <td className="px-6 py-3">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold">
                            {s.eventCategory || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.students && result.students.length === 0 && (
              <div className="glass-card p-8 rounded-2xl text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <p className="font-bold text-slate-700 text-lg">No Students Found in PDF</p>
                <p className="text-slate-500 mt-2 max-w-md mx-auto">
                  The PDF was uploaded but no Registration IDs were detected. Make sure the PDF has text-selectable content with Registration IDs (e.g. REG2024001).
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload History Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 md:p-8 rounded-3xl mt-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Previous Uploads
          </h3>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
            {uploadHistory.length} files
          </span>
        </div>

        {loadingHistory ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 text-primary-400 animate-spin" />
          </div>
        ) : uploadHistory.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
            <p className="text-slate-500 font-medium">No previous uploads found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Filename</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Extracted</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {uploadHistory.map((historyItem) => (
                  <tr key={historyItem._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="font-semibold text-slate-800">{historyItem.filename}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                        historyItem.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        historyItem.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {historyItem.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                      {historyItem.extractedStudents?.length || 0} students
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(historyItem.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteUpload(historyItem._id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Upload & Students"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Upload
