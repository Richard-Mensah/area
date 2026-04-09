"use client"

import { useEffect, useState } from "react"
import type { AttendanceRecord, AttendanceStatus, Student, Subject } from "@/types"
import { SEED_STUDENTS, SEED_SUBJECTS } from "@/constants"
import { seedAttendanceHistory } from "@/lib/attendance"
import { downloadCSV, formatDate } from "@/lib/utils"
import { format } from "date-fns"

const RECORDS_KEY = "attendance_app_records"
const STUDENTS_KEY = "attendance_app_students"
const SUBJECTS_KEY = "attendance_app_subjects"

function getFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  localStorage.setItem(key, JSON.stringify(value))
}

export function useAttendance() {
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [records, setRecords] = useState<AttendanceRecord[]>([])
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const storedStudents = getFromStorage<Student[]>(STUDENTS_KEY, [])
    const storedSubjects = getFromStorage<Subject[]>(SUBJECTS_KEY, [])
    let storedRecords = getFromStorage<AttendanceRecord[]>(RECORDS_KEY, [])

    const finalStudents = storedStudents.length > 0 ? storedStudents : SEED_STUDENTS
    const finalSubjects = storedSubjects.length > 0 ? storedSubjects : SEED_SUBJECTS

    if (storedStudents.length === 0) saveToStorage(STUDENTS_KEY, SEED_STUDENTS)
    if (storedSubjects.length === 0) saveToStorage(SUBJECTS_KEY, SEED_SUBJECTS)

    if (storedRecords.length === 0) {
      storedRecords = seedAttendanceHistory(finalStudents, finalSubjects, 60)
      saveToStorage(RECORDS_KEY, storedRecords)
    }

    setStudents(finalStudents)
    setSubjects(finalSubjects)
    setRecords(storedRecords)
    setInitialized(true)
  }, [])

  function markAttendance(
    studentId: string,
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    studentClass: string
  ) {
    setRecords((prev) => {
      const existing = prev.findIndex(
        (r) => r.studentId === studentId && r.subjectId === subjectId && r.date === date
      )
      let updated: AttendanceRecord[]
      if (existing >= 0) {
        updated = prev.map((r, i) => (i === existing ? { ...r, status } : r))
      } else {
        updated = [
          ...prev,
          {
            id: `${studentId}-${subjectId}-${date}`,
            studentId,
            subjectId,
            date,
            status,
            class: studentClass,
          },
        ]
      }
      saveToStorage(RECORDS_KEY, updated)
      return updated
    })
  }

  function bulkMark(
    studentIds: string[],
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    studentClass: string
  ) {
    setRecords((prev) => {
      let updated = [...prev]
      for (const studentId of studentIds) {
        const existing = updated.findIndex(
          (r) => r.studentId === studentId && r.subjectId === subjectId && r.date === date
        )
        if (existing >= 0) {
          updated[existing] = { ...updated[existing], status }
        } else {
          updated.push({
            id: `${studentId}-${subjectId}-${date}`,
            studentId,
            subjectId,
            date,
            status,
            class: studentClass,
          })
        }
      }
      saveToStorage(RECORDS_KEY, updated)
      return updated
    })
  }

  function getRecordsForDate(date: string, selectedClass?: string): AttendanceRecord[] {
    return records.filter(
      (r) => r.date === date && (!selectedClass || r.class === selectedClass)
    )
  }

  function getRecordsForStudent(studentId: string): AttendanceRecord[] {
    return records.filter((r) => r.studentId === studentId)
  }

  function exportToCSV() {
    const data = records.map((r) => {
      const student = students.find((s) => s.id === r.studentId)
      const subject = subjects.find((s) => s.id === r.subjectId)
      return {
        Date: formatDate(r.date),
        Student: student?.name ?? r.studentId,
        Roll: student?.roll ?? "",
        Class: r.class,
        Subject: subject?.name ?? r.subjectId,
        Status: r.status,
      }
    })
    downloadCSV(data, `attendance_export_${format(new Date(), "yyyy-MM-dd")}`)
  }

  return {
    students,
    subjects,
    records,
    initialized,
    markAttendance,
    bulkMark,
    getRecordsForDate,
    getRecordsForStudent,
    exportToCSV,
  }
}
