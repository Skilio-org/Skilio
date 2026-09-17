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
	return (
		<FormField
			control={control}
			name={inputName}
			render={({ field }) => (
				<FormItem className="space-y-2">
					<FormLabel className="font-medium text-[13px] text-foreground">{inputLabel}</FormLabel>
					<FormControl>
						{inputType === "password" ? (
							<PasswordInput
								data-testid={inputDataTestId}
								type={inputType}
								autoComplete={inputName}
								placeholder={inputPlaceHolder}
								disabled={disabled}
								className="h-12 rounded-xl border-input bg-card px-4 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25"
								{...field}
							/>
						) : (
							<Input
								data-testid={inputDataTestId}
								type={inputType}
								autoComplete={inputName}
								placeholder={inputPlaceHolder}
								disabled={disabled}
								className="h-12 rounded-xl border-input bg-card px-4 text-foreground text-sm shadow-none transition-[border-color,box-shadow,background-color] placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-[3px] focus-visible:ring-ring/25"
								{...field}
							/>
						)}
					</FormControl>

					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	)
}
