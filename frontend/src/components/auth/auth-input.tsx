import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { PasswordInput } from "../ui/password-input";

type AuthInputProps = {
  inputName: string;
  inputLabel: string;
  inputPlaceHolder: string;
  inputDataTestId: string;
  inputType: string;
  control: any;
  disabled: boolean;
};

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
          <FormLabel className="text-foreground text-[13px] font-medium">{inputLabel}</FormLabel>
          <FormControl>
            {inputType === "password" ? (
              <PasswordInput
                data-testid={inputDataTestId}
                type={inputType}
                autoComplete={inputName}
                placeholder={inputPlaceHolder}
                disabled={disabled}
                className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px]"
                {...field}
              />
            ) : (
              <Input
                data-testid={inputDataTestId}
                type={inputType}
                autoComplete={inputName}
                placeholder={inputPlaceHolder}
                disabled={disabled}
                className="border-input bg-card text-foreground placeholder:text-muted-foreground/65 hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 rounded-xl px-4 text-sm shadow-none transition-[border-color,box-shadow,background-color] focus-visible:ring-[3px]"
                {...field}
              />
            )}
          </FormControl>

          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  );
};
