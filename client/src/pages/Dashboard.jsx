import { useState, useEffect } from 'react'
import StatCard from '../components/StatCard'
import StudentTable from '../components/StudentTable'
import { Users, UserCheck, UserX, FileText } from 'lucide-react'
import { studentService } from '../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Calculate age from a DOB string in dd/mm/yyyy format
const calculateAge = (dob) => {
  if (!dob) return '-'
  const parts = dob.split('/')
  if (parts.length !== 3) return '-'
  const birthDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`)
  if (isNaN(birthDate)) return '-'
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return String(age)
}

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
    dob: r.dob,
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

  const handleDownloadPDF = async () => {
    try {
      const res = await studentService.getRegistrations();
      if (res.success) {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.text("LPC Badminton Registration Report", 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
        
        const tableColumn = ["Reg ID", "Name", "Age", "Class", "School", "Category", "Status"];
        const tableRows = [];

        res.data.forEach(student => {
          const studentData = [
            student.registrationId,
            student.name,
            student.dob ? `${calculateAge(student.dob)} yrs` : '-',
            `${student.class || '-'}${student.section ? `-${student.section}` : ''}`,
            student.school || '-',
            student.eventCategory || '-',
            student.status
          ];
          tableRows.push(studentData);
        });

        autoTable(doc, {
          head: [tableColumn],
          body: tableRows,
          startY: 40,
        });

        doc.save(`LPC_Registrations_${new Date().toISOString().split('T')[0]}.pdf`);
      }
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to download PDF report. Please try again.");
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Recent Registrations
            <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs rounded-full">LIVE</span>
          </h3>
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Download Report (PDF)
          </button>
        </div>
        
        <StudentTable students={students} onDelete={handleDeleteRegistration} />
      </section>
    </div>
  )
}

export default Dashboard
