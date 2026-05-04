import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle, Loader, Tent, Users, Heart, ShieldCheck } from 'lucide-react'
import { useAuth } from '../contexts/auth-context'
import authService from '../services/auth-service'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const navigate = useNavigate()
	const { login } = useAuth()

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			const data = await authService.login(email, password)
			const access_token = data.access_token || data.token
			const user = data.user
			login(user, access_token)

			const roleRoutes = {
				super_admin: '/admin-dashboard',
				org_admin: '/org-dashboard',
				organizer: '/camp-dashboard',
				staff: '/step-queue',
			}

			const redirectPath = roleRoutes[user.role] || '/dashboard'
			navigate(redirectPath)
		} catch (err) {
			const errData = err.response?.data
			if (errData?.errors) {
				const firstError = Object.values(errData.errors).flat()[0]
				setError(firstError || errData.message || 'Login failed. Please try again.')
			} else {
				setError(errData?.message || 'Login failed. Please try again.')
			}
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen font-inter">
			<div className="flex min-h-screen">
				<div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 relative overflow-hidden">
					<div className="absolute inset-0 opacity-10">
						<div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
						<div className="absolute bottom-20 right-20 w-96 h-96 bg-accent-400 rounded-full blur-3xl"></div>
					</div>

					<div className="relative z-10 flex flex-col justify-center items-center w-full px-12">
						<div className="text-center">
							<div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6">
								<Tent className="w-12 h-12 text-white" />
							</div>
							<h2 className="font-poppins text-4xl font-bold text-white mb-3">Camp Manager</h2>
							<p className="text-primary-100 text-lg">Streamline your outreach camps</p>
						</div>
					</div>
				</div>

				<div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
					<div className="w-full max-w-lg">
						<div className="mb-8">
							<div className="flex items-center gap-3 mb-4">
								<div className="lg:hidden w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
									<Tent className="w-6 h-6 text-white" />
								</div>
							</div>
							<h1 className="font-poppins text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
							<p className="text-gray-600 text-lg">Sign in to your account to continue</p>
						</div>

						{error && (
							<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3">
								<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
								<p className="text-red-700 text-sm font-medium">{error}</p>
							</div>
						)}

						<form onSubmit={handleSubmit} className="space-y-5">
							<div>
								<label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
									Email Address
								</label>
								<div className="relative">
									<input
										id="email"
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										placeholder="you@example.com"
										className="w-full px-4 py-3.5 pl-4 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<label htmlFor="password" className="block text-sm font-semibold text-gray-700">
										Password
									</label>
								</div>
								<div className="relative">
									<input
										id="password"
										type={showPassword ? 'text' : 'password'}
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
										placeholder="••••••••"
										className="w-full px-4 py-3.5 pr-12 border border-gray-200 rounded-xl bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all shadow-sm"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
									>
										{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
									</button>
								</div>
							</div>

							<div className="flex items-center justify-end">
								<Link
									to="/forgot-password"
									className="text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors"
								>
									Forgot Password?
								</Link>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
							>
								{loading ? (
									<>
										<Loader className="w-5 h-5 animate-spin" />
										Signing in...
									</>
								) : (
									'Sign In'
								)}
							</button>
						</form>

						<div className="mt-8 pt-6 border-t border-gray-200">
							<div className="text-center">
								<p className="text-gray-600 text-sm">
									Need help? Contact your organization administrator
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
