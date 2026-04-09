"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Sidebar from "@/components/layout/Sidebar"
import Navbar from "@/components/layout/Navbar"
import type { AuthUser } from "@/types"

const pageTitles: Record<string, string> = {
  "/dashboard":              "Overview",
  "/dashboard/attendance":   "Attendance",
  "/dashboard/students":     "Students",
  "/dashboard/predictions":  "Academic Predictions",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const raw = localStorage.getItem("attendance_app_auth")
    if (!raw) {
      router.replace("/login")
      return
    }
    try {
      const session = JSON.parse(raw)
      if (!session?.expiresAt || new Date(session.expiresAt) <= new Date()) {
        localStorage.removeItem("attendance_app_auth")
        router.replace("/login")
        return
      }
      setUser(session.user)
    } catch {
      localStorage.removeItem("attendance_app_auth")
      router.replace("/login")
    } finally {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const title =
    Object.entries(pageTitles).find(([path]) => pathname.startsWith(path) && (pathname === path || pathname.startsWith(path + "/")))?.[1]
    ?? "EduTrack"

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col ml-60">
        <Navbar title={title} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
