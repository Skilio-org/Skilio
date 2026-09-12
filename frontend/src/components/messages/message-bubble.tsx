import { Monogram } from "@/components/dashboard/dashboard-header";

export function MessageBubble({
  initials,
  avatarClass,
  message,
  time,
}: {
  initials: string;
  avatarClass: string;
  message: string;
  time: string;
}) {
  return (
    <div className="flex max-w-[92%] items-end gap-2 sm:max-w-[78%] sm:gap-3">
      <Monogram className={`size-8 text-[10px] ${avatarClass}`}>{initials}</Monogram>
      <div>
        <div className="border-border bg-card rounded-2xl rounded-bl-md border px-4 py-3 text-sm leading-6 shadow-sm">
          {message}
        </div>
        <p className="text-muted-foreground mt-1 text-[11px]">{time}</p>
      </div>
    </div>
  );
}
