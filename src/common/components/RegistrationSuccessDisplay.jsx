import { campShowsToken, resolveRegistrationSuccessMessage } from '../utils/registrationSuccessUtils'

export default function RegistrationSuccessDisplay({
	camp,
	tokenNumber,
	tokenLabel = 'Token Number',
	variant = 'default',
}) {
	const showToken = campShowsToken(camp)

	if (showToken && tokenNumber) {
		const boxClass = variant === 'large'
			? 'bg-primary-50 border-2 border-primary-200 rounded-xl p-6'
			: 'bg-primary-50 border-2 border-primary-200 rounded-xl p-5'
		const tokenClass = variant === 'large'
			? 'text-5xl font-bold text-primary-700 tracking-wider'
			: 'text-5xl font-bold text-primary-700 tracking-wider'

		return (
			<div className={`${boxClass} mb-6 inline-block min-w-[160px]`}>
				<p className="text-xs text-gray-500 mb-1">{tokenLabel}</p>
				<p className={tokenClass}>{tokenNumber}</p>
			</div>
		)
	}

	return (
		<div className="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-4 mb-6 max-w-md mx-auto">
			<p className="text-sm text-emerald-900 leading-relaxed">
				{resolveRegistrationSuccessMessage(camp)}
			</p>
		</div>
	)
}
