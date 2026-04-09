"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { useAttendance } from "@/hooks/useAttendance"
import { usePrediction } from "@/hooks/usePrediction"
import Badge from "@/components/ui/Badge"
import Select from "@/components/ui/Select"
import { CLASSES } from "@/constants"
import type { RiskLevel } from "@/types"
import { cn } from "@/lib/utils"

const riskBadge: Record<RiskLevel, "at-risk" | "needs-improvement" | "good" | "excellent"> = {
  "At Risk":           "at-risk",
  "Needs Improvement": "needs-improvement",
  "Good Standing":     "good",
  "Excellent":         "excellent",
}

export default function StudentsPage() {
  const { students, subjects, records, initialized } = useAttendance()
  const { predictions } = usePrediction(students, records, subjects)

  const [search, setSearch]     = useState("")
  const [classFilter, setClassFilter] = useState("all")

  const filtered = useMemo(() => {
    return students.filter((s) => {
      const matchClass = classFilter === "all" || s.class === classFilter
      const matchSearch =
        !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.includes(search)
      return matchClass && matchSearch
    })
  }, [students, search, classFilter])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or roll number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={[
              { value: "all", label: "All Classes" },
              ...CLASSES.map((c) => ({ value: c, label: `Class ${c}` })),
            ]}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((student) => {
          const pred = predictions.find((p) => p.studentId === student.id)
          return (
            <Link
              key={student.id}
              href={`/dashboard/students/${student.id}`}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {student.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                  <p className="text-xs text-gray-500">Roll {student.roll} · Class {student.class}</p>
                </div>
              </div>

              {pred && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Attendance</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            pred.attendanceRate >= 90 ? "bg-green-500" :
                            pred.attendanceRate >= 75 ? "bg-blue-500"  :
                            pred.attendanceRate >= 60 ? "bg-yellow-500": "bg-red-500"
                          )}
                          style={{ width: `${pred.attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{pred.attendanceRate}%</span>
                    </div>
                  </div>
                  <Badge variant={riskBadge[pred.riskLevel]}>{pred.riskLevel}</Badge>
                </div>
              )}
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">
          No students found matching your search.
        </div>
      )}
    </div>
  )
}
