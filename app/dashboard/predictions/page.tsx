import { headers } from "next/headers"
import { redirect } from "next/navigation"
import PredictionsPageClient from "@/components/features/predictions/PredictionsPageClient"

export default async function PredictionsPage() {
  const headerStore = await headers()
  const role = headerStore.get("x-user-role")

  if (role === "student") {
    redirect("/dashboard/my-prediction")
  }

  return <PredictionsPageClient />
}
