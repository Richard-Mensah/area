"use client"

import { useMemo, useState } from "react"
import { Download } from "lucide-react"
import { useAttendance } from "@/hooks/useAttendance"
import { usePrediction } from "@/hooks/usePrediction"
import PredictionTable from "@/components/features/predictions/PredictionTable"
import Badge from "@/components/ui/Badge"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"
import { downloadCSV } from "@/lib/utils"
import { CLASSES } from "@/constants"
import type { RiskLevel } from "@/types"

const riskLevels: RiskLevel[] = ["At Risk", "Needs Improvement", "Good Standing", "Excellent"]

export default function PredictionsPage() {
  const { students, subjects, records, initialized } = useAttendance()
  const { predictions, getClassRiskSummary } = usePrediction(students, records, subjects)

  const [classFilter, setClassFilter] = useState("all")
  const [riskFilter, setRiskFilter]   = useState("all")

  const filtered = useMemo(() => {
    return predictions.filter((p) => {
      const matchClass = classFilter === "all" || p.studentClass === classFilter
      const matchRisk  = riskFilter  === "all" || p.riskLevel === riskFilter
      return matchClass && matchRisk
    })
  }, [predictions, classFilter, riskFilter])

  const riskSummary = useMemo(() => getClassRiskSummary(), [predictions])

  function handleExport() {
    const data = filtered.map((p) => ({
      Student:              p.studentName,
      Class:                p.studentClass,
      "Attendance %":       p.attendanceRate,
      "Risk Level":         p.riskLevel,
      "Predicted Grade":    p.gradeBand,
      "Consecutive Absent": p.consecutiveAbsences,
      "Late Rate %":        p.lateRate,
      Interventions:        p.interventions.join("; "),
    }))
    downloadCSV(data, "academic_predictions")
  }

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Risk summary chips */}
      <div className="flex flex-wrap gap-3">
        {riskLevels.map((level) => {
          const badge = level === "At Risk" ? "at-risk" :
                        level === "Needs Improvement" ? "needs-improvement" :
                        level === "Good Standing" ? "good" : "excellent"
          return (
            <div key={level} className="flex items-center gap-2 bg-white rounded-lg border border-gray-100 shadow-sm px-4 py-2">
              <span className="text-2xl font-bold text-gray-900">{riskSummary[level]}</span>
              <Badge variant={badge}>{level}</Badge>
            </div>
          )
        })}
      </div>

      {/* Filters + export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
        <div className="w-full sm:w-44">
          <Select
            label="Class"
            options={[
              { value: "all", label: "All Classes" },
              ...CLASSES.map((c) => ({ value: c, label: `Class ${c}` })),
            ]}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-52">
          <Select
            label="Risk Level"
            options={[
              { value: "all", label: "All Risk Levels" },
              ...riskLevels.map((r) => ({ value: r, label: r })),
            ]}
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} className="sm:mb-0.5">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {predictions.length} students
      </p>

      <PredictionTable predictions={filtered} />
    </div>
  )
}
