import DynamicFormField from './DynamicFormField'

export default function RegistrationFormFields({
	formFields = [],
	values = {},
	onChange,
	files = {},
	onFileChange,
	onRemoveFile,
	errors = {},
	fieldClassName = 'space-y-1.5',
	labelClassName = 'block text-sm font-semibold text-gray-700',
}) {
	const inputFields = formFields.filter((field) => field.type !== 'note')

	return (
		<div className="space-y-4">
			{inputFields.map((field) => (
				<div key={field.key} className={fieldClassName} data-field-error={errors[field.key] ? true : undefined}>
					<label className={labelClassName}>
						{field.label}
						{field.required && <span className="text-red-500 ml-0.5">*</span>}
					</label>
					<DynamicFormField
						field={field}
						value={values[field.key]}
						onChange={(value) => onChange?.(field.key, value)}
						fileValue={files[field.key]}
						onFileChange={(file) => onFileChange?.(field.key, file)}
						onRemoveFile={() => onRemoveFile?.(field.key)}
						error={errors[field.key]}
					/>
					{errors[field.key] && <p className="mt-1 text-[11px] text-red-500">{errors[field.key]}</p>}
				</div>
			))}
		</div>
	)
}
