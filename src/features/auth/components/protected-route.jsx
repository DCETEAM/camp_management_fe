import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'

export default function ProtectedRoute({ children, requiredRole }) {
	const { isAuthenticated, user, loading } = useAuth()

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
					<p className="mt-4 text-gray-600">Loading...</p>
				</div>
			</div>
		)
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	if (requiredRole && user?.role !== requiredRole) {
		return <Navigate to="/unauthorized" replace />
	}

	return children
}
