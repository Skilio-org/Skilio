import { Plus, X } from "lucide-react"
import { useState } from "react"
import CategorySelect from "@/components/common/category-select"
import { secondary } from "@/components/freelancer/freelancer-profile-model"

const levels = ["Basic", "Conversational", "Fluent", "Native or bilingual"]
const languages = [
	"Arabic",
	"Darija (Moroccan Arabic)",
	"Tamazight",
	"French",
	"English",
	"Spanish",
	"German",
	"Italian",
	"Portuguese",
	"Dutch",
	"Turkish",
	"Russian",
	"Chinese (Mandarin)",
	"Japanese",
	"Korean",
	"Hindi",
	"Urdu",
	"Persian",
	"Hebrew",
	"Swedish",
	"Norwegian",
	"Danish",
	"Finnish",
	"Polish",
	"Czech",
	"Romanian",
	"Greek",
	"Ukrainian",
	"Indonesian",
	"Vietnamese",
	"Thai",
	"Swahili",
]
// The backend stores languages as one string of up to 500 characters.
const maxLength = 500

// Same look as the other form fields (inputs, category and city pickers).
const triggerClass =
	"!flex h-11 w-full min-w-0 max-w-none rounded-lg border border-input bg-surface-container-lowest px-3 font-normal text-sm hover:border-foreground/20 hover:text-foreground"

type Item = { name: string; level: string }

// Stored format: "English — Fluent, Arabic — Native or bilingual".
function parse(value: string): Item[] {
	return value
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean)
		.map((entry) => {
			const [name, ...rest] = entry.split(/\s+[—–-]+\s*/)
			return { name: name.trim(), level: rest.join(" — ").trim() }
		})
}

function serialize(items: Item[]) {
	return items.map((item) => (item.level ? `${item.name} — ${item.level}` : item.name)).join(", ")
}

export function LanguagesField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
	const items = parse(value)
	// Commas separate entries in the stored string, so they can't be part of a name.
	const available = languages.filter(
		(language) => !items.some((item) => item.name.toLowerCase() === language.replace(/,/g, "").toLowerCase()),
	)
	const [name, setName] = useState("")
	const [level, setLevel] = useState("Fluent")

	const next = serialize([...items, { name, level }])
	const canAdd = Boolean(name) && next.length <= maxLength

	function add() {
		if (!canAdd) return
		onChange(next)
		setName("")
	}

	return (
		<div>
			<span className="block font-medium text-sm">Languages and proficiency *</span>
			{items.length > 0 && (
				<ul className="mt-2 divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant">
					{items.map((item) => (
						<li key={item.name} className="flex items-center gap-3 px-4 py-2.5 text-sm">
							<span className="font-medium text-on-surface">{item.name}</span>
							<span className="ml-auto text-on-surface-variant">{item.level || "No level"}</span>
							<button
								type="button"
								aria-label={`Remove ${item.name}`}
								className="grid size-7 shrink-0 place-items-center rounded-md text-on-surface-variant hover:bg-surface-container hover:text-destructive"
								onClick={() => onChange(serialize(items.filter((entry) => entry.name !== item.name)))}
							>
								<X className="size-4" />
							</button>
						</li>
					))}
				</ul>
			)}
			<div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,13rem)_auto]">
				<CategorySelect
					value={name}
					categories={available}
					placeholder="Select a language"
					ariaLabel="Select language"
					searchPlaceholder="Search languages..."
					emptyText="No language found."
					showAllCategories={false}
					align="start"
					onValueChange={setName}
					className={triggerClass}
				/>
				<CategorySelect
					value={level}
					categories={levels}
					ariaLabel="Select proficiency level"
					searchable={false}
					showAllCategories={false}
					align="start"
					onValueChange={setLevel}
					className={triggerClass}
				/>
				<button type="button" className={`${secondary} h-11 disabled:opacity-50`} onClick={add} disabled={!canAdd}>
					<Plus className="size-4" /> Add
				</button>
			</div>
			<p className="mt-1.5 text-on-surface-variant text-xs">
				Pick each language you can work in, then choose your level.
			</p>
		</div>
	)
}
