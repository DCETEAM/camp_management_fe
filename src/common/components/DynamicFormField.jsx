import { Upload, FileText, X } from 'lucide-react'
import DateInput from './DateInput'
import { resolveFieldValidation } from '../utils/fieldValidations'

const baseInput = 'w-full px-3 py-3 text-sm border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all'

export default function DynamicFormField({
	field,
	value,
	onChange,
	onFileChange,
	onRemoveFile,
	fileValue,
	error,
	disabled = false,
	inputClassName = '',
}) {
	const borderClass = error ? 'border-red-400' : 'border-gray-200'
	const inputCls = `${baseInput} ${borderClass} ${inputClassName}`.trim()

	if (disabled) {
		return (
			<input
				type="text"
				value={value ?? ''}
				disabled
				className={`${inputCls} bg-gray-50 text-gray-600 cursor-not-allowed`}
			/>
		)
	}

	switch (field.type) {
		case 'number':
			return (
				<input
					type="number"
					inputMode="numeric"
					value={value ?? ''}
					onChange={(e) => onChange?.(e.target.value.replace(/[^0-9.]/g, ''))}
					onKeyDown={(e) => { if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault() }}
					className={inputCls}
					placeholder={`Enter ${field.label.toLowerCase()}`}
				/>
			)

		case 'textarea':
			return (
				<textarea
					value={value ?? ''}
					onChange={(e) => onChange?.(e.target.value)}
					rows={3}
					className={`${inputCls} resize-none`}
					placeholder={`Enter ${field.label.toLowerCase()}`}
				/>
			)

		case 'dropdown':
			return (
				<select
					value={value ?? ''}
					onChange={(e) => onChange?.(e.target.value)}
					className={`${inputCls} bg-white`}
				>
					<option value="">Select {field.label.toLowerCase()}...</option>
					{field.options?.map((opt) => (
						<option key={opt} value={opt}>{opt}</option>
					))}
				</select>
			)

		case 'date':
			return (
				<DateInput
					value={value ?? ''}
					onChange={(iso) => onChange?.(iso)}
					className={inputCls}
				/>
			)

		case 'boolean':
			return (
				<div className={`flex items-center gap-4 px-3 py-2 rounded-lg border ${error ? 'border-red-400 bg-red-50/30' : 'border-transparent'}`}>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name={field.key}
							value="yes"
							checked={value === 'yes'}
							onChange={() => onChange?.('yes')}
							className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
						/>
						<span className="text-xs text-gray-700">Yes</span>
					</label>
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="radio"
							name={field.key}
							value="no"
							checked={value === 'no'}
							onChange={() => onChange?.('no')}
							className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
						/>
						<span className="text-xs text-gray-700">No</span>
					</label>
				</div>
			)

		case 'file':
		case 'image':
			return fileValue ? (
				<div className={`flex items-center justify-between px-3 py-2 bg-gray-50 border rounded-lg ${error ? 'border-red-400' : 'border-gray-200'}`}>
					<div className="flex items-center gap-2">
						<FileText className="w-4 h-4 text-gray-400" />
						<span className="text-xs text-gray-700 truncate max-w-[200px]">{fileValue.name}</span>
						<span className="text-[10px] text-gray-400">({(fileValue.size / 1024).toFixed(1)} KB)</span>
					</div>
					<button
						type="button"
						onClick={() => onRemoveFile?.()}
						className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors"
					>
						<X className="w-3.5 h-3.5" />
					</button>
				</div>
			) : (
				<label className={`flex items-center justify-center gap-2 px-3 py-3 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary-300 hover:bg-primary-50/30 transition-all ${error ? 'border-red-400 bg-red-50/20' : 'border-gray-200'}`}>
					<Upload className="w-4 h-4 text-gray-400" />
					<span className="text-xs text-gray-500">Click to upload file</span>
					<input
						type="file"
						accept="image/*,.pdf"
						onChange={(e) => onFileChange?.(e.target.files?.[0] || null)}
						className="hidden"
					/>
				</label>
			)

		default: {
			const preset = resolveFieldValidation(field)
			const inputType = preset === 'email' ? 'email' : preset === 'phone_in' ? 'tel' : 'text'
			const inputMode = preset === 'phone_in' ? 'numeric' : preset === 'pincode' ? 'numeric' : undefined
			return (
				<input
					type={inputType}
					inputMode={inputMode}
					maxLength={preset === 'phone_in' ? 10 : preset === 'pincode' ? 6 : undefined}
					value={value ?? ''}
					onChange={(e) => onChange?.(e.target.value)}
					className={inputCls}
					placeholder={`Enter ${field.label.toLowerCase()}`}
				/>
			)
		}
	}
}
