import { headers } from "next/headers"
import { redirect } from "next/navigation"
import StudentsDirectory from "@/components/features/students/StudentsDirectory"

export default async function StudentsPage() {
  const headerStore = await headers()
  const role = headerStore.get("x-user-role")

  if (role === "student") {
    redirect("/dashboard/my-profile")
  }

  return <StudentsDirectory role={role === "admin" ? "admin" : "teacher"} />
}
