export const DEFAULT_REGISTRATION_SUCCESS_MESSAGE = 'Thank you for registering for {{camp_name}}!'

export function campShowsToken(camp) {
	return camp?.show_token_on_registration !== false && camp?.show_token_on_registration !== 0
}

export function resolveRegistrationSuccessMessage(camp) {
	const name = camp?.name?.trim() || 'this camp'
	const template = camp?.registration_success_message?.trim() || DEFAULT_REGISTRATION_SUCCESS_MESSAGE
	return template.replace(/\{\{camp_name\}\}/g, name)
}
