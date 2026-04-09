"use client"

import { useMemo } from "react"
import { useAttendance } from "@/hooks/useAttendance"
import { usePrediction } from "@/hooks/usePrediction"
import PredictionCard from "@/components/features/predictions/PredictionCard"
import SubjectChart from "@/components/features/analytics/SubjectChart"
import { computeSubjectBreakdown } from "@/lib/attendance"

export default function MyPredictionPage() {
  const { students, subjects, records, initialized } = useAttendance()
  const { getPrediction } = usePrediction(students, records, subjects)

  const myStudent = students[0] ?? null
  const prediction = myStudent ? getPrediction(myStudent.id) : undefined

  const subjectData = useMemo(() => {
    if (!myStudent) return []
    const classSubjects = subjects.filter((s) => s.class === myStudent.class)
    return computeSubjectBreakdown(records, myStudent.id, classSubjects)
  }, [records, myStudent, subjects])

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="text-center text-gray-400 py-16">
        No prediction data available yet. Check back once attendance records are recorded.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Academic Prediction</h2>
        <p className="text-sm text-gray-500 mt-1">Based on your attendance patterns and subject performance</p>
      </div>

      <PredictionCard prediction={prediction} />

      <SubjectChart data={subjectData} />

      {/* Interventions */}
      {prediction.interventions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-amber-800 mb-3">Recommended Actions</h3>
          <ul className="space-y-2">
            {prediction.interventions.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-amber-700">
                <span className="text-amber-500 font-bold">→</span>{item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
