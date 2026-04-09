import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import AttendanceRecord from "@/lib/models/AttendanceRecord"
import SubjectModel from "@/lib/models/Subject"
import { getSession } from "@/lib/auth"

export async function GET(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const date = searchParams.get("date")
    const studentId = searchParams.get("studentId")
    const subjectId = searchParams.get("subjectId")
    const cls = searchParams.get("class")

    await connectDB()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: Record<string, any> = {}
    if (date) query.date = date
    if (subjectId) query.subjectId = subjectId
    if (cls) query.class = cls

    if (session.role === "student") {
      // Students can only see their own records
      if (!session.studentId) return NextResponse.json({ records: [] })
      query.studentId = session.studentId
    } else if (session.role === "teacher") {
      // Teacher sees records for their own subjects only
      if (studentId) query.studentId = studentId
      const mySubjects = await SubjectModel.find({ teacherId: session.id }, { _id: 1 })
      const mySubjectIds = mySubjects.map((s) => s._id.toString())
      if (subjectId && !mySubjectIds.includes(subjectId)) {
        return NextResponse.json({ records: [] })
      }
      if (!subjectId) {
        query.subjectId = { $in: mySubjectIds }
      }
    } else {
      // Admin: no restriction, but respect filters
      if (studentId) query.studentId = studentId
    }

    const records = await AttendanceRecord.find(query).sort({ date: -1 })

    return NextResponse.json({
      records: records.map((r) => ({
        id: r._id.toString(),
        studentId: r.studentId.toString(),
        subjectId: r.subjectId.toString(),
        date: r.date,
        status: r.status,
        class: r.class,
      })),
    })
  } catch (err) {
    console.error("[GET /api/attendance]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.role === "student") {
      return NextResponse.json({ error: "Teacher or admin access required" }, { status: 403 })
    }

    const body = await req.json() as {
      studentId: string
      subjectId: string
      date: string
      status: string
      class: string
    }
    const { studentId, subjectId, date, status, class: cls } = body

    if (!studentId || !subjectId || !date || !status || !cls) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await connectDB()

    // Upsert: update if exists, otherwise create
    const record = await AttendanceRecord.findOneAndUpdate(
      { studentId, subjectId, date },
      { studentId, subjectId, date, status, class: cls, markedById: session.id },
      { upsert: true, new: true }
    )

    return NextResponse.json({
      record: {
        id: record._id.toString(),
        studentId: record.studentId.toString(),
        subjectId: record.subjectId.toString(),
        date: record.date,
        status: record.status,
        class: record.class,
      },
    })
  } catch (err) {
    console.error("[POST /api/attendance]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
