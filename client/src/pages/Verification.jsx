import { useState, useEffect } from 'react'
import StudentTable from '../components/StudentTable'
import { CheckCircle2, XCircle, Search } from 'lucide-react'
import { studentService } from '../services/api'

const Verification = () => {
  const [filter, setFilter] = useState('ALL')
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await studentService.getVerificationStatus()
        if (res.success) {
          setStudents(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch verification data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeleteRegistration = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player registration?')) return;
    try {
      const res = await studentService.deleteRegistration(id);
      if (res.success) {
        setStudents(prev => prev.filter(s => s._id !== id));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete registration');
    }
  };

  const filteredStudents = students.filter(s => 
    filter === 'ALL' ? true : s.status === filter
  )

  return (
    <div className="space-y-8 page-transition">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Verification Status</h2>
          <p className="text-slate-500 mt-1">Review and manage student verification from PDF uploads.</p>
        </div>
        
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200">
          {[
            { id: 'ALL', label: 'All', icon: Search },
            { id: 'VERIFIED', label: 'Verified', icon: CheckCircle2 },
            { id: 'MATCH NOT FOUND', label: 'Flagged', icon: XCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all",
                filter === tab.id 
                  ? "bg-primary-600 text-white shadow-md shadow-primary-200" 
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="text-center py-12 text-slate-500">Loading verification data...</div>
      ) : (
        <StudentTable students={filteredStudents} onDelete={handleDeleteRegistration} />
      )}
    </div>
  )
}

const clsx = (...classes) => classes.filter(Boolean).join(' ')

export default Verification
