"use client"

import { LogOut, Bell } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Button from "@/components/ui/Button"
import { useAuth } from "@/hooks/useAuth"

type Props = { title: string }

export default function Navbar({ title }: Props) {
  const { logout } = useAuth()

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 hidden sm:block">
          {formatDate(new Date(), "EEEE, MMM dd yyyy")}
        </span>
        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors relative">
          <Bell className="w-5 h-5" />
        </button>
        <Button variant="outline" size="sm" onClick={logout}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
