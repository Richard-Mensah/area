"use client"

import { useMemo } from "react"
import type { AttendanceRecord, Prediction, RiskLevel, Student, Subject } from "@/types"
import { predictAll, predictStudent } from "@/lib/prediction"

export function usePrediction(
  students: Student[],
  records: AttendanceRecord[],
  subjects: Subject[]
) {
  const predictions = useMemo<Prediction[]>(() => {
    if (students.length === 0 || records.length === 0) return []
    return predictAll(students, records, subjects)
  }, [students, records, subjects])

  function getPrediction(studentId: string): Prediction | undefined {
    return predictions.find((p) => p.studentId === studentId)
  }

  function getClassRiskSummary(selectedClass?: string): Record<RiskLevel, number> {
    const filtered = selectedClass
      ? predictions.filter((p) => p.studentClass === selectedClass)
      : predictions
    const summary: Record<RiskLevel, number> = {
      "At Risk": 0,
      "Needs Improvement": 0,
      "Good Standing": 0,
      Excellent: 0,
    }
    for (const p of filtered) {
      summary[p.riskLevel]++
    }
    return summary
  }

  function computeSinglePrediction(student: Student): Prediction {
    return predictStudent(student, records, subjects)
  }

  return { predictions, getPrediction, getClassRiskSummary, computeSinglePrediction }
}
