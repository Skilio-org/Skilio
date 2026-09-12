import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Suspense } from "react";

import { ItemsService } from "@/client";
import { DataTable } from "@/components/Common/DataTable";
import { WorkspacePageHeader, WorkspaceSurface } from "@/components/dashboard/dashboard-header";
import AddItem from "@/components/Items/AddItem";
import { columns } from "@/components/Items/columns";
import PendingItems from "@/components/Pending/PendingItems";

function getItemsQueryOptions() {
  return {
    queryFn: async () => (await ItemsService.readItems({ query: { skip: 0, limit: 100 } })).data,
    queryKey: ["items"],
  };
}

export const Route = createFileRoute("/_layout/items")({
  component: Items,
  head: () => ({
    meta: [
      {
        title: "Items | Freelancer",
      },
    ],
  }),
});

function ItemsTableContent() {
  const { data: items } = useSuspenseQuery(getItemsQueryOptions());

  if (items.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-muted mb-4 rounded-full p-4">
          <Search className="text-muted-foreground h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold">You don't have any items yet</h3>
        <p className="text-muted-foreground">Add a new item to get started</p>
      </div>
    );
  }

  return <DataTable columns={columns} data={items.data} />;
}

function ItemsTable() {
  return (
    <Suspense fallback={<PendingItems />}>
      <ItemsTableContent />
    </Suspense>
  );
}

function Items() {
  return (
    <div className="space-y-7">
      <WorkspacePageHeader
        eyebrow="Workspace records"
        title="Items"
        description="Create, review, and manage your workspace items."
        action={<AddItem />}
      />
      <WorkspaceSurface className="overflow-hidden p-4 sm:p-6">
        <ItemsTable />
      </WorkspaceSurface>
    </div>
  );
}
