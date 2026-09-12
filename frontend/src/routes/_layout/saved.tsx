import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookmarkCheck,
  BriefcaseBusiness,
  Check,
  Clock3,
  Edit3,
  Folder,
  FolderOpen,
  FolderPlus,
  ListChecks,
  MoreHorizontal,
  Search,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  Monogram,
  WorkspacePageHeader,
  WorkspaceSurface,
  workspaceStyles,
} from "@/components/dashboard/dashboard-header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { type Freelancer, freelancers } from "@/data/freelancers";
import { cn } from "@/lib/utils";
import {
  ALL_SAVED,
  CompareLabel,
  CompareValue,
  ListMenu,
  ListMetric,
  MoveMenu,
  SavedTalentRow,
  type SavedList,
} from "@/components/saved/saved-talent-components";

type ListDialogMode = "create" | "rename" | null;
type Confirmation = { type: "delete-list"; listId: string } | { type: "clear-list"; listId: string } | null;

const initialLists: SavedList[] = [
  {
    id: "product-redesign",
    name: "Product redesign",
    description: "Product thinkers for the client workspace redesign.",
    freelancerIds: ["maya-laurent", "amara-okafor", "sofia-mendes"],
    updatedLabel: "Updated today",
  },
  {
    id: "engineering-partners",
    name: "Engineering partners",
    description: "Technical leads who can own delivery from brief to launch.",
    freelancerIds: ["noah-williams", "elias-chen"],
    updatedLabel: "Updated yesterday",
  },
  {
    id: "launch-team",
    name: "Launch team",
    description: "Brand and growth specialists for the next market launch.",
    freelancerIds: ["amara-okafor", "sofia-mendes"],
    updatedLabel: "Updated Sep 6",
  },
];

export const Route = createFileRoute("/_layout/saved")({
  component: SavedTalent,
  head: () => ({ meta: [{ title: "Saved talent | Freelancer" }] }),
});

