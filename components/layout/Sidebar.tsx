"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ClipboardList, Users, TrendingUp, GraduationCap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AuthUser } from "@/types"

type NavItem = { label: string; href: string; icon: React.ElementType }

const navItems: NavItem[] = [
  { label: "Overview",    href: "/dashboard",             icon: LayoutDashboard },
  { label: "Attendance",  href: "/dashboard/attendance",  icon: ClipboardList   },
  { label: "Students",    href: "/dashboard/students",    icon: Users           },
  { label: "Predictions", href: "/dashboard/predictions", icon: TrendingUp      },
]

type Props = { user: AuthUser | null }

export default function Sidebar({ user }: Props) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-blue-800 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-700 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">EduTrack</p>
          <p className="text-blue-300 text-xs">Attendance Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-white/20 text-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      {user && (
        <div className="px-4 py-4 border-t border-blue-700">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-blue-300 text-xs capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
