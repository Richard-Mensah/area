"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, ClipboardList, Users, TrendingUp, GraduationCap,
  UserCog, BookOpen, User, CalendarCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { UserRole } from "@/types"

type NavItem = { label: string; href: string; icon: React.ElementType }

const adminNav: NavItem[] = [
  { label: "Overview",     href: "/dashboard",              icon: LayoutDashboard },
  { label: "Attendance",   href: "/dashboard/attendance",   icon: ClipboardList   },
  { label: "Students",     href: "/dashboard/students",     icon: Users           },
  { label: "Predictions",  href: "/dashboard/predictions",  icon: TrendingUp      },
  { label: "Users",        href: "/dashboard/users",        icon: UserCog         },
  { label: "Subjects",     href: "/dashboard/subjects",     icon: BookOpen        },
]

const teacherNav: NavItem[] = [
  { label: "Overview",     href: "/dashboard",              icon: LayoutDashboard },
  { label: "Attendance",   href: "/dashboard/attendance",   icon: ClipboardList   },
  { label: "My Students",  href: "/dashboard/students",     icon: Users           },
  { label: "Predictions",  href: "/dashboard/predictions",  icon: TrendingUp      },
]

const studentNav: NavItem[] = [
  { label: "My Dashboard", href: "/dashboard",              icon: LayoutDashboard },
  { label: "My Attendance",href: "/dashboard/my-attendance",icon: CalendarCheck   },
  { label: "My Prediction",href: "/dashboard/my-prediction",icon: TrendingUp      },
  { label: "My Profile",   href: "/dashboard/my-profile",  icon: User            },
]

const navByRole: Record<UserRole, NavItem[]> = {
  admin: adminNav,
  teacher: teacherNav,
  student: studentNav,
}

type Props = { role: UserRole; name: string }

export default function Sidebar({ role, name }: Props) {
  const pathname = usePathname()
  const navItems = navByRole[role] ?? teacherNav

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-blue-800 flex flex-col z-30">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-blue-700 flex items-center gap-3">
        <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-white font-bold text-sm leading-tight">EduTrack</p>
          <p className="text-blue-300 text-xs capitalize">{role} Portal</p>
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

      {/* User info */}
      <div className="px-4 py-4 border-t border-blue-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-medium truncate">{name}</p>
            <p className="text-blue-300 text-xs capitalize">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
