import { Banknote } from "lucide-react"

type FreelancerJobFilterFieldsProps = {
  group: string
  jobType: string
  showClear: boolean
  onClear: () => void
  onJobTypeChange: (value: string) => void
}

export function FreelancerJobFilterFields({
  group,
  jobType,
  showClear,
  onClear,
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
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-primary min-h-11 text-sm font-medium hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  )
}
