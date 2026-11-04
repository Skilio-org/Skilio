import { Check, ChevronDown } from "lucide-react"

import { moroccoCities } from "@/components/common/morocco-cities"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type CitySelectProps = {
	value: string
	onValueChange: (value: string) => void
	className?: string
	align?: "start" | "center" | "end"
	contentClassName?: string
	emptyLabel?: string
}

export default function CitySelect({
	value,
	onValueChange,
	className,
	align = "start",
	contentClassName,
	emptyLabel = "Remote / anywhere",
}: CitySelectProps) {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<button
					type="button"
					aria-label="Select city"
					className={cn(
						"flex h-9 min-w-40 items-center justify-between gap-2 px-3 font-body-sm text-body-sm text-on-surface outline-none transition-colors hover:text-primary",
						className,
					)}
				>
					<span className={cn("truncate", !value && "text-muted-foreground")}>{value || emptyLabel}</span>

					<ChevronDown className="size-4 shrink-0 text-current opacity-50" />
				</button>
			</PopoverTrigger>

			<PopoverContent
				align={align}
				sideOffset={8}
				className={cn(
					"w-64 rounded-lg border border-outline-variant bg-surface-container-lowest p-1 shadow-lg",
					contentClassName,
				)}
			>
				<Command>
					<CommandInput placeholder="Search cities..." />

					<CommandList>
						<CommandEmpty>No city found.</CommandEmpty>

						<CommandGroup>
							<CommandItem value={emptyLabel} onSelect={() => onValueChange("")} className="cursor-pointer">
								<span className="flex-1">{emptyLabel}</span>

								<Check className={cn("size-4 text-primary", !value ? "opacity-100" : "opacity-0")} />
							</CommandItem>

							{moroccoCities.map((city) => (
								<CommandItem key={city} value={city} onSelect={() => onValueChange(city)} className="cursor-pointer">
									<span className="flex-1 truncate">{city}</span>

									<Check className={cn("size-4 text-primary", value === city ? "opacity-100" : "opacity-0")} />
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	)
}
