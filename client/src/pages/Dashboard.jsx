import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import StudentTable from '../components/StudentTable'
import { Users, UserCheck, UserX, FileText } from 'lucide-react'
import { studentService } from '../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalRegistrations: 0,
    verifiedCount: 0,
    notFoundCount: 0,
    uploadedPDFs: 0,
    recentRegistrations: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await studentService.getDashboardStats()
        if (res.success) {
          setStats(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const students = stats.recentRegistrations.map((r) => ({
    _id: r._id,
    registrationId: r.registrationId,
    name: r.name,
    class: r.class,
    section: r.section,
    school: r.school,
    eventCategory: r.eventCategory,
    status: r.status,
  }))

  const handleDeleteRegistration = async (id) => {
    if (!window.confirm('Are you sure you want to delete this player registration?')) return;
    try {
      const res = await studentService.deleteRegistration(id);
      if (res.success) {
        setStats(prev => ({
          ...prev,
          recentRegistrations: prev.recentRegistrations.filter(r => r._id !== id)
        }));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete registration');
    }
  };

  return (
    <div className="space-y-8 page-transition">
      <header>
        <h2 className="text-3xl font-bold text-slate-800">LPC Registration Dashboard</h2>
        <p className="text-slate-500 mt-1">Welcome back, Admin. Here's what's happening today.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Registrations" value={loading ? '...' : String(stats.totalRegistrations)} icon={Users} color="primary" />
        <StatCard label="Verified Students" value={loading ? '...' : String(stats.verifiedCount)} icon={UserCheck} color="green" />
        <StatCard label="Match Not Found" value={loading ? '...' : String(stats.notFoundCount)} icon={UserX} color="red" />
        <StatCard label="Uploaded PDFs" value={loading ? '...' : String(stats.uploadedPDFs)} icon={FileText} color="brand-shuttle" />
      </div>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Recent Registrations
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">LIVE</span>
          </h3>
        </div>
        
        <StudentTable students={students} onDelete={handleDeleteRegistration} />
      </section>
    </div>
  )
}

export default Dashboard
