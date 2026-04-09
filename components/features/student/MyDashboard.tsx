"use client"

import { useMemo } from "react"
import { useAttendance } from "@/hooks/useAttendance"
import { usePrediction } from "@/hooks/usePrediction"
import { useAuth } from "@/hooks/useAuth"
import PredictionCard from "@/components/features/predictions/PredictionCard"
import AttendanceChart from "@/components/features/analytics/AttendanceChart"
import Badge from "@/components/ui/Badge"
import { computeTrend } from "@/lib/attendance"
import { formatDate } from "@/lib/utils"
import type { RiskLevel } from "@/types"

const riskBadge: Record<RiskLevel, "at-risk" | "needs-improvement" | "good" | "excellent"> = {
  "At Risk": "at-risk",
  "Needs Improvement": "needs-improvement",
  "Good Standing": "good",
  Excellent: "excellent",
}

export default function MyDashboard() {
  const { user } = useAuth()
  const { students, subjects, records, initialized } = useAttendance()
  const { getPrediction } = usePrediction(students, records, subjects)

  const myStudent = students[0] ?? null  // student role only has their own record
  const myRecords = useMemo(
    () => records.filter((r) => r.studentId === myStudent?.id),
    [records, myStudent]
  )

  const prediction = myStudent ? getPrediction(myStudent.id) : undefined
  const trendData = useMemo(() => computeTrend(myRecords, 30), [myRecords])
  const recentHistory = useMemo(
    () => [...myRecords].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [myRecords]
  )

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome header */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-2xl">
            {user?.name.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Welcome, {user?.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {myStudent ? `Roll ${myStudent.roll} · Class ${myStudent.class}` : "Student"}
            </p>
          </div>
          {prediction && (
            <div className="ml-auto">
              <Badge variant={riskBadge[prediction.riskLevel]}>{prediction.riskLevel}</Badge>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Attendance Rate", value: prediction ? `${prediction.attendanceRate.toFixed(1)}%` : "–", color: "text-blue-700" },
          { label: "Predicted Grade", value: prediction?.gradeBand ?? "–", color: "text-green-700" },
          { label: "Classes This Month", value: myRecords.length.toString(), color: "text-purple-700" },
          { label: "Absences (recent)", value: myRecords.filter((r) => r.status === "absent").length.toString(), color: "text-red-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <p className="text-xs text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Prediction card */}
      {prediction && <PredictionCard prediction={prediction} />}

      {/* 30-day trend */}
      <AttendanceChart data={trendData} title="My 30-Day Attendance Trend" />

      {/* Recent history */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">Recent Attendance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Subject</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentHistory.map((r) => {
                const sub = subjects.find((s) => s.id === r.subjectId)
                return (
                  <tr key={r.id} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-gray-700">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 text-gray-700">{sub?.name ?? r.subjectId}</td>
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
              {recentHistory.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-400">No attendance records yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
