import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from '../features/auth/pages/login'
import Register from '../features/auth/pages/register'
import ForgotPassword from '../features/auth/pages/forgot-password'
import ResetPassword from '../features/auth/pages/reset-password'
import MainLayout from '../common/layouts/MainLayout'
import OrganizationsList from '../features/super-admin/pages/OrganizationsList'
import AllUsers from '../features/super-admin/pages/AllUsers'
import EventTypes from '../features/super-admin/pages/EventTypes'
import StepTemplateBuilder from '../features/super-admin/pages/StepTemplateBuilder'
import OrgUsersManagement from '../features/org-admin/pages/OrgUsersManagement'
import CampsList from '../features/org-admin/pages/CampsList'
import CreateEditCamp from '../features/org-admin/pages/CreateEditCamp'
import CampDetail from '../features/org-admin/pages/CampDetail'
import CampStaffAssignment from '../features/org-admin/pages/CampStaffAssignment'
import GenerateKioskToken from '../features/org-admin/pages/GenerateKioskToken'
import CampDashboard from '../features/organizer/pages/CampDashboard'
import ParticipantList from '../features/organizer/pages/ParticipantList'
import ParticipantDetail from '../features/organizer/pages/ParticipantDetail'
import CampReport from '../features/organizer/pages/CampReport'
import MediaGallery from '../features/organizer/pages/MediaGallery'
import MyQueue from '../features/staff/pages/MyQueue'
import StepForm from '../features/staff/pages/StepForm'
import KioskRegistration from '../features/kiosk/pages/KioskRegistration'

export default function AppRoutes() {
	return (
		<Router basename="/">
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<Navigate to="/admin-dashboard/organizations" replace />} />
        
        {/* Super Admin Routes */}
				<Route path="/admin-dashboard" element={
          <MainLayout>
            <Navigate to="/admin-dashboard/organizations" replace />
          </MainLayout>
        } />
        
        <Route path="/admin-dashboard/organizations" element={
          <MainLayout>
            <OrganizationsList />
          </MainLayout>
        } />
        
        <Route path="/admin-dashboard/users" element={
          <MainLayout>
            <AllUsers />
          </MainLayout>
        } />
        
        <Route path="/admin-dashboard/event-types" element={
          <MainLayout>
            <EventTypes />
          </MainLayout>
        } />

        <Route path="/admin-dashboard/step-templates" element={
          <MainLayout>
            <StepTemplateBuilder />
          </MainLayout>
        } />

        {/* Org Admin Routes */}
        <Route path="/org-dashboard" element={
          <MainLayout>
            <Navigate to="/org-dashboard/camps" replace />
          </MainLayout>
        } />

        <Route path="/org-dashboard/users" element={
          <MainLayout>
            <OrgUsersManagement />
          </MainLayout>
        } />

        <Route path="/org-dashboard/camps" element={
          <MainLayout>
            <CampsList />
          </MainLayout>
        } />

        <Route path="/org-dashboard/camps/create" element={
          <MainLayout>
            <CreateEditCamp />
          </MainLayout>
        } />

        <Route path="/org-dashboard/camps/:id" element={
          <MainLayout>
            <CampDetail />
          </MainLayout>
        } />

        <Route path="/org-dashboard/camps/:id/staff" element={
          <MainLayout>
            <CampStaffAssignment />
          </MainLayout>
        } />

        <Route path="/org-dashboard/camps/:id/kiosk-token" element={
          <MainLayout>
            <GenerateKioskToken />
          </MainLayout>
        } />

        {/* Organizer Routes */}

        <Route path="/camp-dashboard/:id" element={
          <MainLayout>
            <CampDashboard />
          </MainLayout>
        } />

        <Route path="/camp-dashboard/:id/participants" element={
          <MainLayout>
            <ParticipantList />
          </MainLayout>
        } />

        <Route path="/camp-dashboard/:id/participants/:participantId" element={
          <MainLayout>
            <ParticipantDetail />
          </MainLayout>
        } />

        <Route path="/camp-dashboard/:id/report" element={
          <MainLayout>
            <CampReport />
          </MainLayout>
        } />

        <Route path="/camp-dashboard/:id/media" element={
          <MainLayout>
            <MediaGallery />
          </MainLayout>
        } />

        {/* Staff Workstation Routes */}
        <Route path="/staff-workstation/:campId" element={
          <MainLayout>
            <Navigate to="queue" replace />
          </MainLayout>
        } />

        <Route path="/staff-workstation/:campId/queue" element={
          <MainLayout>
            <MyQueue />
          </MainLayout>
        } />

        <Route path="/staff-workstation/:campId/step-form/:participantId" element={
          <MainLayout>
            <StepForm />
          </MainLayout>
        } />

        {/* Kiosk Registration (no layout) */}
        <Route path="/kiosk" element={<KioskRegistration />} />

			</Routes>
		</Router>
	)
}
