import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Loader, CheckCircle, ArrowLeft, Tent, Mail } from 'lucide-react'
import authService from '../services/auth-service'

export default function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [submitted, setSubmitted] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		setLoading(true)

		try {
			await authService.forgotPassword(email)
			setSubmitted(true)
		} catch (err) {
			setError(err.response?.data?.message || 'Failed to send reset email. Please try again.')
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
								<Mail className="w-12 h-12 text-white" />
							</div>
							<h2 className="font-poppins text-4xl font-bold text-white mb-3">Reset Password</h2>
							<p className="text-primary-100 text-lg">Get back into your account</p>
						</div>
					</div>
				</div>

				<div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
					<div className="w-full max-w-lg">
						<div className="mb-8">
							<div className="flex items-center gap-3 mb-4">
								<div className="lg:hidden w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
									<Mail className="w-6 h-6 text-white" />
								</div>
							</div>
							<h1 className="font-poppins text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
							<p className="text-gray-600 text-lg">No worries, we'll send you reset instructions</p>
						</div>

						{submitted ? (
							<div className="space-y-6">
								<div className="p-6 bg-green-50 border border-green-200 rounded-xl flex gap-4">
									<CheckCircle className="w-7 h-7 text-green-600 flex-shrink-0 mt-0.5" />
									<div>
										<p className="text-green-700 font-semibold mb-1">Check your email</p>
										<p className="text-green-600 text-sm">
											We've sent a password reset link to <span className="font-semibold">{email}</span>. Please check your inbox and follow the instructions.
										</p>
									</div>
								</div>

								<Link
									to="/login"
									className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
								>
									<ArrowLeft className="w-5 h-5" />
									Back to login
								</Link>
							</div>
						) : (
							<>
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

									<button
										type="submit"
										disabled={loading}
										className="w-full bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700 hover:from-primary-600 hover:via-primary-700 hover:to-primary-800 disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center gap-2"
									>
										{loading ? (
											<>
												<Loader className="w-5 h-5 animate-spin" />
												Sending...
											</>
										) : (
											'Send Reset Link'
										)}
									</button>
								</form>

								<div className="mt-6 text-center">
									<Link
										to="/login"
										className="flex items-center justify-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-semibold transition-colors"
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
		</div>
	)
}
