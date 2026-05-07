import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/auth-service'
import api from '../../../core/interceptors/axiosInterceptor'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		const initAuth = async () => {
			const token = localStorage.getItem('access_token')
			if (!token) { setLoading(false); return }
			try {
				const response = await api.get('/auth/me')
				const freshUser = response.data?.user ?? response.data
				setUser(freshUser)
				setIsAuthenticated(true)
				localStorage.setItem('user', JSON.stringify(freshUser))
			} catch {
				localStorage.removeItem('access_token')
				localStorage.removeItem('user')
			}
			setLoading(false)
		}

		initAuth()
	}, [])

	const login = (userData, token) => {
		setUser(userData)
		setIsAuthenticated(true)
		localStorage.setItem('user', JSON.stringify(userData))
		localStorage.setItem('access_token', token)
	}

	const logout = () => {
		setUser(null)
		setIsAuthenticated(false)
		authService.logout()
		window.location.href = '/login'
	}

	return (
		<AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within AuthProvider')
	}
	return context
}
