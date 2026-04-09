"use client"

import { useMemo } from "react"
import { Users, UserCheck, AlertTriangle, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { useAttendance } from "@/hooks/useAttendance"
import { usePrediction } from "@/hooks/usePrediction"
import { computeTrend, getClassAttendanceToday } from "@/lib/attendance"
import StatsCard from "@/components/features/analytics/StatsCard"
import AttendanceChart from "@/components/features/analytics/AttendanceChart"
import ClassOverviewChart from "@/components/features/analytics/ClassOverviewChart"

export default function DashboardPage() {
  const { students, subjects, records, initialized } = useAttendance()
  const { predictions, getClassRiskSummary } = usePrediction(students, records, subjects)

  const today = format(new Date(), "yyyy-MM-dd")
  const todayOverall = useMemo(() => {
    if (!initialized) return { present: 0, absent: 0, late: 0, total: 0 }
    // Aggregate across all classes for today
    const seen = new Set<string>()
    let present = 0, absent = 0, late = 0
    for (const r of records) {
      if (r.date !== today || seen.has(r.studentId)) continue
      seen.add(r.studentId)
      if (r.status === "present") present++
      else if (r.status === "absent") absent++
      else if (r.status === "late") late++
    }
    return { present, absent, late, total: students.length }
  }, [records, students, today, initialized])

  const attendanceRate = todayOverall.total > 0
    ? Math.round(((todayOverall.present + todayOverall.late * 0.5) / todayOverall.total) * 100)
    : 0

  const riskSummary = useMemo(() => getClassRiskSummary(), [predictions])
  const trendData = useMemo(() => computeTrend(records, 30), [records])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Students"
          value={students.length}
          subtitle="Across all classes"
          icon={Users}
        />
        <StatsCard
          title="Today's Attendance"
          value={`${attendanceRate}%`}
          subtitle={`${todayOverall.present} present, ${todayOverall.absent} absent`}
          icon={UserCheck}
          variant={attendanceRate >= 75 ? "success" : attendanceRate >= 60 ? "warning" : "danger"}
        />
        <StatsCard
          title="At-Risk Students"
          value={riskSummary["At Risk"]}
          subtitle="Immediate attention needed"
          icon={AlertTriangle}
          variant={riskSummary["At Risk"] > 0 ? "danger" : "success"}
        />
        <StatsCard
          title="Excellent Standing"
          value={riskSummary["Excellent"]}
          subtitle="Attendance above 90%"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceChart data={trendData} />
        </div>
        <ClassOverviewChart
          present={todayOverall.present}
          absent={todayOverall.absent}
          late={todayOverall.late}
        />
      </div>

      {/* Risk summary */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Academic Risk Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {([
            { label: "At Risk",           count: riskSummary["At Risk"],           color: "bg-red-100 text-red-700"    },
            { label: "Needs Improvement", count: riskSummary["Needs Improvement"], color: "bg-orange-100 text-orange-700" },
            { label: "Good Standing",     count: riskSummary["Good Standing"],     color: "bg-blue-100 text-blue-700"  },
            { label: "Excellent",         count: riskSummary["Excellent"],         color: "bg-green-100 text-green-700"},
          ] as const).map(({ label, count, color }) => (
            <div key={label} className={`rounded-xl p-4 ${color}`}>
              <p className="text-3xl font-bold">{count}</p>
              <p className="text-xs font-medium mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
