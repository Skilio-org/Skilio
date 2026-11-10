import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { ComponentProps, forwardRef, useState } from "react";

interface PasswordInputProps extends ComponentProps<"input"> {
  error?: string;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ className, error, type: _type, ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <input
        type={showPassword ? "text" : "password"}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground border-input bg-surface-container-lowest dark:bg-surface-container-lowest hover:border-foreground/20 focus-visible:border-primary/50 focus-visible:ring-ring/25 h-12 w-full min-w-0 rounded-xl border px-4 py-1 pr-12 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className,
        )}
        ref={ref}
        aria-invalid={!!error}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="hover:bg-muted absolute top-1/2 right-1 z-10 size-10 -translate-y-1/2 p-0"
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => setShowPassword((visible) => !visible)}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="text-muted-foreground h-4 w-4" />
        ) : (
          <Eye className="text-muted-foreground h-4 w-4" />
        )}
      </Button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
