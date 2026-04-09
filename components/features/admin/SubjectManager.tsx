"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Trash2, Edit2 } from "lucide-react"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { useToast } from "@/components/ui/Toast"
import type { Subject } from "@/types"
import { CLASSES } from "@/constants"

type UserOption = { id: string; name: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SubjectManager() {
  const { toast } = useToast()
  const { data: subjData, mutate } = useSWR<{ subjects: Subject[] }>("/api/subjects", fetcher)
  const { data: userData } = useSWR<{ users: UserOption[] }>("/api/users", fetcher)

  const subjects = subjData?.subjects ?? []
  const teachers = (userData?.users ?? []).filter((u) => (u as { role?: string }).role === "teacher" || (u as { role?: string }).role === "admin")

  const [addOpen, setAddOpen] = useState(false)
  const [editSubj, setEditSubj] = useState<Subject | null>(null)
  const [form, setForm] = useState({ name: "", code: "", class: "10A", teacherId: "" })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    setSaving(true)
    const res = await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) { const { error } = await res.json() as { error: string }; toast(error, "error"); return }
    toast("Subject created", "success")
    setAddOpen(false)
    setForm({ name: "", code: "", class: "10A", teacherId: "" })
    mutate()
  }

  async function handleEdit() {
    if (!editSubj) return
    setSaving(true)
    const res = await fetch(`/api/subjects/${editSubj.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) { toast("Update failed", "error"); return }
    toast("Subject updated", "success")
    setEditSubj(null)
    mutate()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete subject "${name}"?`)) return
    const res = await fetch(`/api/subjects/${id}`, { method: "DELETE" })
    if (!res.ok) { toast("Delete failed", "error"); return }
    toast("Subject deleted", "success")
    mutate()
  }

  const SubjectForm = () => (
    <div className="flex flex-col gap-4">
      <Input label="Subject Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Input label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
      <Select
        label="Class"
        value={form.class}
        onChange={(e) => setForm((f) => ({ ...f, class: e.target.value }))}
        options={CLASSES.map((c) => ({ value: c, label: c }))}
      />
      <Select
        label="Assigned Teacher"
        value={form.teacherId}
        onChange={(e) => setForm((f) => ({ ...f, teacherId: e.target.value }))}
        options={[{ value: "", label: "— Select teacher —" }, ...teachers.map((t) => ({ value: t.id, label: t.name }))]}
      />
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Subjects</h3>
        <Button variant="primary" size="sm" onClick={() => { setForm({ name: "", code: "", class: "10A", teacherId: "" }); setAddOpen(true) }}>
          <Plus className="w-4 h-4" /> Add Subject
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Subject</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Code</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Class</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Teacher</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-500 font-mono text-xs">{s.code}</td>
                <td className="px-4 py-3 text-gray-700">{s.class}</td>
                <td className="px-4 py-3 text-gray-700">{s.teacher}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => { setEditSubj(s); setForm({ name: s.name, code: s.code, class: s.class, teacherId: s.teacherId }) }}
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                    ><Edit2 className="w-4 h-4" /></button>
                    <button
                      onClick={() => handleDelete(s.id, s.name)}
                      className="p-1.5 rounded hover:bg-red-50 text-red-400"
                    ><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Subject">
        <div className="flex flex-col gap-4">
          <SubjectForm />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleAdd}>Create</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!editSubj} onClose={() => setEditSubj(null)} title="Edit Subject">
        <div className="flex flex-col gap-4">
          <SubjectForm />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setEditSubj(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleEdit}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
