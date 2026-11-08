import { fieldClass } from "@/components/freelancer/freelancer-profile-model"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function ProfileTextField({
	label,
	value,
	onChange,
	placeholder,
	type = "text",
	maxLength = 120,
	min,
	max,
	showCount = false,
}: {
	label: string
	value: string
	onChange: (value: string) => void
	placeholder: string
	type?: string
	maxLength?: number
	min?: number
	max?: number
	// Show "12/100" under the field.
	showCount?: boolean
}) {
	return (
		<label className="block font-medium text-sm">
			{label}
			<input
				className={fieldClass}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				type={type}
				min={min}
				max={max}
				maxLength={maxLength}
			/>
			{showCount && (
				<span className="mt-1.5 block text-right font-normal text-on-surface-variant text-xs tabular-nums">
					{value.length}/{maxLength}
				</span>
			)}
		</label>
	)
}

export function ProfileSelectField({
	id,
	label,
	value,
	options,
	onChange,
}: {
	id: string
	label: string
	value: string
	options: string[]
	onChange: (value: string) => void
}) {
	return (
		<div className="block font-medium text-sm">
			<label htmlFor={id}>{label}</label>
			<Select value={value} onValueChange={onChange}>
				<SelectTrigger
					id={id}
					className="mt-2 h-11 w-full rounded-lg border-input bg-surface-container-lowest px-3 font-normal text-sm shadow-none hover:border-foreground/20 dark:bg-surface-container-lowest dark:hover:bg-surface-container-lowest"
				>
					<SelectValue placeholder="Select an option" />
				</SelectTrigger>
				<SelectContent align="start">
					{options.map((option) => (
						<SelectItem key={option} value={option}>
							{option}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</div>
	)
}
