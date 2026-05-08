import { useState } from 'react'
import Sidebar from './Sidebar'
import { Menu } from 'lucide-react'

const Layout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 relative">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img 
              src="https://i.postimg.cc/156VRbDP/Whats-App-Image-2026-05-07-at-22-49-08.jpg" 
              alt="LPC Logo" 
              className="w-full h-full object-contain rounded-full" 
              onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/48?text=LPC"; }} 
            />
          </div>
          <h1 className="font-bold text-slate-800 text-sm leading-tight">
            LPC <span className="text-primary-600">Registration</span>
          </h1>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 lg:p-8 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}

export default Layout
