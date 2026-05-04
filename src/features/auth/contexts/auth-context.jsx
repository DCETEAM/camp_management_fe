import { createContext, useContext, useState, useEffect } from 'react'
import authService from '../services/auth-service'

const AuthContext = createContext()

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null)
	const [loading, setLoading] = useState(true)
	const [isAuthenticated, setIsAuthenticated] = useState(false)

	useEffect(() => {
		const initAuth = async () => {
			const storedUser = localStorage.getItem('user')
			if (storedUser) {
				try {
					setUser(JSON.parse(storedUser))
					setIsAuthenticated(true)
				} catch (error) {
					console.error('Failed to parse stored user:', error)
					localStorage.removeItem('user')
				}
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
