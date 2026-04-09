"use client"

import useSWR, { mutate as globalMutate } from "swr"
import { useCallback } from "react"
import type { AttendanceRecord, AttendanceStatus, Student, Subject } from "@/types"
import { downloadCSV, formatDate } from "@/lib/utils"
import { format } from "date-fns"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useAttendance(filters?: { date?: string; subjectId?: string; class?: string }) {
  const studentsSWR = useSWR<{ students: Student[] }>("/api/students", fetcher)
  const subjectsSWR = useSWR<{ subjects: Subject[] }>("/api/subjects", fetcher)

  // Build records URL from filters
  const params = new URLSearchParams()
  if (filters?.date) params.set("date", filters.date)
  if (filters?.subjectId) params.set("subjectId", filters.subjectId)
  if (filters?.class) params.set("class", filters.class)
  const recordsKey = `/api/attendance${params.toString() ? `?${params.toString()}` : ""}`

  const recordsSWR = useSWR<{ records: AttendanceRecord[] }>(recordsKey, fetcher)

  const students = studentsSWR.data?.students ?? []
  const subjects = subjectsSWR.data?.subjects ?? []
  const records = recordsSWR.data?.records ?? []
  const initialized = !studentsSWR.isLoading && !subjectsSWR.isLoading && !recordsSWR.isLoading

  const markAttendance = useCallback(async (
    studentId: string,
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    studentClass: string
  ) => {
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, subjectId, date, status, class: studentClass }),
    })
    globalMutate((key: string) => typeof key === "string" && key.startsWith("/api/attendance"))
  }, [])

  const bulkMark = useCallback(async (
    studentIds: string[],
    subjectId: string,
    date: string,
    status: AttendanceStatus,
    studentClass: string
  ) => {
    await fetch("/api/attendance/bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentIds, subjectId, date, status, class: studentClass }),
    })
    globalMutate((key: string) => typeof key === "string" && key.startsWith("/api/attendance"))
  }, [])

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
    // Expose mutate so pages can refresh data
    refresh: () => {
      studentsSWR.mutate()
      subjectsSWR.mutate()
      recordsSWR.mutate()
    },
  }
}
