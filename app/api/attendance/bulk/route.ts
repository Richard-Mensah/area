import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"
import { getSession } from "@/lib/auth"
import type { AttendanceStatus } from "@/types"

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.role === "student") {
      return NextResponse.json({ error: "Teacher or admin access required" }, { status: 403 })
    }

    const body = await req.json() as {
      studentIds: string[]
      subjectId: string
      date: string
      status: AttendanceStatus
      class: string
    }
    const { studentIds, subjectId, date, status, class: cls } = body

    if (!Array.isArray(studentIds) || !subjectId || !date || !status || !cls) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    await connectDB()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: any[] = studentIds.map((studentId) => ({
      updateOne: {
        filter: { studentId, subjectId, date },
        update: { $set: { studentId, subjectId, date, status, class: cls, markedById: session.id } },
        upsert: true,
      },
    }))

    await AttendanceRecord.bulkWrite(ops)

    return NextResponse.json({ ok: true, count: studentIds.length })
  } catch (err) {
    console.error("[POST /api/attendance/bulk]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
