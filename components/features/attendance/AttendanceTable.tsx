"use client"

import { cn } from "@/lib/utils"
import Badge from "@/components/ui/Badge"
import type { AttendanceRecord, AttendanceStatus, Student } from "@/types"

type Props = {
  students: Student[]
  records: AttendanceRecord[]
  subjectId: string
  date: string
  onMark: (studentId: string, status: AttendanceStatus) => void
}

const statusOptions: { value: AttendanceStatus; label: string }[] = [
  { value: "present", label: "Present" },
  { value: "absent",  label: "Absent"  },
  { value: "late",    label: "Late"    },
]

const badgeVariant = (status: AttendanceStatus) => {
  if (status === "present") return "present"
  if (status === "absent")  return "absent"
  if (status === "late")    return "late"
  return "unmarked"
}

export default function AttendanceTable({ students, records, subjectId, date, onMark }: Props) {
  function getStatus(studentId: string): AttendanceStatus {
    const r = records.find(
      (rec) => rec.studentId === studentId && rec.subjectId === subjectId && rec.date === date
    )
    return r?.status ?? "unmarked"
  }

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
        No students found for the selected class.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-600 font-medium w-10">#</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Student Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Roll No.</th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">Attendance</th>
              <th className="text-center px-4 py-3 text-gray-600 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student, idx) => {
              const current = getStatus(student.id)
              return (
                <tr
                  key={student.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 text-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{student.name}</td>
                  <td className="px-4 py-3 text-gray-500">{student.roll}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-center gap-2">
                      {statusOptions.map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => onMark(student.id, value)}
                          className={cn(
                            "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                            current === value
                              ? value === "present"
                                ? "bg-green-500 text-white border-green-500"
                                : value === "absent"
                                ? "bg-red-500 text-white border-red-500"
                                : "bg-yellow-400 text-white border-yellow-400"
                              : "bg-white text-gray-500 border-gray-200 hover:border-gray-400"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant={badgeVariant(current)}>
                      {current.charAt(0).toUpperCase() + current.slice(1)}
                    </Badge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
