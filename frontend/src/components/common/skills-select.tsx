import { Plus, X } from "lucide-react"
import { useState } from "react"

const suggestedSkills = [
	"Product design",
	"UX research",
	"Figma",
	"React",
	"TypeScript",
	"Python",
	"Brand strategy",
	"Copywriting",
	"SEO",
	"Video editing",
	"AI automation",
	"Webflow",
]

const inputClass =
	"min-h-12 min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
const actionClass =
	"inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

type SkillsSelectProps = {
	value: string[]
	onChange: (skills: string[]) => void
	label: string
	inputId: string
}

export function SkillsSelect({ value, onChange, label, inputId }: SkillsSelectProps) {
	const [entry, setEntry] = useState("")
	const [error, setError] = useState("")

	function addSkill(raw: string) {
		const skill = raw.trim().slice(0, 40)
		if (!skill) return
		if (value.some((selected) => selected.toLowerCase() === skill.toLowerCase())) {
			setEntry("")
			return
		}
		if (value.length >= 15) {
			setError("Choose up to 15 skills.")
			return
		}
		onChange([...value, skill])
		setEntry("")
		setError("")
	}

	return (
		<div>
			<label htmlFor={inputId} className="font-medium text-sm">
				{label} <span className="font-normal text-muted-foreground">({value.length}/15)</span>
			</label>
			<div className="mt-2 flex gap-2">
				<input
					id={inputId}
					className={inputClass}
					value={entry}
					onChange={(event) => setEntry(event.target.value)}
					maxLength={40}
					placeholder="Add a skill"
					onKeyDown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault()
							addSkill(entry)
						}
					}}
				/>
				<button type="button" className={actionClass} onClick={() => addSkill(entry)}>
					Add
				</button>
			</div>
			{error && (
				<p role="alert" className="mt-2 text-destructive text-sm">
					{error}
				</p>
			)}
			<div className="mt-4 flex flex-wrap gap-2">
				{value.map((skill) => (
					<button
						type="button"
						key={skill}
						aria-label={`Remove ${skill}`}
						className="flex min-h-10 items-center gap-2 rounded-lg bg-primary/10 px-3 text-primary text-sm"
						onClick={() => {
							onChange(value.filter((selected) => selected !== skill))
							setError("")
						}}
					>
						{skill}
						<X className="size-3" />
					</button>
				))}
			</div>
			<p className="mt-6 text-muted-foreground text-xs">Suggestions</p>
			<div className="mt-2 flex flex-wrap gap-2">
				{suggestedSkills
					.filter((skill) => !value.some((selected) => selected.toLowerCase() === skill.toLowerCase()))
					.map((skill) => (
						<button type="button" className={actionClass} key={skill} onClick={() => addSkill(skill)}>
							<Plus className="size-3" />
							{skill}
						</button>
					))}
			</div>
		</div>
	)
}
