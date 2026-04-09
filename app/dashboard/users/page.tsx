import { headers } from "next/headers"
import { redirect } from "next/navigation"
import UserTable from "@/components/features/admin/UserTable"

export default async function UsersPage() {
  const headerStore = await headers()
  const role = headerStore.get("x-user-role")
  if (role !== "admin") redirect("/dashboard")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">User Management</h2>
        <p className="text-sm text-gray-500 mt-1">Manage teacher, admin, and student accounts</p>
      </div>
      <UserTable />
    </div>
  )
}
