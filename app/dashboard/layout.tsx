import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
import type { UserRole } from "@/types"

const pageTitles: Record<string, string> = {
  "/dashboard":                    "Overview",
  "/dashboard/attendance":         "Attendance",
  "/dashboard/students":           "Students",
  "/dashboard/predictions":        "Academic Predictions",
  "/dashboard/users":              "User Management",
  "/dashboard/subjects":           "Subject Management",
  "/dashboard/my-attendance":      "My Attendance",
  "/dashboard/my-prediction":      "My Prediction",
  "/dashboard/my-profile":         "My Profile",
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers()
  const role = headerStore.get("x-user-role") as UserRole | null
  const name = headerStore.get("x-user-name")

  // Middleware protects this route, but double-check here
  if (!role || !name) {
    redirect("/login")
  }

  // Derive page title from request URL header
  const url = headerStore.get("x-invoke-path") ?? headerStore.get("next-url") ?? ""
  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => url === path || url.startsWith(path + "/"))?.[1] ?? "EduTrack"

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar role={role} name={name} />
      <div className="flex-1 flex flex-col ml-60">
        <Navbar title={title} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
