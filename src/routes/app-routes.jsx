import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

import Login from '../features/auth/pages/login'
import Register from '../features/auth/pages/register'

export default function AppRoutes() {
	return (
		<Router basename="/">
			<Routes>
				<Route path="/login" element={<Login />} />
				<Route path="/register" element={<Register />} />
			</Routes>
		</Router>
	)
}
