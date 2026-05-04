import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import { Eye, EyeOff, AlertCircle, Loader, CheckCircle, ArrowLeft } from 'lucide-react'

export default function ResetPassword() {
	const [searchParams] = useSearchParams()
	const navigate = useNavigate()
	const token = searchParams.get('token')

	const [password, setPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState(false)

	if (!token) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
				<div className="w-full max-w-md">
					<div className="bg-white rounded-lg shadow-lg p-8 text-center">
						<AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
						<h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h1>
						<p className="text-gray-600 mb-6">This password reset link is invalid or has expired.</p>
						<Link
							to="/login"
							className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium transition"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to login
						</Link>
					</div>
				</div>
			</div>
		)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')

		if (password !== confirmPassword) {
			setError('Passwords do not match')
			return
		}

		if (password.length < 8) {
			setError('Password must be at least 8 characters long')
			return
		}

		setLoading(true)

		try {
			await axios.post('/auth/reset-password', {
				token,
				password,
			})

			setSuccess(true)
			setTimeout(() => {
				navigate('/login')
			}, 2000)
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to reset password. Please try again.')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				<div className="bg-white rounded-lg shadow-lg p-8">
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Password</h1>
						<p className="text-gray-600">Enter your new password below</p>
					</div>

					{success ? (
						<div className="space-y-6">
							<div className="p-4 bg-green-50 border border-green-200 rounded-lg flex gap-3">
								<CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
								<div>
									<p className="text-green-700 text-sm font-medium">Password reset successful</p>
									<p className="text-green-600 text-sm mt-1">Redirecting to login...</p>
								</div>
							</div>
						</div>
					) : (
						<>
							{error && (
								<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
									<AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
									<p className="text-red-700 text-sm">{error}</p>
								</div>
							)}

							<form onSubmit={handleSubmit} className="space-y-5">
								<div>
									<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
										New Password
									</label>
									<div className="relative">
										<input
											id="password"
											type={showPassword ? 'text' : 'password'}
											value={password}
											onChange={(e) => setPassword(e.target.value)}
											required
											placeholder="••••••••"
											className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
										>
											{showPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
									<p className="text-xs text-gray-500 mt-1">At least 8 characters</p>
								</div>

								<div>
									<label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
										Confirm Password
									</label>
									<div className="relative">
										<input
											id="confirmPassword"
											type={showConfirmPassword ? 'text' : 'password'}
											value={confirmPassword}
											onChange={(e) => setConfirmPassword(e.target.value)}
											required
											placeholder="••••••••"
											className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
										/>
										<button
											type="button"
											onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
										>
											{showConfirmPassword ? (
												<EyeOff className="w-5 h-5" />
											) : (
												<Eye className="w-5 h-5" />
											)}
										</button>
									</div>
								</div>

								<button
									type="submit"
									disabled={loading}
									className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2.5 rounded-lg transition flex items-center justify-center gap-2"
								>
									{loading ? (
										<>
											<Loader className="w-4 h-4 animate-spin" />
											Resetting...
										</>
									) : (
										'Reset Password'
									)}
								</button>
							</form>

							<div className="mt-6 text-center">
								<Link
									to="/login"
									className="flex items-center justify-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm font-medium transition"
								>
									<ArrowLeft className="w-4 h-4" />
									Back to login
								</Link>
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
