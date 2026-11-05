import { Search, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sortOptions = [
	["recent", "Newest first"],
	["title", "Project title"],
	["budget", "Highest budget"],
]

// Search box and sort dropdown above the proposal list.
export function ProposalFilters({
	query,
	onQueryChange,
	sort,
	onSortChange,
}: {
	query: string
	onQueryChange: (value: string) => void
	sort: string
	onSortChange: (value: string) => void
}) {
	return (
		<div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
			<label className="relative flex min-h-12 flex-1 items-center gap-3 rounded-lg border border-input bg-surface-container-lowest px-4 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
				<Search className="size-4 shrink-0 text-on-surface-variant" />
				<input
					type="text"
					aria-label="Filter proposals"
					placeholder="Filter by project, client, or skill"
					value={query}
					onChange={(e) => onQueryChange(e.target.value)}
					className="min-w-0 flex-1 bg-transparent text-on-surface text-sm outline-none placeholder:text-outline"
				/>
				{query && (
					<button
						type="button"
						onClick={() => onQueryChange("")}
						aria-label="Clear filter"
						className="rounded p-1 text-on-surface-variant hover:text-on-surface"
					>
						<X className="size-3.5" />
					</button>
				)}
			</label>

			<div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
				<span className="font-caption text-caption text-outline">Sort:</span>
				<Select value={sort} onValueChange={onSortChange}>
					<SelectTrigger
						size="sm"
						aria-label="Sort proposals"
						className="w-44 rounded-lg border-input bg-surface-container-lowest px-3 font-normal text-sm text-on-surface shadow-none hover:border-foreground/20 data-[size=sm]:h-12 data-[state=open]:border-primary dark:bg-surface-container-lowest dark:hover:bg-surface-container-lowest [&>svg]:transition-transform data-[state=open]:[&>svg]:rotate-180"
					>
						<SelectValue />
					</SelectTrigger>
					<SelectContent
						align="end"
						sideOffset={6}
						className="w-[var(--radix-select-trigger-width)] min-w-0 rounded-lg border-outline-variant bg-surface-container-lowest p-1 text-on-surface shadow-md [&_[data-radix-select-viewport]]:min-w-0"
					>
						{sortOptions.map(([value, label]) => (
							<SelectItem
								key={value}
								value={value}
								className="min-h-8 cursor-pointer rounded px-3 pr-8 font-normal text-[12px] leading-4 focus:bg-surface-container focus:text-on-surface data-[state=checked]:bg-surface-container data-[state=checked]:text-link"
							>
								{label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</div>
	)
}
