import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../features/auth/components/protected-route'

import Login from '../features/auth/pages/login'
import Register from '../features/auth/pages/register'
import ForgotPassword from '../features/auth/pages/forgot-password'
import ResetPassword from '../features/auth/pages/reset-password'
import MainLayout from '../common/layouts/MainLayout'
import OrganizationsList from '../features/super-admin/organizations/pages/OrganizationsList'
import AllUsers from '../features/super-admin/users/pages/AllUsers'
import EventTypes from '../features/super-admin/event-types/pages/EventTypes'
import StepTemplateBuilder from '../features/super-admin/step-templates/pages/StepTemplateBuilder'
import OrgUsersManagement from '../features/org-admin/pages/OrgUsersManagement'
import CampsList from '../features/org-admin/pages/CampsList'
import CreateEditCamp from '../features/org-admin/pages/CreateEditCamp'
import CampDetail from '../features/org-admin/pages/CampDetail'
import CampStaffAssignment from '../features/org-admin/pages/CampStaffAssignment'
import GeneratePublicFormLink from '../features/org-admin/pages/GeneratePublicFormLink'
import CampDashboard from '../features/organizer/pages/CampDashboard'
import ParticipantList from '../features/organizer/pages/ParticipantList'
import ParticipantDetail from '../features/organizer/pages/ParticipantDetail'
import MediaGallery from '../features/organizer/pages/MediaGallery'
import OrgDashboard from '../features/org-admin/pages/OrgDashboard'
import OrgParticipants from '../features/org-admin/pages/OrgParticipants'
import OrgMedia from '../features/org-admin/pages/OrgMedia'
import StaffAssignment from '../features/organizer/pages/StaffAssignment'
import MyQueue from '../features/staff/pages/MyQueue'
import StepForm from '../features/staff/pages/StepForm'
import MyCamps from '../features/staff/pages/MyCamps'
import PublicStepForm from '../features/public-form/pages/PublicStepForm'

export default function AppRoutes() {
	return (
		<Router>
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Super Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
          <Route path="/admin-dashboard" element={<MainLayout><Navigate to="/admin-dashboard/organizations" replace /></MainLayout>} />
          <Route path="/admin-dashboard/organizations" element={<MainLayout><OrganizationsList /></MainLayout>} />
          <Route path="/admin-dashboard/users" element={<MainLayout><AllUsers /></MainLayout>} />
          <Route path="/admin-dashboard/event-types" element={<MainLayout><EventTypes /></MainLayout>} />
          <Route path="/admin-dashboard/step-templates" element={<MainLayout><StepTemplateBuilder /></MainLayout>} />
        </Route>

        {/* Org Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['org_admin', 'super_admin']} />}>
          <Route path="/org-dashboard" element={<MainLayout><OrgDashboard /></MainLayout>} />
          <Route path="/org-dashboard/participants" element={<MainLayout><OrgParticipants /></MainLayout>} />
          <Route path="/org-dashboard/media" element={<MainLayout><OrgMedia /></MainLayout>} />
          <Route path="/org-dashboard/users" element={<MainLayout><OrgUsersManagement /></MainLayout>} />
          <Route path="/org-dashboard/camps" element={<MainLayout><CampsList /></MainLayout>} />
          <Route path="/org-dashboard/camps/create" element={<MainLayout><CreateEditCamp /></MainLayout>} />
          <Route path="/org-dashboard/camps/:id" element={<MainLayout><CampDetail /></MainLayout>} />
          <Route path="/org-dashboard/camps/:id/staff" element={<MainLayout><CampStaffAssignment /></MainLayout>} />
          <Route path="/org-dashboard/camps/:id/public-form" element={<MainLayout><GeneratePublicFormLink /></MainLayout>} />
        </Route>

        {/* Organizer Routes */}
        <Route element={<ProtectedRoute allowedRoles={['organizer', 'org_admin', 'super_admin']} />}>
          <Route path="/camp-dashboard/:id" element={<MainLayout><CampDashboard /></MainLayout>} />
          <Route path="/camp-dashboard/:id/participants" element={<MainLayout><ParticipantList /></MainLayout>} />
          <Route path="/camp-dashboard/:id/participants/:participantId" element={<MainLayout><ParticipantDetail /></MainLayout>} />
          <Route path="/camp-dashboard/:id/media" element={<MainLayout><MediaGallery /></MainLayout>} />
          <Route path="/camp-dashboard/:id/staff" element={<MainLayout><StaffAssignment /></MainLayout>} />
        </Route>

        {/* Staff Routes */}
        <Route element={<ProtectedRoute allowedRoles={['staff', 'organizer', 'org_admin', 'super_admin']} />}>
          <Route path="/my-camps" element={<MainLayout><MyCamps /></MainLayout>} />
          <Route path="/staff-workstation/:campId" element={<MainLayout><Navigate to="queue" replace /></MainLayout>} />
          <Route path="/staff-workstation/:campId/queue" element={<MainLayout><MyQueue /></MainLayout>} />
          <Route path="/staff-workstation/:campId/step-form/:participantId" element={<MainLayout><StepForm /></MainLayout>} />
        </Route>

        {/* Public Step Form (no layout) */}
        <Route path="/public-form" element={<PublicStepForm />} />

			</Routes>
		</Router>
	)
}
