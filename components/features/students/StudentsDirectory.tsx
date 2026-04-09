"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Plus, Trash2 } from "lucide-react"
import { useAttendance } from "@/hooks/useAttendance"
import { usePrediction } from "@/hooks/usePrediction"
import Badge from "@/components/ui/Badge"
import Select from "@/components/ui/Select"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import { useToast } from "@/components/ui/Toast"
import { CLASSES } from "@/constants"
import { cn } from "@/lib/utils"
import type { RiskLevel, UserRole, Student } from "@/types"
import useSWR from "swr"

const riskBadge: Record<RiskLevel, "at-risk" | "needs-improvement" | "good" | "excellent"> = {
  "At Risk": "at-risk", "Needs Improvement": "needs-improvement",
  "Good Standing": "good", Excellent: "excellent",
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Props = { role: UserRole }

export default function StudentsDirectory({ role }: Props) {
  const { students, subjects, records, initialized, refresh } = useAttendance()
  const { data: studentsData, mutate } = useSWR("/api/students", fetcher)
  const allStudents: Student[] = (studentsData?.students ?? students) as Student[]
  const { predictions } = usePrediction(allStudents, records, subjects)
  const { toast } = useToast()

  const [search, setSearch] = useState("")
  const [classFilter, setClassFilter] = useState("all")
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState({ name: "", roll: "", class: "10A", email: "" })
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() =>
    allStudents.filter((s) => {
      const matchClass = classFilter === "all" || s.class === classFilter
      const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search)
      return matchClass && matchSearch
    }), [allStudents, search, classFilter])

  async function handleAddStudent() {
    setSaving(true)
    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) { const { error } = await res.json() as { error: string }; toast(error, "error"); return }
    toast("Student added successfully", "success")
    setAddOpen(false)
    setForm({ name: "", roll: "", class: "10A", email: "" })
    mutate(); refresh()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from the system? This cannot be undone.`)) return
    const res = await fetch(`/api/students/${id}`, { method: "DELETE" })
    if (!res.ok) { toast("Delete failed", "error"); return }
    toast("Student removed", "success")
    mutate(); refresh()
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
      {/* Filters + admin add button */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or roll number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="w-full sm:w-44">
          <Select
            options={[{ value: "all", label: "All Classes" }, ...CLASSES.map((c) => ({ value: c, label: `Class ${c}` }))]}
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
          />
        </div>
        {role === "admin" && (
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((student) => {
          const pred = predictions.find((p) => p.studentId === student.id)
          return (
            <div key={student.id} className="relative group">
              <Link
                href={`/dashboard/students/${student.id}`}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:border-blue-200 transition-all block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{student.name}</p>
                    <p className="text-xs text-gray-500">Roll {student.roll} · Class {student.class}</p>
                  </div>
                </div>
                {pred && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">Attendance</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className={cn("h-1.5 rounded-full",
                              pred.attendanceRate >= 90 ? "bg-green-500" :
                              pred.attendanceRate >= 75 ? "bg-blue-500" :
                              pred.attendanceRate >= 60 ? "bg-yellow-500" : "bg-red-500")}
                            style={{ width: `${pred.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-gray-700">{pred.attendanceRate}%</span>
                      </div>
                    </div>
                    <Badge variant={riskBadge[pred.riskLevel]}>{pred.riskLevel}</Badge>
                  </div>
                )}
              </Link>
              {role === "admin" && (
                <button
                  onClick={() => handleDelete(student.id, student.name)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-white border border-gray-100 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                  title="Remove student"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-gray-400 py-16">No students found matching your search.</div>
      )}

      {/* Add student modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New Student">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Roll Number" value={form.roll} onChange={(e) => setForm((f) => ({ ...f, roll: e.target.value }))} />
          <Select
            label="Class"
            value={form.class}
            onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}
            options={CLASSES.map((c) => ({ value: c, label: c }))}
          />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleAddStudent}>Add Student</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
