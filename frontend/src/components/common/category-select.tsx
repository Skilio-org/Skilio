import { Check, ChevronDown } from "lucide-react"

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command"
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type CategorySelectProps = {
	value: string
	categories: string[]
	onValueChange: (value: string) => void
}

export default function CategorySelect({
	value,
	categories,
	onValueChange,
}: CategorySelectProps) {
	const selectedLabel =
		value === "all" ? "All categories" : value

	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label="Select category"
					className="hidden h-9 min-w-40 max-w-52 items-center justify-between gap-2 border-outline-variant border-l px-3 font-body-sm text-body-sm text-on-surface outline-none transition-colors hover:text-primary sm:flex"
				>
					<span className="truncate">
						{selectedLabel}
					</span>

					<ChevronDown className="size-3.5 shrink-0 text-current" />
				</button>
			</PopoverTrigger>

			<PopoverContent
				align="end"
				sideOffset={8}
				className="w-64 rounded-lg border border-outline-variant bg-surface-container-lowest p-1 shadow-lg"
			>
				<Command>
					<CommandInput placeholder="Search categories..." />

					<CommandList>
						<CommandEmpty>
							No category found.
						</CommandEmpty>

						<CommandGroup>
							<CommandItem
								value="All categories"
								onSelect={() =>
									onValueChange("all")
								}
								className="cursor-pointer"
							>
								<span className="flex-1">
									All categories
								</span>

								<Check
									className={cn(
										"size-4 text-primary",
										value === "all"
											? "opacity-100"
											: "opacity-0",
									)}
								/>
							</CommandItem>

							{categories.map((category) => (
								<CommandItem
									key={category}
									value={category}
									onSelect={() =>
										onValueChange(category)
									}
									className="cursor-pointer"
								>
									<span className="flex-1 truncate">
										{category}
									</span>

									<Check
										className={cn(
											"size-4 text-primary",
											value === category
												? "opacity-100"
												: "opacity-0",
										)}
									/>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}