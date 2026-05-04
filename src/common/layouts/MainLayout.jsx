import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Tent,
  Users,
  Building2,
  CalendarCheck,
  LogOut,
  Menu,
  X,
  ListChecks,
  Calendar as CalendarIcon,
  User,
  LayoutDashboard,
  BarChart3,
  Image,
  ClipboardList,
} from 'lucide-react'
import { useAuth } from '../../features/auth/contexts/auth-context'

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { logout } = useAuth()
  const location = useLocation()

  const isSuperAdminSection = location.pathname.startsWith('/admin-dashboard')
  const isOrgAdminSection = location.pathname.startsWith('/org-dashboard')
  const isOrganizerSection = location.pathname.startsWith('/camp-dashboard')
  const isStaffSection = location.pathname.startsWith('/staff-workstation')

  // Extract camp ID from organizer URLs like /camp-dashboard/:id/...
  const campIdMatch = location.pathname.match(/^\/camp-dashboard\/(\d+)/)
  const campId = campIdMatch ? campIdMatch[1] : ''

  // Extract camp ID from staff URLs like /staff-workstation/:campId/...
  const staffCampIdMatch = location.pathname.match(/^\/staff-workstation\/(\d+)/)
  const staffCampId = staffCampIdMatch ? staffCampIdMatch[1] : ''

  const superAdminNavigation = [
    { 
      name: 'Organizations', 
      href: '/admin-dashboard/organizations', 
      icon: Building2
    },
    { 
      name: 'All Users', 
      href: '/admin-dashboard/users', 
      icon: Users
    },
    { 
      name: 'Event Types', 
      href: '/admin-dashboard/event-types', 
      icon: CalendarCheck
    },
    { 
      name: 'Step Templates', 
      href: '/admin-dashboard/step-templates', 
      icon: ListChecks
    }
  ]

  const orgAdminNavigation = [
    { 
      name: 'Users', 
      href: '/org-dashboard/users', 
      icon: User
    },
    { 
      name: 'Camps', 
      href: '/org-dashboard/camps', 
      icon: CalendarIcon
    }
  ]

  const organizerNavigation = campId ? [
    {
      name: 'Dashboard',
      href: `/camp-dashboard/${campId}`,
      icon: LayoutDashboard
    },
    {
      name: 'Participants',
      href: `/camp-dashboard/${campId}/participants`,
      icon: Users
    },
    {
      name: 'Report',
      href: `/camp-dashboard/${campId}/report`,
      icon: BarChart3
    },
    {
      name: 'Media Gallery',
      href: `/camp-dashboard/${campId}/media`,
      icon: Image
    },
  ] : []

  const staffNavigation = staffCampId ? [
    {
      name: 'My Queue',
      href: `/staff-workstation/${staffCampId}/queue`,
      icon: ClipboardList
    },
  ] : []

  const navigation = isStaffSection
    ? staffNavigation
    : isOrganizerSection
      ? organizerNavigation
      : isOrgAdminSection
        ? orgAdminNavigation
        : superAdminNavigation

  return (
    <div className="min-h-screen bg-gray-50 font-inter">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-6 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
              <Tent className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-poppins font-bold text-gray-900">Camp Manager</h2>
              <p className="text-xs text-gray-500">{isStaffSection ? 'Staff Workstation' : isOrganizerSection ? 'Organizer Panel' : isOrgAdminSection ? 'Organization Panel' : 'Admin Panel'}</p>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-primary-50 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Admin User
                </p>
                <p className="text-xs text-gray-500 truncate">
                  Super Admin
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Go to Login
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar for mobile */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Tent className="w-4 h-4 text-white" />
              </div>
              <span className="font-poppins font-semibold text-gray-900">Camp Manager</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
