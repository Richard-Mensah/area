import { headers } from "next/headers"
import { redirect } from "next/navigation"
import SubjectManager from "@/components/features/admin/SubjectManager"

export default async function SubjectsPage() {
  const headerStore = await headers()
  const role = headerStore.get("x-user-role")
  if (role !== "admin") redirect("/dashboard")

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Subject Management</h2>
        <p className="text-sm text-gray-500 mt-1">Add, edit, and assign subjects to teachers</p>
      </div>
      <SubjectManager />
    </div>
  )
}
