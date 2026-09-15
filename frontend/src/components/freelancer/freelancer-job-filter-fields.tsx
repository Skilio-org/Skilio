import { Banknote, Clock3 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FreelancerJobFilterFieldsProps = {
  duration: string;
  group: string;
  jobType: string;
  showClear: boolean;
  onClear: () => void;
  onDurationChange: (value: string) => void;
  onJobTypeChange: (value: string) => void;
};

export function FreelancerJobFilterFields({
  duration,
  group,
  jobType,
  showClear,
  onClear,
  onDurationChange,
  onJobTypeChange,
}: FreelancerJobFilterFieldsProps) {
  return (
    <div className="space-y-7">
      <fieldset>
        <legend className="mb-3 flex items-center gap-2 text-sm font-medium">
          <Banknote className="text-muted-foreground size-4" />
          Project type
        </legend>
        <div className="space-y-1">
          {[
            ["any", "Any project type"],
            ["Fixed price", "Fixed price"],
            ["Hourly", "Hourly"],
          ].map(([value, label]) => (
            <label
              key={value}
              className="hover:bg-muted flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 text-sm"
            >
              <input
                type="radio"
                name={group}
                value={value}
                checked={jobType === value}
                onChange={() => onJobTypeChange(value)}
                className="accent-primary size-4"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <span className="text-muted-foreground mb-2 flex items-center gap-2 text-xs font-semibold">
          <Clock3 className="text-brand-600 size-3.5" /> Duration
        </span>
        <Select value={duration} onValueChange={onDurationChange}>
          <SelectTrigger aria-label="Project duration" className="bg-card h-12 w-full rounded-lg">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any duration</SelectItem>
            <SelectItem value="Short term">Short term</SelectItem>
            <SelectItem value="Long term">Long term</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {showClear && (
        <button type="button" onClick={onClear} className="text-primary min-h-11 text-sm font-medium hover:underline">
          Clear filters
        </button>
      )}
    </div>
  );
}
