import { Check, ChevronDown } from "lucide-react"
import { useState } from "react"

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type CategorySelectProps = {
	value: string
	categories: string[]
	onValueChange: (value: string) => void
	isLoading?: boolean
	isError?: boolean
	className?: string
	showAllCategories?: boolean
	align?: "start" | "center" | "end"
	contentClassName?: string
	placeholder?: string
	ariaLabel?: string
	searchPlaceholder?: string
	emptyText?: string
	searchable?: boolean
}

export default function CategorySelect({
	value,
	categories,
	onValueChange,
	isLoading = false,
	isError = false,
	className,
	showAllCategories = true,
	align = "end",
	contentClassName,
	placeholder,
	ariaLabel = "Select category",
	searchPlaceholder = "Search categories...",
	emptyText = "No category found.",
	searchable = true,
}: CategorySelectProps) {
	const disabled = isLoading || isError
	const [open, setOpen] = useState(false)
	const choose = (next: string) => {
		onValueChange(next)
		setOpen(false)
	}

	const selectedLabel = value === "all" ? "All categories" : value || placeholder

	const triggerLabel = isLoading ? "Loading categories..." : isError ? "Failed to load categories" : selectedLabel

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label={ariaLabel}
					disabled={disabled}
					className={cn(
						"group hidden h-9 min-w-40 max-w-52 items-center justify-between gap-2 border-outline-variant border-l px-3 font-body-sm text-body-sm text-on-surface outline-none transition-colors sm:flex",
						"hover:text-link",
						"disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-on-surface",
						className,
					)}
				>
					<span className="truncate">{triggerLabel}</span>

					<ChevronDown className="size-3.5 shrink-0 text-current transition-transform group-data-[state=open]:rotate-180" />
				</button>
			</PopoverTrigger>

			<PopoverContent
				align={align}
				sideOffset={8}
				className={cn(
					"w-[max(var(--radix-popover-trigger-width),16rem)] rounded-lg border border-outline-variant bg-surface-container-lowest p-1 shadow-lg",
					contentClassName,
				)}
			>
				<Command>
					{searchable && <CommandInput placeholder={searchPlaceholder} />}

					<CommandList className="max-h-[268px] overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:var(--color-outline-variant)_transparent] [&::-webkit-scrollbar]:block [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-outline-variant hover:[&::-webkit-scrollbar-thumb]:bg-outline">
						<CommandEmpty>{emptyText}</CommandEmpty>

						<CommandGroup>
							{showAllCategories && (
								<CommandItem value="All categories" onSelect={() => choose("all")} className="cursor-pointer">
									<span className="flex-1">All categories</span>

									<Check className={cn("size-4 text-link", value === "all" ? "opacity-100" : "opacity-0")} />
								</CommandItem>
							)}

							{categories.map((category) => (
								<CommandItem
									key={category}
									value={category}
									onSelect={() => choose(category)}
									className="cursor-pointer"
								>
									<span className="flex-1 truncate">{category}</span>

									<Check className={cn("size-4 text-link", value === category ? "opacity-100" : "opacity-0")} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>

					{categories.length > 5 && (
						<div className="flex items-center justify-between border-t border-outline-variant/50 px-2.5 py-1.5 font-caption text-[11px] text-on-surface-variant">
							<span>{categories.length} categories</span>
							<span className="text-[10px] text-outline">Scroll for more</span>
						</div>
					)}
				</Command>
			</PopoverContent>
		</Popover>
	)
}
