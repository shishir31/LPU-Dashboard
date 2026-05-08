import RegistrationForm from '../components/RegistrationForm'
import { Info } from 'lucide-react'

const Register = () => {
  return (
    <div className="space-y-8 page-transition max-w-4xl mx-auto">
      <header className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Student Registration</h2>
          <p className="text-slate-500 mt-1">Register players for the CISCE Zonal Badminton Tournament.</p>
        </div>
      </header>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-4 items-start">
        <div className="p-2 bg-blue-500 text-white rounded-lg">
          <Info className="w-5 h-5" />
        </div>
        <p className="text-sm text-blue-800 font-medium leading-relaxed">
          <strong>Note:</strong> Enter the Registration ID to automatically fetch all student details from the database. Only Student Name and School are required if the ID is not found.
        </p>
      </div>

      <RegistrationForm />
    </div>
  )
}

export default Register