function SavedTalent() {
  const [lists, setLists] = useState(initialLists);
  const [activeListId, setActiveListId] = useState(initialLists[0].id);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [listDialogMode, setListDialogMode] = useState<ListDialogMode>(null);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [listName, setListName] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const [notice, setNotice] = useState("");

  const allSavedIds = useMemo(() => Array.from(new Set(lists.flatMap((list) => list.freelancerIds))), [lists]);
  const activeList = lists.find((list) => list.id === activeListId);
  const visibleIds = activeListId === ALL_SAVED ? allSavedIds : (activeList?.freelancerIds ?? []);

  const visibleFreelancers = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);

    return visibleIds
      .map((id) => freelancers.find((person) => person.id === id))
      .filter((person): person is Freelancer => Boolean(person))
      .filter((person) => {
        if (terms.length === 0) return true;
        const haystack = [person.name, person.title, person.location, person.bio, ...person.skills]
          .join(" ")
          .toLowerCase();

        return terms.every((term) => haystack.includes(term));
      });
  }, [query, visibleIds]);

  const selectedFreelancers = Array.from(selectedIds)
    .map((id) => freelancers.find((person) => person.id === id))
    .filter((person): person is Freelancer => Boolean(person));

  const averageRate = visibleFreelancers.length
    ? Math.round(visibleFreelancers.reduce((total, person) => total + person.rate, 0) / visibleFreelancers.length)
    : 0;
  const availableNow = visibleFreelancers.filter((person) => person.availability === "Available now").length;

  function chooseList(listId: string) {
    setActiveListId(listId);
    setSelectedIds(new Set());
    setQuery("");
    setNotice("");
  }

  function openCreateDialog() {
    setListDialogMode("create");
    setEditingListId(null);
    setListName("");
  }

  function openRenameDialog(list: SavedList) {
    setListDialogMode("rename");
    setEditingListId(list.id);
    setListName(list.name);
  }

  function saveList() {
    const nextName = listName.trim();
    if (!nextName) return;

    if (listDialogMode === "rename" && editingListId) {
      setLists((current) =>
        current.map((list) =>
          list.id === editingListId ? { ...list, name: nextName, updatedLabel: "Updated now" } : list,
        ),
      );
      setNotice(`Renamed list to “${nextName}”.`);
    } else {
      const newList: SavedList = {
        id: `list-${Date.now()}`,
        name: nextName,
        description: "A new shortlist ready for promising profiles.",
        freelancerIds: [],
        updatedLabel: "Created now",
      };
      setLists((current) => [...current, newList]);
      setActiveListId(newList.id);
      setSelectedIds(new Set());
      setNotice(`“${nextName}” is ready.`);
    }

    setListDialogMode(null);
  }

  function duplicateList(list: SavedList) {
    const duplicate: SavedList = {
      ...list,
      id: `list-${Date.now()}`,
      name: `${list.name} copy`,
      updatedLabel: "Created now",
    };
    setLists((current) => [...current, duplicate]);
    chooseList(duplicate.id);
    setNotice(`Duplicated “${list.name}”.`);
  }

  function confirmListAction() {
    if (!confirmation) return;

    if (confirmation.type === "delete-list") {
      const deleted = lists.find((list) => list.id === confirmation.listId);
      setLists((current) => current.filter((list) => list.id !== confirmation.listId));
      if (activeListId === confirmation.listId) chooseList(ALL_SAVED);
      setNotice(`Deleted “${deleted?.name ?? "list"}”.`);
    } else {
      setLists((current) =>
        current.map((list) =>
          list.id === confirmation.listId ? { ...list, freelancerIds: [], updatedLabel: "Updated now" } : list,
        ),
      );
      setSelectedIds(new Set());
      setNotice("Removed every profile from this list.");
    }

    setConfirmation(null);
  }

  function toggleSelected(id: string) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectAllVisible() {
    const visible = visibleFreelancers.map((person) => person.id);
    const everyVisibleSelected = visible.every((id) => selectedIds.has(id));
    setSelectedIds(everyVisibleSelected ? new Set() : new Set(visible));
  }

  function moveProfiles(ids: string[], destinationId: string) {
    const destination = lists.find((list) => list.id === destinationId);
    setLists((current) =>
      current.map((list) => {
        if (list.id === destinationId) {
          return {
            ...list,
            freelancerIds: Array.from(new Set([...list.freelancerIds, ...ids])),
            updatedLabel: "Updated now",
          };
        }
        if (activeListId !== ALL_SAVED && list.id === activeListId) {
          return {
            ...list,
            freelancerIds: list.freelancerIds.filter((id) => !ids.includes(id)),
            updatedLabel: "Updated now",
          };
        }
        return list;
      }),
    );
    setSelectedIds(new Set());
    setNotice(
      activeListId === ALL_SAVED
        ? `Added ${ids.length} profile${ids.length === 1 ? "" : "s"} to “${destination?.name}”.`
        : `Moved ${ids.length} profile${ids.length === 1 ? "" : "s"} to “${destination?.name}”.`,
    );
  }

  function removeProfiles(ids: string[]) {
    setLists((current) =>
      current.map((list) => {
        if (activeListId !== ALL_SAVED && list.id !== activeListId) return list;
        return {
          ...list,
          freelancerIds: list.freelancerIds.filter((id) => !ids.includes(id)),
          updatedLabel: "Updated now",
        };
      }),
    );
    setSelectedIds(new Set());
    setNotice(
      activeListId === ALL_SAVED
        ? `Removed ${ids.length} profile${ids.length === 1 ? "" : "s"} from saved talent.`
        : `Removed ${ids.length} profile${ids.length === 1 ? "" : "s"} from this list.`,
    );
  }

  return (
    <div className="space-y-7">
      <WorkspacePageHeader
        eyebrow="Talent workspace"
        title="Saved talent"
        description="Build focused shortlists, compare your strongest options, and keep every hiring decision organized."
        action={
          <button type="button" onClick={openCreateDialog} className={workspaceStyles.primaryAction}>
            <FolderPlus className="size-4" />
            New list
          </button>
        }
      />

      <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <WorkspaceSurface className="overflow-hidden">
            <div className="border-border flex items-center justify-between border-b px-4 py-4">
              <div>
                <p className="text-muted-foreground text-xs font-semibold tracking-[0.14em] uppercase">
                  Your workspace
                </p>
                <h2 className="font-display mt-1 text-lg font-semibold">Talent lists</h2>
              </div>
              <button
                type="button"
                onClick={openCreateDialog}
                aria-label="Create a talent list"
                className={workspaceStyles.iconButton}
              >
                <FolderPlus className="size-4" />
              </button>
            </div>

            <nav aria-label="Saved talent lists" className="space-y-1 p-2">
              <button
                type="button"
                onClick={() => chooseList(ALL_SAVED)}
                className={cn(
                  "flex min-h-14 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors",
                  activeListId === ALL_SAVED
                    ? "bg-brand-50 text-brand-800 dark:bg-brand-950/50 dark:text-brand-200"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-lg",
                    activeListId === ALL_SAVED ? "bg-card" : "bg-muted",
                  )}
                >
                  <BookmarkCheck className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="text-foreground block truncate text-sm">All saved talent</strong>
                  <span className="text-xs">Across every list</span>
                </span>
                <span className="bg-card text-muted-foreground rounded-full px-2 py-1 text-xs font-semibold shadow-sm">
                  {allSavedIds.length}
                </span>
              </button>

              <div className="text-muted-foreground px-3 pt-4 pb-1 text-[11px] font-semibold tracking-[0.14em] uppercase">
                Lists · {lists.length}
              </div>

              {lists.map((list) => {
                const isActive = list.id === activeListId;
                return (
                  <div
                    key={list.id}
                    className={cn(
                      "group flex items-center rounded-xl pr-1 transition-colors",
                      isActive ? "bg-brand-50 dark:bg-brand-950/50" : "hover:bg-muted",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => chooseList(list.id)}
                      className="flex min-h-[66px] min-w-0 flex-1 items-center gap-3 px-3 text-left"
                    >
                      <span
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-lg",
                          isActive ? "bg-brand-600 text-white" : "bg-muted text-muted-foreground group-hover:bg-card",
                        )}
                      >
                        {isActive ? <FolderOpen className="size-4" /> : <Folder className="size-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="text-foreground block truncate text-sm">{list.name}</strong>
                        <span className="text-muted-foreground text-xs">
                          {list.freelancerIds.length} {list.freelancerIds.length === 1 ? "profile" : "profiles"}
                        </span>
                      </span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Manage ${list.name}`}
                          className="text-muted-foreground hover:bg-card hover:text-foreground grid size-9 shrink-0 place-items-center rounded-full opacity-100 transition lg:opacity-0 lg:group-hover:opacity-100 lg:data-[state=open]:opacity-100"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <ListMenu
                        list={list}
                        onRename={() => openRenameDialog(list)}
                        onDuplicate={() => duplicateList(list)}
                        onClear={() =>
                          setConfirmation({
                            type: "clear-list",
                            listId: list.id,
                          })
                        }
                        onDelete={() =>
                          setConfirmation({
                            type: "delete-list",
                            listId: list.id,
                          })
                        }
                      />
                    </DropdownMenu>
                  </div>
                );
              })}
            </nav>
          </WorkspaceSurface>
        </aside>

        <section className="min-w-0 space-y-4" aria-label="Active talent list">
          <WorkspaceSurface className="overflow-hidden">
            <div className="border-border flex flex-col gap-5 border-b p-5 sm:p-6 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="text-brand-700 flex items-center gap-2 text-xs font-semibold tracking-[0.13em] uppercase">
                  <FolderOpen className="size-3.5" />
                  {activeListId === ALL_SAVED ? "Saved library" : "Active list"}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-2xl font-semibold sm:text-3xl">
                    {activeList?.name ?? "All saved talent"}
                  </h2>
                  <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-xs font-semibold">
                    {visibleIds.length} {visibleIds.length === 1 ? "profile" : "profiles"}
                  </span>
                </div>
                <p className="text-muted-foreground mt-2 max-w-2xl text-sm leading-6">
                  {activeList?.description ??
                    "Every professional you have saved, organized across your active talent lists."}
                </p>
                {activeList && <p className="text-muted-foreground mt-2 text-xs">{activeList.updatedLabel}</p>}
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {activeList && (
                  <button
                    type="button"
                    onClick={() => openRenameDialog(activeList)}
                    className={workspaceStyles.secondaryAction}
                  >
                    <Edit3 className="size-4" />
                    Rename
                  </button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button type="button" aria-label="List options" className={workspaceStyles.iconButton}>
                      <MoreHorizontal className="size-4" />
                    </button>
                  </DropdownMenuTrigger>
                  {activeList ? (
                    <ListMenu
                      list={activeList}
                      onRename={() => openRenameDialog(activeList)}
                      onDuplicate={() => duplicateList(activeList)}
                      onClear={() =>
                        setConfirmation({
                          type: "clear-list",
                          listId: activeList.id,
                        })
                      }
                      onDelete={() =>
                        setConfirmation({
                          type: "delete-list",
                          listId: activeList.id,
                        })
                      }
                    />
                  ) : (
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={openCreateDialog}>
                        <FolderPlus className="size-4" />
                        Create a list
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  )}
                </DropdownMenu>
              </div>
            </div>

            <div className="divide-border bg-muted/25 grid grid-cols-3 divide-x">
              <ListMetric icon={UsersRound} value={String(visibleIds.length)} label="Profiles" />
              <ListMetric icon={BriefcaseBusiness} value={averageRate ? `$${averageRate}` : "—"} label="Avg. hourly" />
              <ListMetric icon={Clock3} value={String(availableNow)} label="Available now" />
            </div>
          </WorkspaceSurface>

          <WorkspaceSurface className="p-3 sm:p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <label className={`${workspaceStyles.inputShell} min-w-0 flex-1`}>
                <Search className="text-muted-foreground size-4" />
                <span className="sr-only">Search this list</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search this list by name, skill, or location"
                  className="min-w-0 flex-1 bg-transparent px-3 text-base outline-none md:text-sm"
                />
              </label>
              <button
                type="button"
                onClick={selectAllVisible}
                disabled={visibleFreelancers.length === 0}
                className={cn(
                  workspaceStyles.secondaryAction,
                  "min-w-32 disabled:pointer-events-none disabled:opacity-45",
                )}
              >
                <ListChecks className="size-4" />
                {visibleFreelancers.length > 0 && visibleFreelancers.every((person) => selectedIds.has(person.id))
                  ? "Clear selection"
                  : "Select all"}
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="mt-3 flex flex-col gap-3 rounded-xl bg-slate-950 px-4 py-3 text-white sm:flex-row sm:items-center dark:bg-white dark:text-slate-950">
                <div className="flex items-center gap-3">
                  <span className="grid size-8 place-items-center rounded-full bg-white/15 text-sm font-semibold dark:bg-slate-950/10">
                    {selectedIds.size}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {selectedIds.size === 1 ? "Profile selected" : "Profiles selected"}
                    </p>
                    <p className="text-xs text-white/65 dark:text-slate-600">
                      Compare 2–3 profiles, or organize the whole selection.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => setCompareOpen(true)}
                    disabled={selectedIds.size < 2 || selectedIds.size > 3}
                    className="hover:bg-brand-50 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-semibold text-slate-950 transition disabled:pointer-events-none disabled:opacity-40 dark:bg-slate-950 dark:text-white"
                  >
                    <UsersRound className="size-4" />
                    Compare
                  </button>
                  <MoveMenu
                    lists={lists}
                    activeListId={activeListId}
                    label={activeListId === ALL_SAVED ? "Add to list" : "Move"}
                    onMove={(destinationId) => moveProfiles(Array.from(selectedIds), destinationId)}
                    triggerClassName="border-white/20 bg-white/10 text-white hover:bg-white/15 dark:border-slate-900/20 dark:bg-slate-950/10 dark:text-slate-950"
                  />
                  <button
                    type="button"
                    onClick={() => removeProfiles(Array.from(selectedIds))}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white transition hover:bg-red-500/20 dark:border-slate-900/20 dark:bg-slate-950/10 dark:text-slate-950"
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </button>
                </div>
              </div>
            )}
          </WorkspaceSurface>

          {notice && (
            <div
              aria-live="polite"
              className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            >
              <Check className="size-4 shrink-0" />
              {notice}
            </div>
          )}

          <div className="space-y-3">
            {visibleFreelancers.length > 0 ? (
              visibleFreelancers.map((freelancer) => (
                <SavedTalentRow
                  key={freelancer.id}
                  freelancer={freelancer}
                  lists={lists}
                  activeListId={activeListId}
                  selected={selectedIds.has(freelancer.id)}
                  onToggleSelected={() => toggleSelected(freelancer.id)}
                  onMove={(destinationId) => moveProfiles([freelancer.id], destinationId)}
                  onRemove={() => removeProfiles([freelancer.id])}
                />
              ))
            ) : (
              <WorkspaceSurface className="grid min-h-72 place-items-center p-8 text-center">
                <div className="max-w-sm">
                  <span className="bg-brand-50 text-brand-700 mx-auto grid size-12 place-items-center rounded-full">
                    {query ? <Search className="size-5" /> : <FolderPlus className="size-5" />}
                  </span>
                  <h2 className="font-display mt-4 text-xl font-semibold">
                    {query ? "No profiles match your search" : "This list is empty"}
                  </h2>
                  <p className="text-muted-foreground mt-2 text-sm leading-6">
                    {query
                      ? "Try a different name, skill, or location."
                      : "Browse the talent directory and save strong candidates to this list."}
                  </p>
                  {!query && (
                    <Link to="/talent" search={{ q: undefined }} className={`${workspaceStyles.primaryAction} mt-5`}>
                      Find talent <ArrowRight className="size-4" />
                    </Link>
                  )}
                </div>
              </WorkspaceSurface>
            )}
          </div>
        </section>
      </div>

      <Dialog open={listDialogMode !== null} onOpenChange={(open) => !open && setListDialogMode(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{listDialogMode === "rename" ? "Rename list" : "Create a talent list"}</DialogTitle>
            <DialogDescription>
              {listDialogMode === "rename"
                ? "Use a clear name that reflects the role or workstream."
                : "Create a focused shortlist for a role, project, or hiring stage."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label htmlFor="saved-list-name" className="text-sm font-semibold">
              List name
            </label>
            <Input
              id="saved-list-name"
              value={listName}
              onChange={(event) => setListName(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && saveList()}
              placeholder="e.g. Senior product designers"
              autoFocus
            />
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setListDialogMode(null)} className={workspaceStyles.secondaryAction}>
              Cancel
            </button>
            <button
              type="button"
              onClick={saveList}
              disabled={!listName.trim()}
              className={cn(workspaceStyles.primaryAction, "disabled:pointer-events-none disabled:opacity-45")}
            >
              {listDialogMode === "rename" ? "Save name" : "Create list"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmation !== null} onOpenChange={(open) => !open && setConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmation?.type === "delete-list" ? "Delete this list?" : "Clear this list?"}</DialogTitle>
            <DialogDescription>
              {confirmation?.type === "delete-list"
                ? "The list will be removed. Profiles saved in other lists will stay there."
                : "Every profile will be removed from this list. The list itself will remain available."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button type="button" onClick={() => setConfirmation(null)} className={workspaceStyles.secondaryAction}>
              Cancel
            </button>
            <button
              type="button"
              onClick={confirmListAction}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              <Trash2 className="size-4" />
              {confirmation?.type === "delete-list" ? "Delete list" : "Clear list"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={compareOpen} onOpenChange={setCompareOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Compare your finalists</DialogTitle>
            <DialogDescription>
              Review the signals that matter before opening profiles or starting a conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-x-auto pb-2">
            <div
              className="border-border bg-border grid min-w-[680px] gap-px overflow-hidden rounded-2xl border"
              style={{
                gridTemplateColumns: `150px repeat(${selectedFreelancers.length}, minmax(170px, 1fr))`,
              }}
            >
              <CompareLabel>Professional</CompareLabel>
              {selectedFreelancers.map((person) => (
                <div key={person.id} className="bg-card p-4">
                  <Monogram className={`size-10 text-sm ${person.background} ${person.foreground}`}>
                    {person.initials}
                  </Monogram>
                  <p className="font-display mt-3 font-semibold">{person.name}</p>
                  <p className="text-muted-foreground mt-1 text-xs">{person.title}</p>
                </div>
              ))}
              <CompareLabel>Hourly rate</CompareLabel>
              {selectedFreelancers.map((person) => (
                <CompareValue key={person.id}>${person.rate}/hr</CompareValue>
              ))}
              <CompareLabel>Success rate</CompareLabel>
              {selectedFreelancers.map((person) => (
                <CompareValue key={person.id}>{person.successRate}%</CompareValue>
              ))}
              <CompareLabel>Projects</CompareLabel>
              {selectedFreelancers.map((person) => (
                <CompareValue key={person.id}>{person.projects}</CompareValue>
              ))}
              <CompareLabel>Response</CompareLabel>
              {selectedFreelancers.map((person) => (
                <CompareValue key={person.id} className="text-sm">
                  {person.responseTime.replace("Usually replies ", "")}
                </CompareValue>
              ))}
            </div>
          </div>
          <DialogFooter>
            <button type="button" onClick={() => setCompareOpen(false)} className={workspaceStyles.secondaryAction}>
              Done
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
