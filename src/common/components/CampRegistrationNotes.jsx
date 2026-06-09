import FormNoteField from './FormNoteField'

export default function CampRegistrationNotes({ notes = [], campContext = {} }) {
	const list = Array.isArray(notes) ? notes.filter((n) => n?.content?.trim()) : []
	if (list.length === 0) return null

	return (
		<div className="space-y-3">
			{list.map((note, i) => (
				<FormNoteField key={i} field={note} campContext={campContext} />
			))}
		</div>
	)
}
