import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  Check,
  Clock3,
  Copy,
  Edit3,
  Folder,
  ListChecks,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  MoveRight,
  ShieldCheck,
  Star,
  Trash2,
  type UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { Monogram, SkillTag, workspaceStyles } from "@/components/dashboard/dashboard-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Freelancer } from "@/data/freelancers";
import { cn } from "@/lib/utils";

export type SavedList = {
  id: string;
  name: string;
  description: string;
  freelancerIds: string[];
  updatedLabel: string;
};

export const ALL_SAVED = "all-saved";

export function SavedTalentRow({
  freelancer,
  lists,
  activeListId,
  selected,
  onToggleSelected,
  onMove,
  onRemove,
}: {
  freelancer: Freelancer;
  lists: SavedList[];
  activeListId: string;
  selected: boolean;
  onToggleSelected: () => void;
  onMove: (destinationId: string) => void;
  onRemove: () => void;
}) {
  return (
    <article
      className={cn(
        "bg-card shadow-card relative overflow-hidden rounded-2xl border transition-all",
        selected ? "border-brand-400 ring-brand-100 ring-4" : "border-border",
      )}
    >
      <div className="grid lg:grid-cols-[minmax(0,1fr)_210px]">
        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <label
              className={cn(
                "focus-within:outline-ring mt-1 grid size-6 shrink-0 place-items-center rounded-lg border transition-colors focus-within:outline-2 focus-within:outline-offset-2",
                selected
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-border bg-background hover:border-brand-400 text-transparent",
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={onToggleSelected}
                aria-label={`Select ${freelancer.name}`}
                className="sr-only"
              />
              <Check className="size-4" />
            </label>

            <div className="relative shrink-0">
              <Monogram
                className={`size-14 text-base sm:size-16 sm:text-lg ${freelancer.background} ${freelancer.foreground}`}
              >
                {freelancer.initials}
              </Monogram>
              <span className="border-card absolute right-0 bottom-0 size-3.5 rounded-full border-[3px] bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h3 className="font-display text-xl font-semibold">{freelancer.name}</h3>
                    <BadgeCheck className="text-brand-600 size-4" aria-label="Verified profile" />
                  </div>
                  <p className="text-muted-foreground mt-1 text-sm font-medium">{freelancer.title}</p>
                </div>
                <ProfileMenu
                  freelancer={freelancer}
                  lists={lists}
                  activeListId={activeListId}
                  onMove={onMove}
                  onRemove={onRemove}
                  className="lg:hidden"
                />
              </div>

              <div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <strong className="text-foreground">{freelancer.rating.toFixed(1)}</strong>
                  <span>({freelancer.reviews} reviews)</span>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {freelancer.location}
                </span>
              </div>

              <p className="text-muted-foreground mt-4 max-w-3xl text-sm leading-6">{freelancer.bio}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {freelancer.skills.slice(0, 4).map((skill) => (
                  <SkillTag key={skill}>{skill}</SkillTag>
                ))}
              </div>

              <div className="border-border mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4">
                <ProfileSignal icon={ShieldCheck} value={`${freelancer.successRate}% success`} />
                <ProfileSignal icon={BriefcaseBusiness} value={`${freelancer.projects} projects`} />
                <ProfileSignal icon={Clock3} value={freelancer.responseTime.replace("Usually replies ", "")} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-border bg-muted/25 flex flex-col justify-between border-t p-5 lg:border-t-0 lg:border-l lg:p-6">
          <div>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-muted-foreground text-xs font-medium">Hourly rate</p>
                <p className="font-display mt-1 text-2xl font-semibold">
                  ${freelancer.rate}
                  <span className="text-muted-foreground text-sm font-medium">/hr</span>
                </p>
              </div>
              <ProfileMenu
                freelancer={freelancer}
                lists={lists}
                activeListId={activeListId}
                onMove={onMove}
                onRemove={onRemove}
                className="hidden lg:block"
              />
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {freelancer.availability}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-1">
            <Link
              to="/talent/$freelancerId"
              params={{ freelancerId: freelancer.id }}
              search={{ q: undefined }}
              className={`${workspaceStyles.primaryAction} min-h-11 w-full px-4`}
            >
              View profile <ArrowUpRight className="size-4" />
            </Link>
            <Link
              to="/messages"
              search={{ with: freelancer.id }}
              className={`${workspaceStyles.secondaryAction} min-h-11 w-full px-4`}
            >
              <MessageCircle className="size-4" />
              Message
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function ProfileMenu({
  freelancer,
  lists,
  activeListId,
  onMove,
  onRemove,
  className,
}: {
  freelancer: Freelancer;
  lists: SavedList[];
  activeListId: string;
  onMove: (destinationId: string) => void;
  onRemove: () => void;
  className?: string;
}) {
  const destinations = lists.filter((list) => list.id !== activeListId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Manage ${freelancer.name}`}
          className={cn(workspaceStyles.iconButton, className)}
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-muted-foreground px-3 pb-2 text-xs">Manage saved profile</DropdownMenuLabel>
        {destinations.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="min-h-10 gap-2 rounded-xl px-3 py-2">
              <MoveRight className="text-muted-foreground mr-2 size-4" />
              {activeListId === ALL_SAVED ? "Add to list" : "Move to list"}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="border-border/80 shadow-floating w-56 rounded-2xl p-2">
              {destinations.map((list) => (
                <DropdownMenuItem key={list.id} onClick={() => onMove(list.id)}>
                  <Folder className="size-4" />
                  <span className="truncate">{list.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onRemove} variant="destructive">
          <Trash2 className="size-4" />
          {activeListId === ALL_SAVED ? "Remove from saved" : "Remove from list"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function MoveMenu({
  lists,
  activeListId,
  label,
  onMove,
  triggerClassName,
}: {
  lists: SavedList[];
  activeListId: string;
  label: string;
  onMove: (destinationId: string) => void;
  triggerClassName?: string;
}) {
  const destinations = lists.filter((list) => list.id !== activeListId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          disabled={destinations.length === 0}
          className={cn(
            "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold transition disabled:pointer-events-none disabled:opacity-40",
            triggerClassName,
          )}
        >
          <MoveRight className="size-4" />
          {label}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="text-muted-foreground px-3 text-xs">Choose destination</DropdownMenuLabel>
        {destinations.map((list) => (
          <DropdownMenuItem key={list.id} onClick={() => onMove(list.id)}>
            <Folder className="size-4" />
            <span className="min-w-0 flex-1 truncate">{list.name}</span>
            <span className="text-muted-foreground text-xs">{list.freelancerIds.length}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ListMenu({
  list,
  onRename,
  onDuplicate,
  onClear,
  onDelete,
}: {
  list: SavedList;
  onRename: () => void;
  onDuplicate: () => void;
  onClear: () => void;
  onDelete: () => void;
}) {
  return (
    <DropdownMenuContent align="end" className="w-56">
      <DropdownMenuLabel className="text-muted-foreground px-3 pb-2 text-xs">Manage “{list.name}”</DropdownMenuLabel>
      <DropdownMenuItem onClick={onRename}>
        <Edit3 className="size-4" />
        Rename list
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDuplicate}>
        <Copy className="size-4" />
        Duplicate list
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onClear} disabled={list.freelancerIds.length === 0}>
        <ListChecks className="size-4" />
        Clear profiles
      </DropdownMenuItem>
      <DropdownMenuItem onClick={onDelete} variant="destructive">
        <Trash2 className="size-4" />
        Delete list
      </DropdownMenuItem>
    </DropdownMenuContent>
  );
}

export function ListMetric({ icon: Icon, value, label }: { icon: typeof UsersRound; value: string; label: string }) {
  return (
    <div className="min-w-0 px-3 py-4 text-center sm:px-5 sm:text-left">
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        <Icon className="text-brand-600 hidden size-4 sm:block" />
        <strong className="font-display text-lg font-semibold sm:text-xl">{value}</strong>
      </div>
      <p className="text-muted-foreground mt-0.5 truncate text-[11px] font-medium sm:text-xs">{label}</p>
    </div>
  );
}

function ProfileSignal({ icon: Icon, value }: { icon: typeof ShieldCheck; value: string }) {
  return (
    <span className="text-muted-foreground inline-flex items-center gap-1.5 text-xs">
      <Icon className="text-brand-600 size-3.5" />
      {value}
    </span>
  );
}

export function CompareLabel({ children }: { children: string }) {
  return (
    <div className="bg-muted/70 text-muted-foreground flex items-center p-4 text-xs font-semibold tracking-[0.1em] uppercase">
      {children}
    </div>
  );
}

export function CompareValue({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("bg-card font-display flex items-center p-4 text-lg font-semibold", className)}>{children}</div>
  );
}
