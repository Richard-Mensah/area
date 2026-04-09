"use client"

import { useState } from "react"
import useSWR from "swr"
import { Plus, Trash2, Edit2, Shield, User, GraduationCap } from "lucide-react"
import Button from "@/components/ui/Button"
import Badge from "@/components/ui/Badge"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { useToast } from "@/components/ui/Toast"
import type { UserRole } from "@/types"

type UserRow = { id: string; name: string; email: string; role: UserRole; hasFace: boolean; createdAt: string }

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const roleIcon: Record<UserRole, React.ElementType> = {
  admin: Shield, teacher: User, student: GraduationCap,
}
const roleBadge: Record<UserRole, "at-risk" | "good" | "excellent"> = {
  admin: "at-risk", teacher: "good", student: "excellent",
}

export default function UserTable() {
  const { toast } = useToast()
  const { data, mutate } = useSWR<{ users: UserRow[] }>("/api/users", fetcher)
  const users = data?.users ?? []

  const [addOpen, setAddOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "teacher" as UserRole })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    setSaving(true)
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (!res.ok) {
      const { error } = await res.json() as { error: string }
      toast(error, "error"); return
    }
    toast("User created successfully", "success")
    setAddOpen(false)
    setForm({ name: "", email: "", password: "", role: "teacher" })
    mutate()
  }

  async function handleEdit() {
    if (!editUser) return
    setSaving(true)
    const res = await fetch(`/api/users/${editUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) }),
    })
    setSaving(false)
    if (!res.ok) { toast("Update failed", "error"); return }
    toast("User updated", "success")
    setEditUser(null)
    mutate()
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    const res = await fetch(`/api/users/${id}`, { method: "DELETE" })
    if (!res.ok) { toast("Delete failed", "error"); return }
    toast("User deleted", "success")
    mutate()
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">System Users</h3>
        <Button variant="primary" size="sm" onClick={() => { setForm({ name: "", email: "", password: "", role: "teacher" }); setAddOpen(true) }}>
          <Plus className="w-4 h-4" /> Add User
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">Face Enrolled</th>
              <th className="text-right px-4 py-3 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const RoleIcon = roleIcon[u.role]
              return (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                    <RoleIcon className="w-4 h-4 text-gray-400" />{u.name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleBadge[u.role]}>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.hasFace ? "✓ Yes" : "–"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditUser(u); setForm({ name: u.name, email: u.email, password: "", role: u.role }) }}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                      ><Edit2 className="w-4 h-4" /></button>
                      <button
                        onClick={() => handleDelete(u.id, u.name)}
                        className="p-1.5 rounded hover:bg-red-50 text-red-400"
                      ><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="Password" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            options={[{ value: "teacher", label: "Teacher" }, { value: "admin", label: "Admin" }, { value: "student", label: "Student" }]}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleAdd}>Create User</Button>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input label="New Password (leave blank to keep)" type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          <Select
            label="Role"
            value={form.role}
            onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
            options={[{ value: "teacher", label: "Teacher" }, { value: "admin", label: "Admin" }, { value: "student", label: "Student" }]}
          />
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setEditUser(null)}>Cancel</Button>
            <Button variant="primary" className="flex-1" loading={saving} onClick={handleEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
