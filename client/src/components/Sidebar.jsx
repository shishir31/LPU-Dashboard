import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  UserPlus, 
  UserCheck, 
  FileUp, 
  Trophy,
  LogOut
} from 'lucide-react'
import { clsx } from 'clsx'

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: UserPlus, label: 'Register Player', path: '/register' },
  { icon: UserCheck, label: 'Verification', path: '/verification' },
  { icon: FileUp, label: 'Upload Documents', path: '/upload' },
]

const Sidebar = () => {
  const location = useLocation()

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="w-12 h-12 flex items-center justify-center shrink-0">
          <img src="https://i.postimg.cc/156VRbDP/Whats-App-Image-2026-05-07-at-22-49-08.jpg" alt="LPC Logo" className="w-full h-full object-contain rounded-full" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/48?text=LPC"; }} />
        </div>
        <h1 className="font-bold text-slate-800 text-lg leading-tight">
          LPC <br />
          <span className="text-primary-600">Registration</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={clsx(
              'sidebar-link',
              location.pathname === item.path && 'active'
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <button className="flex items-center gap-3 w-full px-4 py-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
