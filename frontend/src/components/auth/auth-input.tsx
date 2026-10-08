import { LockKeyhole, Mail, UserRound } from "lucide-react"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form"
import { Input } from "../ui/input"
import { PasswordInput } from "../ui/password-input"

type AuthInputProps = {
	inputName: string
	inputLabel: string
	inputPlaceHolder: string
	inputDataTestId: string
	inputType: string
	control: any
	disabled: boolean
}

export const AuthInput = ({
	inputName,
	inputLabel,
	inputPlaceHolder,
	inputDataTestId,
	inputType,
	control,
	disabled,
}: AuthInputProps) => {
	const Icon = inputType === "password" ? LockKeyhole : inputType === "email" ? Mail : UserRound
	return (
		<FormField
			control={control}
			name={inputName}
			render={({ field }) => (
				<FormItem className="gap-1.5">
					<FormLabel className="font-medium text-[13px] text-foreground">{inputLabel}</FormLabel>
					<div className="relative">
						<Icon
							className="pointer-events-none absolute left-3.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						{inputType === "password" ? (
							<FormControl>
								<PasswordInput
									data-testid={inputDataTestId}
									type={inputType}
									autoComplete={inputName}
									placeholder={inputPlaceHolder}
									disabled={disabled}
									className="h-11 rounded-lg border-input bg-muted/30 pl-10 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/25"
									{...field}
								/>
							</FormControl>
						) : (
							<FormControl>
								<Input
									data-testid={inputDataTestId}
									type={inputType}
									autoComplete={inputName}
									placeholder={inputPlaceHolder}
									disabled={disabled}
									className="h-11 rounded-lg border-input bg-muted/30 pl-10 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:bg-card focus-visible:ring-[3px] focus-visible:ring-ring/25"
									{...field}
								/>
							</FormControl>
						)}
					</div>

					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	)
}
