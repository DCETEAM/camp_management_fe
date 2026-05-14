import React, { useState } from 'react'
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
  ArrowLeftRight,
  UserCog,
} from 'lucide-react'
import { useAuth } from '../../features/auth/contexts/auth-context'

const formatRole = (role) => role?.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || ''

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const { logout, user } = useAuth()
  const location = useLocation()

  const isSuperAdminSection = location.pathname.startsWith('/admin-dashboard')
  const isOrgAdminSection = location.pathname.startsWith('/org-dashboard')
  const isOrganizerSection = location.pathname.startsWith('/camp-dashboard')
  const isStaffSection = location.pathname.startsWith('/staff-workstation')
  const isMyCampsSection = location.pathname === '/my-camps'

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
      name: 'Step Template', 
      href: '/admin-dashboard/step-templates', 
      icon: ListChecks
    }
  ]

  const orgAdminNavigation = [
    {
      name: 'Dashboard',
      href: '/org-dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Participants',
      href: '/org-dashboard/participants',
      icon: Users
    },
    {
      name: 'Report',
      href: '/org-dashboard/report',
      icon: BarChart3
    },
    {
      name: 'Media',
      href: '/org-dashboard/media',
      icon: Image,
      dividerAfter: true,
    },
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
      name: 'Switch Camp',
      href: '/my-camps',
      icon: ArrowLeftRight,
      dividerAfter: true,
    },
    {
      name: 'My Queue',
      href: `/staff-workstation/${campId}/queue`,
      icon: ClipboardList
    },
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
    {
      name: 'Manage Staff',
      href: `/camp-dashboard/${campId}/staff`,
      icon: UserCog
    },
  ] : []

  const isPrivilegedRole = ['organizer', 'org_admin', 'super_admin'].includes(user?.role)

  const staffNavigation = staffCampId ? [
    {
      name: 'Switch Camp',
      href: '/my-camps',
      icon: ArrowLeftRight,
      dividerAfter: true,
    },
    {
      name: 'My Queue',
      href: `/staff-workstation/${staffCampId}/queue`,
      icon: ClipboardList
    },
    ...(isPrivilegedRole ? [
      {
        name: 'Dashboard',
        href: `/camp-dashboard/${staffCampId}`,
        icon: LayoutDashboard
      },
      {
        name: 'Participants',
        href: `/camp-dashboard/${staffCampId}/participants`,
        icon: Users
      },
      {
        name: 'Report',
        href: `/camp-dashboard/${staffCampId}/report`,
        icon: BarChart3
      },
      {
        name: 'Media Gallery',
        href: `/camp-dashboard/${staffCampId}/media`,
        icon: Image
      },
      {
        name: 'Manage Staff',
        href: `/camp-dashboard/${staffCampId}/staff`,
        icon: UserCog
      },
    ] : []),
  ] : []

  const myCampsNavigation = [
    {
      name: 'My Camps',
      href: '/my-camps',
      icon: CalendarIcon
    },
  ]

  const navigation = isMyCampsSection
    ? myCampsNavigation
    : isStaffSection
      ? staffNavigation
      : isOrganizerSection
        ? organizerNavigation
        : isOrgAdminSection
          ? orgAdminNavigation
          : superAdminNavigation

  return (
    <div className="min-h-screen bg-gray-50 font-inter overflow-x-hidden">
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
        overflow-y-auto
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 p-5 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Tent className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="font-poppins font-bold text-gray-900">Camp Manager</h2>
              <p className="text-xs text-gray-500">{isMyCampsSection ? 'My Workstation' : isStaffSection ? 'Staff Workstation' : isOrganizerSection ? 'Organizer Panel' : isOrgAdminSection ? 'Organization Panel' : 'Admin Panel'}</p>
            </div>
          </div>
          {/* Organization banner for org-level roles */}
          {['org_admin','organizer','staff'].includes(user?.role) && user?.organization?.name && (
            <div className="mx-4 mt-3 mb-1 flex items-center gap-2 px-3 py-2 bg-primary-50 border border-primary-100 rounded-xl">
              <Building2 className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
              <p className="text-xs font-semibold text-primary-700 truncate">{user.organization.name}</p>
            </div>
          )}

          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <React.Fragment key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                      ${isActive 
                        ? 'bg-primary-50 text-primary-700' 
                        : item.name === 'Switch Camp'
                          ? 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                  {item.dividerAfter && <hr className="border-gray-100 my-1" />}
                </React.Fragment>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                {user?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-gray-500 truncate">{formatRole(user?.role)}</p>
              </div>
            </div>
            <button
              onClick={() => setLogoutOpen(true)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {logoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="font-poppins text-base font-bold text-gray-900 mb-1">Log out?</h3>
            <p className="text-xs text-gray-500 mb-5">You will be redirected to the login page.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setLogoutOpen(false)}
                className="flex-1 px-4 py-2.5 text-xs font-semibold border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={logout}
                className="flex-1 px-4 py-2.5 text-xs font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                Yes, Log out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top bar for mobile */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Tent className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="font-poppins font-semibold text-sm sm:text-base text-gray-900 truncate">Camp Manager</span>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </header>

        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
