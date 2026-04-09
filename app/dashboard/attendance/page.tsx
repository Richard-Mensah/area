"use client"

import { useState, useMemo } from "react"
import { format } from "date-fns"
import { Save, Download } from "lucide-react"
import { useAttendance } from "@/hooks/useAttendance"
import AttendanceControls from "@/components/features/attendance/AttendanceControls"
import AttendanceTable from "@/components/features/attendance/AttendanceTable"
import AttendanceSummary from "@/components/features/attendance/AttendanceSummary"
import Button from "@/components/ui/Button"
import { useToast } from "@/components/ui/Toast"
import type { AttendanceStatus } from "@/types"

export default function AttendancePage() {
  const { students, subjects, records, initialized, markAttendance, bulkMark, exportToCSV } = useAttendance()
  const { toast } = useToast()

  const [selectedClass, setSelectedClass]     = useState("10A")
  const [selectedDate, setSelectedDate]       = useState(format(new Date(), "yyyy-MM-dd"))
  const [selectedSubject, setSelectedSubject] = useState("")

  // Sync subject when class changes
  const classSubjects = useMemo(
    () => subjects.filter((s) => s.class === selectedClass),
    [subjects, selectedClass]
  )

  const currentSubjectId = selectedSubject && classSubjects.find((s) => s.id === selectedSubject)
    ? selectedSubject
    : classSubjects[0]?.id ?? ""

  const classStudents = useMemo(
    () => students.filter((s) => s.class === selectedClass),
    [students, selectedClass]
  )

  const dayRecords = useMemo(
    () => records.filter((r) => r.date === selectedDate && r.class === selectedClass),
    [records, selectedDate, selectedClass]
  )

  const summary = useMemo(() => {
    const seen = new Set<string>()
    let present = 0, absent = 0, late = 0
    for (const r of dayRecords) {
      if (seen.has(r.studentId) || r.subjectId !== currentSubjectId) continue
      seen.add(r.studentId)
      if (r.status === "present") present++
      else if (r.status === "absent") absent++
      else if (r.status === "late") late++
    }
    return { present, absent, late, total: classStudents.length }
  }, [dayRecords, classStudents, currentSubjectId])

  function handleMark(studentId: string, status: AttendanceStatus) {
    markAttendance(studentId, currentSubjectId, selectedDate, status, selectedClass)
  }

  function handleMarkAll(status: "present" | "absent") {
    bulkMark(
      classStudents.map((s) => s.id),
      currentSubjectId,
      selectedDate,
      status,
      selectedClass
    )
    toast(`Marked all students as ${status}`, "success")
  }

  function handleSave() {
    const unmarked = classStudents.filter(
      (s) => !dayRecords.some((r) => r.studentId === s.id && r.subjectId === currentSubjectId)
    )
    if (unmarked.length > 0) {
      toast(`${unmarked.length} student(s) not yet marked. Please mark all before saving.`, "error")
      return
    }
    toast("Attendance saved successfully!", "success")
  }

  function handleClassChange(cls: string) {
    setSelectedClass(cls)
    setSelectedSubject("")
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
      <AttendanceControls
        selectedClass={selectedClass}
        selectedSubject={currentSubjectId}
        selectedDate={selectedDate}
        subjects={subjects}
        onClassChange={handleClassChange}
        onSubjectChange={setSelectedSubject}
        onDateChange={setSelectedDate}
        onMarkAll={handleMarkAll}
      />

      <AttendanceSummary {...summary} />

      <AttendanceTable
        students={classStudents}
        records={dayRecords}
        subjectId={currentSubjectId}
        date={selectedDate}
        onMark={handleMark}
      />

      <div className="flex gap-3 justify-end">
        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
        <Button variant="primary" size="sm" onClick={handleSave}>
          <Save className="w-4 h-4" />
          Save Attendance
        </Button>
      </div>
    </div>
  )
}
