import type { AttendanceRecord, GradeBand, Prediction, RiskLevel, Student, Subject, SubjectBreakdown } from "@/types"
import { RISK_THRESHOLDS } from "@/constants"
import { computeAttendanceRate, findConsecutiveAbsences } from "@/lib/attendance"

function rateToRisk(rate: number): RiskLevel {
  if (rate < RISK_THRESHOLDS.AT_RISK) return "At Risk"
  if (rate < RISK_THRESHOLDS.NEEDS_IMPROVEMENT) return "Needs Improvement"
  if (rate < RISK_THRESHOLDS.GOOD_STANDING) return "Good Standing"
  return "Excellent"
}

function riskToGrade(risk: RiskLevel, lowestSubjectRate: number): GradeBand {
  let base: GradeBand
  if (risk === "At Risk") base = "F"
  else if (risk === "Needs Improvement") base = "D"
  else if (risk === "Good Standing") base = "B"
  else base = "A"

  // Drop one grade band if any single subject is critically low
  if (lowestSubjectRate < 50) {
    const ladder: GradeBand[] = ["A", "B", "C", "D", "F"]
    const idx = ladder.indexOf(base)
    return ladder[Math.min(idx + 1, ladder.length - 1)]
  }
  return base
}

function buildInterventions(
  baseRate: number,
  lateRate: number,
  streak: number,
  subjectBreakdown: SubjectBreakdown[]
): string[] {
  const interventions: string[] = []

  if (streak >= 3) {
    interventions.push("Immediate contact with parents/guardians required")
  }
  if (baseRate < RISK_THRESHOLDS.AT_RISK) {
    interventions.push("Refer to school counselor for welfare check")
  }
  if (lateRate > 25) {
    interventions.push("Investigate commute or morning schedule issues")
  }
  subjectBreakdown.forEach((s) => {
    if (s.rate < RISK_THRESHOLDS.AT_RISK) {
      interventions.push(`Targeted tutoring in ${s.subjectName}`)
    }
  })
  if (baseRate >= RISK_THRESHOLDS.GOOD_STANDING) {
    interventions.push("Maintain excellent attendance — recognition recommended")
  }
  if (interventions.length === 0) {
    interventions.push("Continue monitoring attendance regularly")
  }
  return interventions
}

export function predictStudent(
  student: Student,
  records: AttendanceRecord[],
  subjects: Subject[]
): Prediction {
  const studentRecords = records.filter(
    (r) => r.studentId === student.id && r.status !== "unmarked"
  )

  const totalRecords = studentRecords.length
  if (totalRecords === 0) {
    return {
      studentId: student.id,
      studentName: student.name,
      studentClass: student.class,
      riskLevel: "Excellent",
      gradeBand: "A",
      attendanceRate: 100,
      consecutiveAbsences: 0,
      lateRate: 0,
      subjectBreakdown: [],
      interventions: ["No attendance data available yet"],
    }
  }

  // Step 1: Base attendance rate (late = 0.5 present)
  const presentCount = studentRecords.filter((r) => r.status === "present").length
  const lateCount = studentRecords.filter((r) => r.status === "late").length
  const absentCount = studentRecords.filter((r) => r.status === "absent").length
  const baseRate = Math.round(((presentCount + lateCount * 0.5) / totalRecords) * 100)
  const lateRate = Math.round((lateCount / totalRecords) * 100)

  // Step 2: Per-subject rates
  const classSubjects = subjects.filter((s) => s.class === student.class)
  const subjectBreakdown: SubjectBreakdown[] = classSubjects.map((sub) => {
    const rate = computeAttendanceRate(records, student.id, sub.id)
    return {
      subjectId: sub.id,
      subjectName: sub.name,
      rate,
      risk: rateToRisk(rate),
    }
  })

  // Step 3: Consecutive absence penalty
  const streak = findConsecutiveAbsences(records, student.id)
  const penalty = streak >= 7 ? 15 : streak >= 5 ? 10 : streak >= 3 ? 5 : 0
  let adjustedRate = baseRate - penalty

  // Step 4: Late pattern penalty
  if (lateRate > 20) adjustedRate -= 3
  adjustedRate = Math.max(0, adjustedRate)

  // Step 5: Risk level
  const riskLevel = rateToRisk(adjustedRate)

  // Step 6: Grade band
  const lowestSubjectRate =
    subjectBreakdown.length > 0
      ? Math.min(...subjectBreakdown.map((s) => s.rate))
      : adjustedRate
  const gradeBand = riskToGrade(riskLevel, lowestSubjectRate)

  // Step 7: Interventions
  const interventions = buildInterventions(adjustedRate, lateRate, streak, subjectBreakdown)

  return {
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    riskLevel,
    gradeBand,
    attendanceRate: adjustedRate,
    consecutiveAbsences: streak,
    lateRate,
    subjectBreakdown,
    interventions,
  }
}

export function predictAll(
  students: Student[],
  records: AttendanceRecord[],
  subjects: Subject[]
): Prediction[] {
  return students.map((s) => predictStudent(s, records, subjects))
}
