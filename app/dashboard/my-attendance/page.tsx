"use client"

import { useMemo } from "react"
import { useAttendance } from "@/hooks/useAttendance"
import { useAuth } from "@/hooks/useAuth"
import Badge from "@/components/ui/Badge"
import { formatDate } from "@/lib/utils"

export default function MyAttendancePage() {
  const { user } = useAuth()
  const { students, subjects, records, initialized } = useAttendance()

  const myStudent = useMemo(
    () => students.find((s) => s.userId === user?.id) ?? students[0],
    [students, user]
  )

  const myRecords = useMemo(
    () => [...records.filter((r) => r.studentId === myStudent?.id)]
      .sort((a, b) => b.date.localeCompare(a.date)),
    [records, myStudent]
  )

  const stats = useMemo(() => {
    const present = myRecords.filter((r) => r.status === "present").length
    const absent = myRecords.filter((r) => r.status === "absent").length
    const late = myRecords.filter((r) => r.status === "late").length
    const total = myRecords.length
    const rate = total > 0 ? ((present + late * 0.5) / total) * 100 : 0
    return { present, absent, late, total, rate }
  }, [myRecords])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Attendance</h2>
        <p className="text-sm text-gray-500 mt-1">Your complete attendance history</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Overall Rate", value: `${stats.rate.toFixed(1)}%`, color: "text-blue-700" },
          { label: "Present", value: stats.present.toString(), color: "text-green-700" },
          { label: "Absent", value: stats.absent.toString(), color: "text-red-600" },
          { label: "Late", value: stats.late.toString(), color: "text-amber-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Full history table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Full History ({myRecords.length} records)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Subject</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Class</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {myRecords.map((r) => {
                const sub = subjects.find((s) => s.id === r.subjectId)
                return (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-gray-700">{sub?.name ?? r.subjectId}</td>
                    <td className="px-4 py-3 text-gray-500">{r.class}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={r.status === "present" ? "present" : r.status === "absent" ? "absent" : r.status === "late" ? "late" : "unmarked"}
                      >
                        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
              {myRecords.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
