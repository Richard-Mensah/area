import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import StudentModel from "@/lib/models/Student"
import SubjectModel from "@/lib/models/Subject"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    await connectDB()

    let query: Record<string, unknown> = {}

    if (session.role === "teacher") {
      // Teacher sees only students in classes they teach
      const subjects = await SubjectModel.find({ teacherId: session.id }, { class: 1 })
      const classes = [...new Set(subjects.map((s) => s.class))]
      query = { class: { $in: classes } }
    } else if (session.role === "student") {
      // Student can only see themselves
      if (!session.studentId) return NextResponse.json({ students: [] })
      query = { _id: session.studentId }
    }

    const students = await StudentModel.find(query).sort({ class: 1, roll: 1 })

    return NextResponse.json({
      students: students.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        roll: s.roll,
        class: s.class,
        email: s.email,
        userId: s.userId?.toString(),
      })),
    })
  } catch (err) {
    console.error("[GET /api/students]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json() as { name: string; roll: string; class: string; email: string }
    const { name, roll, class: cls, email } = body

    if (!name || !roll || !cls || !email) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await connectDB()
    const student = await StudentModel.create({ name, roll, class: cls, email })

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        name: student.name,
        roll: student.roll,
        class: student.class,
        email: student.email,
      },
    }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/students]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
