import { headers } from "next/headers"
import { redirect } from "next/navigation"
import AttendancePageClient from "@/components/features/attendance/AttendancePageClient"

export default async function AttendancePage() {
  const headerStore = await headers()
  const role = headerStore.get("x-user-role")

  if (role === "student") {
    redirect("/dashboard/my-attendance")
  }

  return <AttendancePageClient />
}
