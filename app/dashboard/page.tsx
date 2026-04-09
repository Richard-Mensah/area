import { headers } from "next/headers"
import { redirect } from "next/navigation"
import AdminTeacherDashboard from "@/components/features/analytics/AdminTeacherDashboard"
import MyDashboard from "@/components/features/student/MyDashboard"

export default async function DashboardPage() {
  const headerStore = await headers()
  const role = headerStore.get("x-user-role")

  if (role === "student") {
    // Show student's personal dashboard inline
    return <MyDashboard />
  }

  return <AdminTeacherDashboard role={role === "admin" ? "admin" : "teacher"} />
}
