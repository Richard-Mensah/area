import { format, parseISO, subDays } from "date-fns"
import type { AttendanceRecord, AttendanceStatus, ChartDataPoint, Student, Subject, SubjectChartPoint } from "@/types"
import { SEED_STUDENTS, SEED_SUBJECTS } from "@/constants"
import { generateId, isWeekday } from "@/lib/utils"

export function computeAttendanceRate(
  records: AttendanceRecord[],
  studentId: string,
  subjectId?: string
): number {
  let filtered = records.filter((r) => r.studentId === studentId && r.status !== "unmarked")
  if (subjectId) filtered = filtered.filter((r) => r.subjectId === subjectId)
  if (filtered.length === 0) return 0
  const present = filtered.filter((r) => r.status === "present").length
  const late = filtered.filter((r) => r.status === "late").length
  return Math.round(((present + late * 0.5) / filtered.length) * 100)
}

export function computeTrend(
  records: AttendanceRecord[],
  days: number,
  selectedClass?: string
): ChartDataPoint[] {
  const result: ChartDataPoint[] = []
  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd")
    let dayRecords = records.filter((r) => r.date === date)
    if (selectedClass) dayRecords = dayRecords.filter((r) => r.class === selectedClass)
    const uniqueStudents = new Set(dayRecords.map((r) => r.studentId))
    let present = 0, absent = 0, late = 0
    uniqueStudents.forEach((sid) => {
      const statuses = dayRecords.filter((r) => r.studentId === sid).map((r) => r.status)
      if (statuses.includes("present")) present++
      else if (statuses.includes("late")) late++
      else if (statuses.includes("absent")) absent++
    })
    result.push({ date: format(parseISO(date), "MM/dd"), present, absent, late })
  }
  return result
}

export function findConsecutiveAbsences(
  records: AttendanceRecord[],
  studentId: string
): number {
  const studentRecords = records
    .filter((r) => r.studentId === studentId && r.status !== "unmarked")
    .sort((a, b) => b.date.localeCompare(a.date))

  let streak = 0
  for (const r of studentRecords) {
    if (r.status === "absent") streak++
    else break
  }
  return streak
}

export function computeSubjectBreakdown(
  records: AttendanceRecord[],
  studentId: string,
  subjects: Subject[]
): SubjectChartPoint[] {
  return subjects.map((sub) => {
    const rate = computeAttendanceRate(records, studentId, sub.id)
    let risk: "At Risk" | "Needs Improvement" | "Good Standing" | "Excellent" = "Excellent"
    if (rate < 60) risk = "At Risk"
    else if (rate < 75) risk = "Needs Improvement"
    else if (rate < 90) risk = "Good Standing"
    return { subject: sub.name, rate, risk }
  })
}

export function seedAttendanceHistory(
  students: Student[],
  subjects: Subject[],
  days: number
): AttendanceRecord[] {
  const records: AttendanceRecord[] = []

  // Some students have deliberately low attendance for demo purposes
  const lowAttendanceStudents = new Set(["s4", "s8", "s11"])
  const mediumAttendanceStudents = new Set(["s2", "s6", "s9"])

  for (let i = days - 1; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "yyyy-MM-dd")
    if (!isWeekday(date)) continue

    for (const student of students) {
      const classSubjects = subjects.filter((sub) => sub.class === student.class)
      for (const subject of classSubjects) {
        let rand = Math.random()
        let status: AttendanceStatus

        if (lowAttendanceStudents.has(student.id)) {
          // ~45% present, 45% absent, 10% late
          status = rand < 0.45 ? "present" : rand < 0.90 ? "absent" : "late"
        } else if (mediumAttendanceStudents.has(student.id)) {
          // ~68% present, 20% absent, 12% late
          status = rand < 0.68 ? "present" : rand < 0.88 ? "absent" : "late"
        } else {
          // ~80% present, 12% absent, 8% late
          status = rand < 0.80 ? "present" : rand < 0.92 ? "absent" : "late"
        }

        records.push({
          id: generateId(),
          studentId: student.id,
          subjectId: subject.id,
          date,
          status,
          class: student.class,
        })
      }
    }
  }
  return records
}

export function getClassAttendanceToday(
  records: AttendanceRecord[],
  students: Student[],
  selectedClass: string
): { present: number; absent: number; late: number; total: number } {
  const today = format(new Date(), "yyyy-MM-dd")
  const classStudents = students.filter((s) => s.class === selectedClass)
  const todayRecords = records.filter(
    (r) => r.date === today && r.class === selectedClass
  )

  const counted = new Set<string>()
  let present = 0, absent = 0, late = 0

  for (const r of todayRecords) {
    if (counted.has(r.studentId)) continue
    counted.add(r.studentId)
    if (r.status === "present") present++
    else if (r.status === "absent") absent++
    else if (r.status === "late") late++
  }

  return { present, absent, late, total: classStudents.length }
}

export function getDefaultStudents(): Student[] {
  return SEED_STUDENTS.map((s, i) => ({ ...s, id: `s${i + 1}` }))
}

export function getDefaultSubjects(): Subject[] {
  return SEED_SUBJECTS.map((s, i) => ({ ...s, id: `sub${i + 1}`, teacherId: "" }))
}
