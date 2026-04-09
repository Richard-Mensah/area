"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import type { Prediction, RiskLevel } from "@/types"
import { cn } from "@/lib/utils"

type Props = { predictions: Prediction[] }

type SortKey = "studentName" | "attendanceRate" | "riskLevel" | "gradeBand" | "consecutiveAbsences"

const riskBadge: Record<RiskLevel, "at-risk" | "needs-improvement" | "good" | "excellent"> = {
  "At Risk":           "at-risk",
  "Needs Improvement": "needs-improvement",
  "Good Standing":     "good",
  "Excellent":         "excellent",
}

export default function PredictionTable({ predictions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("attendanceRate")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [selected, setSelected] = useState<Prediction | null>(null)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const sorted = [...predictions].sort((a, b) => {
    const va = a[sortKey]
    const vb = b[sortKey]
    const cmp = typeof va === "string" ? va.localeCompare(String(vb)) : (va as number) - (vb as number)
    return sortDir === "asc" ? cmp : -cmp
  })

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp className="w-3 h-3 opacity-30" />
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3" />
      : <ChevronDown className="w-3 h-3" />
  }

  function Th({ label, k }: { label: string; k: SortKey }) {
    return (
      <th
        className="text-left px-4 py-3 text-gray-600 font-medium text-xs uppercase tracking-wide cursor-pointer hover:text-gray-900 select-none"
        onClick={() => handleSort(k)}
      >
        <div className="flex items-center gap-1">
          {label}
          <SortIcon k={k} />
        </div>
      </th>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <Th label="Student"             k="studentName"          />
                <th className="text-left px-4 py-3 text-gray-600 font-medium text-xs uppercase tracking-wide">Class</th>
                <Th label="Attendance %"        k="attendanceRate"       />
                <Th label="Risk Level"          k="riskLevel"            />
                <Th label="Predicted Grade"     k="gradeBand"            />
                <Th label="Consecutive Absent"  k="consecutiveAbsences"  />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr
                  key={p.studentId}
                  className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelected(p)}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">{p.studentName}</td>
                  <td className="px-4 py-3 text-gray-500">{p.studentClass}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            p.attendanceRate >= 90 ? "bg-green-500" :
                            p.attendanceRate >= 75 ? "bg-blue-500"  :
                            p.attendanceRate >= 60 ? "bg-yellow-500": "bg-red-500"
                          )}
                          style={{ width: `${p.attendanceRate}%` }}
                        />
                      </div>
                      <span className="text-gray-700">{p.attendanceRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={riskBadge[p.riskLevel]}>{p.riskLevel}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-gray-900 text-base">{p.gradeBand}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn(
                      "font-medium",
                      p.consecutiveAbsences >= 3 ? "text-red-600" : "text-gray-700"
                    )}>
                      {p.consecutiveAbsences}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-blue-600 text-xs font-medium">Details →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `${selected.studentName} — Prediction Details` : ""}
        className="max-w-xl"
      >
        {selected && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{selected.attendanceRate}%</p>
                <p className="text-xs text-gray-500">Attendance</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{selected.gradeBand}</p>
                <p className="text-xs text-gray-500">Predicted Grade</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{selected.consecutiveAbsences}</p>
                <p className="text-xs text-gray-500">Consec. Absences</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Subject Breakdown</p>
              <div className="flex flex-col gap-2">
                {selected.subjectBreakdown.map((s) => (
                  <div key={s.subjectId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{s.subjectName}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-1.5">
                        <div
                          className={cn(
                            "h-1.5 rounded-full",
                            s.rate >= 90 ? "bg-green-500" :
                            s.rate >= 75 ? "bg-blue-500"  :
                            s.rate >= 60 ? "bg-yellow-500": "bg-red-500"
                          )}
                          style={{ width: `${s.rate}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600 w-10 text-right">{s.rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Recommended Interventions</p>
              <ul className="flex flex-col gap-1.5">
                {selected.interventions.map((msg, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-blue-500 mt-0.5">•</span>
                    {msg}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
