import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'

import Login from '../features/auth/pages/login'
import Register from '../features/auth/pages/register'
import ForgotPassword from '../features/auth/pages/forgot-password'
import ResetPassword from '../features/auth/pages/reset-password'
import MainLayout from '../common/layouts/MainLayout'
import OrganizationsList from '../features/super-admin/pages/OrganizationsList'
import AllUsers from '../features/super-admin/pages/AllUsers'
import EventTypes from '../features/super-admin/pages/EventTypes'

export default function AppRoutes() {
	return (
		<Router basename="/">
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
				<Route path="/forgot-password" element={<ForgotPassword />} />
				<Route path="/reset-password" element={<ResetPassword />} />
        
        <Route path="/" element={<Navigate to="/admin-dashboard/organizations" replace />} />
        
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
			</Routes>
		</Router>
	)
}
