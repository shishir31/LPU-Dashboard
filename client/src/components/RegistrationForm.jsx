import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, User, Loader2, CheckCircle2, XCircle, Users, Calendar, Tag } from 'lucide-react'
import { studentService } from '../services/api'

const RegistrationForm = () => {
  const [registrationId, setRegistrationId] = useState('')
  const [fetchedData, setFetchedData] = useState(null)
  const [fetching, setFetching] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState(null)

  // Manual fields (only used when student not found in DB)
  const [manualName, setManualName] = useState('')
  const [manualDob, setManualDob] = useState('')

  // Auto-fetch student data when Registration ID is entered
  const handleFetch = async () => {
    if (!registrationId.trim()) return
    setFetching(true)
    setMessage(null)
    setFetchedData(null)
    try {
      const res = await studentService.getStudentByRegistrationId(registrationId)
      if (res.success && res.data) {
        setFetchedData(res.data)
        setMessage({ type: 'success', text: 'Student found! Details loaded from uploaded PDF data.' })
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Student not found. Please upload the PDF first.'
      setMessage({ type: 'error', text: msg })
      setFetchedData(null)
    } finally {
      setFetching(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFetch()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      const res = await studentService.registerPlayer({
        registrationId,
        name: fetchedData?.name || manualName,
        school: fetchedData?.school || '',
        dob: fetchedData?.dob || manualDob,
      })
      if (res.success) {
        setMessage({ type: 'success', text: res.message || 'Player registered successfully!' })
        setRegistrationId('')
        setFetchedData(null)
        setManualName('')
        setManualDob('')
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 rounded-3xl"
    >
      {message && (
        <div className={clsx(
          "mb-6 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium",
          message.type === 'success' ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"
        )}>
          {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Registration ID */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700">Registration ID</label>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Enter Registration ID (e.g. 26CISCE13528874)"
              className="input-field pl-12 pr-24 bg-primary-50/30 border-primary-200 text-lg"
              value={registrationId}
              onChange={(e) => setRegistrationId(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button 
              type="button"
              onClick={handleFetch}
              disabled={fetching || !registrationId.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1.5 transition-all"
            >
              {fetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              FETCH
            </button>
          </div>
          <p className="text-xs text-slate-400">Enter the Registration ID from the uploaded PDF and click FETCH</p>
        </div>

        {/* Auto-fetched student details card */}
        {fetchedData && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-6 rounded-2xl space-y-4"
          >
            <h4 className="font-bold text-green-800 text-sm uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Student Details from PDF
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Student Name */}
              <div className="bg-white/70 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Student Name</p>
                </div>
                <p className="font-bold text-slate-800 text-lg">{fetchedData.name}</p>
              </div>

              {/* Father's Name */}
              <div className="bg-white/70 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Father's Name</p>
                </div>
                <p className="font-bold text-slate-800 text-lg">{fetchedData.fatherName || '-'}</p>
              </div>

              {/* Category */}
              <div className="bg-white/70 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Tag className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Category</p>
                </div>
                <p className="font-bold text-slate-800 text-lg">{fetchedData.category || '-'}</p>
              </div>

              {/* DOB */}
              <div className="bg-white/70 p-4 rounded-xl border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Date of Birth</p>
                </div>
                <p className="font-bold text-slate-800 text-lg">{fetchedData.dob || '-'}</p>
              </div>
            </div>

            {/* Additional info row */}
            <div className="flex flex-wrap gap-3 pt-2">
              {fetchedData.class && (
                <span className="px-3 py-1.5 bg-white/80 border border-green-100 rounded-lg text-sm font-semibold text-slate-700">
                  Class {fetchedData.class}{fetchedData.section ? `-${fetchedData.section}` : ''}
                </span>
              )}
              {fetchedData.gender && (
                <span className="px-3 py-1.5 bg-white/80 border border-green-100 rounded-lg text-sm font-semibold text-slate-700">
                  {fetchedData.gender}
                </span>
              )}
              {fetchedData.eventCategory && (
                <span className="px-3 py-1.5 bg-primary-50 border border-primary-100 rounded-lg text-sm font-bold text-primary-700">
                  {fetchedData.eventCategory}
                </span>
              )}
              {fetchedData.school && (
                <span className="px-3 py-1.5 bg-white/80 border border-green-100 rounded-lg text-sm font-semibold text-slate-700">
                  {fetchedData.school}
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* Manual name input (only when student not found) */}
        {!fetchedData && registrationId && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Student Name (manual entry)</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  className="input-field pl-12"
                  placeholder="Enter student name manually"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Date of Birth (optional)</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input 
                  type="text" 
                  className="input-field pl-12"
                  placeholder="e.g. 12/05/2008"
                  value={manualDob}
                  onChange={(e) => setManualDob(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={submitting || !registrationId.trim() || (!fetchedData && !manualName.trim())}
          className="btn-primary w-full py-4 text-lg mt-4 flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Player'
          )}
        </button>
      </form>
    </motion.div>
  )
}

const clsx = (...classes) => classes.filter(Boolean).join(' ')

export default RegistrationForm
