import { useSuspenseQuery } from "@tanstack/react-query"
import { Suspense } from "react"

import { type UserPublic, UsersService } from "@/client"
import AddUser from "@/components/admin/add-user"
import { columns, type UserTableData } from "@/components/admin/columns"
import { DataTable } from "@/components/common/data-table"
import { WorkspacePageHeader, WorkspaceSurface } from "@/components/dashboard/dashboard-header"
import PendingUsers from "@/components/pending/pending-users"
import useAuth from "@/hooks/useAuth"

function getUsersQueryOptions() {
	return {
		queryFn: async () => (await UsersService.readUsers({ query: { skip: 0, limit: 100 } })).data,
		queryKey: ["users"],
	}
}

function UsersTableContent() {
	const { user: currentUser } = useAuth()
	const { data: users } = useSuspenseQuery(getUsersQueryOptions())

	const tableData: UserTableData[] = users.data.map((user: UserPublic) => ({
		...user,
		isCurrentUser: currentUser?.id === user.id,
	}))

	return <DataTable columns={columns} data={tableData} />
}

function UsersTable() {
	return (
		<Suspense fallback={<PendingUsers />}>
			<UsersTableContent />
		</Suspense>
	)
}

export function AdminPage() {
	return (
		<div className="space-y-7">
			<WorkspacePageHeader
				eyebrow="Administration"
				title="User management"
				description="Manage user accounts, access, and workspace permissions."
				action={<AddUser />}
			/>
			<WorkspaceSurface className="overflow-hidden p-4 sm:p-6">
				<UsersTable />
			</WorkspaceSurface>
		</div>
	)
}
