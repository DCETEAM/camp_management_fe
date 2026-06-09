export function isImageFile(file) {
	return file?.file_type?.startsWith('image/')
}

export function getCampGroups(files) {
	const map = new Map()
	for (const file of files) {
		const campId = file.participant?.camp?.id ?? file.participant?.camp_id ?? 'unknown'
		const campName = file.participant?.camp?.name ?? 'Unknown camp'
		if (!map.has(campId)) {
			map.set(campId, { id: campId, name: campName, files: [] })
		}
		map.get(campId).files.push(file)
	}
	return [...map.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function getFieldGroups(files) {
	const map = new Map()
	for (const file of files) {
		const key = file.field_key || 'attachments'
		const label = file.field_label || 'Attachments'
		if (!map.has(key)) {
			map.set(key, { id: key, label, files: [] })
		}
		map.get(key).files.push(file)
	}
	return [...map.values()].sort((a, b) => a.label.localeCompare(b.label))
}

export function filterFilesForCamp(files, campId) {
	if (!campId) return files
	return files.filter(f => String(f.participant?.camp?.id ?? f.participant?.camp_id) === String(campId))
}
