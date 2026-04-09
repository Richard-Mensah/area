"use client"

import Select from "@/components/ui/Select"
import Input from "@/components/ui/Input"
import Button from "@/components/ui/Button"
import { CLASSES } from "@/constants"
import type { Subject } from "@/types"
import { format } from "date-fns"

type Props = {
  selectedClass: string
  selectedSubject: string
  selectedDate: string
  subjects: Subject[]
  onClassChange: (v: string) => void
  onSubjectChange: (v: string) => void
  onDateChange: (v: string) => void
  onMarkAll: (status: "present" | "absent") => void
}

export default function AttendanceControls({
  selectedClass,
  selectedSubject,
  selectedDate,
  subjects,
  onClassChange,
  onSubjectChange,
  onDateChange,
  onMarkAll,
}: Props) {
  const classSubjects = subjects.filter((s) => s.class === selectedClass)
  const subjectOptions = classSubjects.map((s) => ({ value: s.id, label: s.name }))
  const classOptions = CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Select
          label="Class"
          options={classOptions}
          value={selectedClass}
          onChange={(e) => onClassChange(e.target.value)}
        />
        <Select
          label="Subject"
          options={subjectOptions.length > 0 ? subjectOptions : [{ value: "", label: "No subjects" }]}
          value={selectedSubject}
          onChange={(e) => onSubjectChange(e.target.value)}
        />
        <Input
          label="Date"
          type="date"
          value={selectedDate}
          max={format(new Date(), "yyyy-MM-dd")}
          onChange={(e) => onDateChange(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <Button variant="secondary" size="sm" onClick={() => onMarkAll("present")}>
          Mark All Present
        </Button>
        <Button variant="secondary" size="sm" onClick={() => onMarkAll("absent")}>
          Mark All Absent
        </Button>
      </div>
    </div>
  )
}
