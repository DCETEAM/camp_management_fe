import { useEffect, useRef, useState } from 'react'
import { Calendar } from 'lucide-react'
import { displayToIso, formatDateInputMask, isoToDisplay } from '../utils/dateFormat'

export default function DateInput({
	value = '',
	onChange,
	onBlur,
	min,
	className = '',
	placeholder = 'dd/mm/yyyy',
	disabled = false,
}) {
	const [display, setDisplay] = useState(() => isoToDisplay(value))
	const pickerRef = useRef(null)

	useEffect(() => {
		setDisplay(isoToDisplay(value))
	}, [value])

	const emitIso = (text) => {
		const iso = displayToIso(text)
		if (iso) {
			onChange?.(iso)
			return true
		}
		if (!text.trim()) {
			onChange?.('')
			return true
		}
		return false
	}

	const handleTextChange = (e) => {
		const masked = formatDateInputMask(e.target.value)
		setDisplay(masked)
		if (masked.length === 10) emitIso(masked)
	}

	const handleTextBlur = () => {
		if (!display.trim()) {
			onChange?.('')
		} else if (display.length === 10) {
			if (!emitIso(display)) {
				setDisplay(isoToDisplay(value))
			}
		} else {
			setDisplay(isoToDisplay(value))
		}
		onBlur?.()
	}

	const openPicker = () => {
		if (disabled) return
		pickerRef.current?.showPicker?.()
	}

	return (
		<div className="relative">
			<Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
			<input
				type="text"
				inputMode="numeric"
				value={display}
				onChange={handleTextChange}
				onBlur={handleTextBlur}
				disabled={disabled}
				placeholder={placeholder}
				maxLength={10}
				className={`${className} pl-8 pr-9`}
				autoComplete="off"
			/>
			<button
				type="button"
				onClick={openPicker}
				disabled={disabled}
				tabIndex={-1}
				className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
				aria-label="Open calendar"
			>
				<Calendar className="w-3.5 h-3.5" />
			</button>
			<input
				ref={pickerRef}
				type="date"
				value={value || ''}
				min={min}
				onChange={(e) => onChange?.(e.target.value)}
				className="sr-only"
				tabIndex={-1}
				aria-hidden
			/>
		</div>
	)
}
