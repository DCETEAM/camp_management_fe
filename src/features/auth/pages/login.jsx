import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
	Eye, EyeOff, AlertCircle, Loader, Tent,
	Users, Calendar, ShieldCheck, MapPin, Mail, Lock,
	Droplets, TreePine, Heart, Stethoscope, Activity, Star,
} from 'lucide-react'
import { useAuth } from '../contexts/auth-context'
import authService from '../services/auth-service'

const campTypes = [
	{ icon: Droplets, label: 'Blood Donation Camp', count: '240 donors', color: 'bg-red-500/20 text-red-300 border-red-400/30' },
	{ icon: Heart,     label: 'Heart Health Camp',   count: '180 screened', color: 'bg-pink-500/20 text-pink-300 border-pink-400/30' },
	{ icon: TreePine,  label: 'Tree Plantation',      count: '1,200 trees',  color: 'bg-green-500/20 text-green-300 border-green-400/30' },
	{ icon: Stethoscope, label: 'General Health Camp', count: '520 patients', color: 'bg-sky-500/20 text-sky-300 border-sky-400/30' },
	{ icon: Activity,  label: 'Eye Care Camp',        count: '310 checkups', color: 'bg-violet-500/20 text-violet-300 border-violet-400/30' },
	{ icon: Star,      label: 'Wellness Camp',        count: '95 enrolled',  color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
]

const stats = [
	{ value: '500+', label: 'Camps Organized' },
	{ value: '50K+', label: 'Participants Served' },
	{ value: '200+', label: 'Organizations' },
]

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
				organizer: '/my-camps',
				staff: '/my-camps',
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
		<div className="min-h-screen flex font-inter">

			{/* ── Left branding panel ── */}
			<div className="hidden lg:flex lg:w-[52%] bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 relative overflow-hidden flex-col">

				{/* Subtle dot grid overlay */}
				<div
					className="absolute inset-0 opacity-[0.06]"
					style={{
						backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
						backgroundSize: '28px 28px',
					}}
				/>

				{/* Ambient glow blobs */}
				<div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-20 pointer-events-none" />
				<div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-accent-500 rounded-full blur-3xl opacity-15 pointer-events-none" />

				<div className="relative z-10 flex flex-col h-full px-12 py-12">

					{/* Logo */}
					<div className="flex items-center gap-3">
						<div className="w-10 h-10 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center">
							<Tent className="w-5 h-5 text-white" />
						</div>
						<span className="font-poppins text-white font-semibold text-lg tracking-wide">
							CampManager
						</span>
					</div>

					{/* Headline */}
					<div className="flex-1 flex flex-col justify-center">
						<div className="mb-8">
							<span className="inline-block text-accent-300 text-xs font-semibold tracking-widest uppercase mb-4 bg-accent-900/40 border border-accent-700/40 px-3 py-1 rounded-full">
								Outreach Camp Platform
							</span>
							<h2 className="font-poppins text-[2.6rem] leading-tight font-bold text-white mb-3">
								Manage Every Camp.<br />
								<span className="text-accent-300">Serve Every Life.</span>
							</h2>
							<p className="text-primary-200 text-sm leading-relaxed max-w-sm">
								The all-in-one platform for organizing community outreach camps — from blood drives to tree plantations.
							</p>
						</div>

						{/* Camp type showcase */}
						<div className="mb-2">
							<p className="text-primary-300 text-xs font-semibold uppercase tracking-widest mb-3">Camps we support</p>
							<div className="grid grid-cols-2 gap-2.5">
								{campTypes.map(({ icon: Icon, label, count, color }) => (
									<div
										key={label}
										className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border bg-white/5 backdrop-blur-sm ${color} hover:bg-white/10 transition-colors`}
									>
										<div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${color}`}>
											<Icon className="w-3.5 h-3.5" />
										</div>
										<div className="min-w-0">
											<p className="text-white text-xs font-medium leading-tight truncate">{label}</p>
											<p className="text-white/50 text-[10px] mt-0.5">{count}</p>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>

					{/* Stats bar */}
					<div className="border-t border-white/10 pt-6">
						<div className="grid grid-cols-3 gap-6">
							{stats.map(({ value, label }) => (
								<div key={label}>
									<div className="font-poppins text-2xl font-bold text-white">{value}</div>
									<div className="text-primary-400 text-xs mt-0.5">{label}</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* ── Right login panel ── */}
			<div className="w-full lg:w-[48%] flex items-center justify-center bg-white p-6 lg:p-16">
				<div className="w-full max-w-md">

					{/* Mobile logo */}
					<div className="lg:hidden flex items-center gap-3 mb-10">
						<div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center">
							<Tent className="w-5 h-5 text-white" />
						</div>
						<span className="font-poppins font-semibold text-gray-900 text-lg">CampManager</span>
					</div>

					{/* Heading */}
					<div className="mb-8">
						<h1 className="font-poppins text-3xl font-bold text-gray-900 mb-1.5">Welcome back</h1>
						<p className="text-gray-500 text-sm">Sign in to access your organization dashboard</p>
					</div>

					{/* Error alert */}
					{error && (
						<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex gap-3 items-start">
							<AlertCircle className="w-4.5 h-4.5 text-red-500 flex-shrink-0 mt-0.5" />
							<p className="text-red-700 text-sm">{error}</p>
						</div>
					)}

					{/* Form */}
					<form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-5">

						{/* Email */}
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
							Email Address <span className="text-red-500">*</span>
						</label>
							<div className="relative">
								<Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
								<input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									required
									autoComplete="new-email"
									placeholder="you@organization.com"
									className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
								/>
							</div>
						</div>

						{/* Password */}
						<div>
							<label htmlFor="password" className="block text-sm font-medium text-gray-700">
								Password <span className="text-red-500">*</span>
							</label>
							<div className="relative">
								<Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
								<input
									id="password"
									type={showPassword ? 'text' : 'password'}
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									autoComplete="new-password"
									placeholder="••••••••"
									className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all text-sm"
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
								>
									{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
								</button>
							</div>
						</div>

						{/* Submit */}
						<button
							type="submit"
							disabled={loading}
							className="w-full bg-primary-600 hover:bg-primary-700 active:bg-primary-800 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-sm hover:shadow-md disabled:shadow-none flex items-center justify-center gap-2 text-sm mt-2"
						>
							{loading ? (
								<>
									<Loader className="w-4 h-4 animate-spin" />
									Signing in…
								</>
							) : (
								'Sign In'
							)}
						</button>
					</form>

					{/* Footer */}
					<div className="mt-10 pt-6 border-t border-gray-100 text-center">
						<p className="text-gray-400 text-xs">
							Need access?{' '}
							<span className="text-gray-600 font-medium">Contact your organization administrator.</span>
						</p>
					</div>
				</div>
			</div>

		</div>
	)
}
