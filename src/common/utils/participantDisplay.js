const NAME_KEYS = ['name', 'full_name', 'fullname', 'patient_name']

export function pickProfileValue(data, keys) {
	if (!data || typeof data !== 'object') return null
	for (const key of keys) {
		const value = data[key]
		if (value !== undefined && value !== null && String(value).trim() !== '') {
			return value
		}
	}
	return null
}

export function getParticipantName(participant = {}, profileData = null) {
	const data = profileData || participant.profile_data || {}
	return (
		participant.name
		|| pickProfileValue(data, NAME_KEYS)
		|| participant.token_number
		|| 'Participant'
	)
}

export function getParticipantSubtitle(participant = {}, profileData = null) {
	const data = profileData || participant.profile_data || {}
	const age = participant.age ?? pickProfileValue(data, ['age'])
	const gender = participant.gender ?? pickProfileValue(data, ['gender'])
	const phone = participant.phone ?? pickProfileValue(data, ['phone', 'phone_number'])

	const parts = []
	if (age !== null && age !== undefined && age !== '') {
		parts.push(`${age}y`)
	}
	if (gender) parts.push(gender)
	if (phone) parts.push(phone)

	return parts.join(' · ')
}
