import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import StudentModel from "@/lib/models/Student"
import SubjectModel from "@/lib/models/Subject"
import { getSession } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    await connectDB()

    // Students can only view themselves
    if (session.role === "student" && session.studentId !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Teacher can only view students in their classes
    if (session.role === "teacher") {
      const subjects = await SubjectModel.find({ teacherId: session.id }, { class: 1 })
      const classes = [...new Set(subjects.map((s) => s.class))]
      const student = await StudentModel.findOne({ _id: id, class: { $in: classes } })
      if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 })
      return NextResponse.json({
        student: {
          id: student._id.toString(),
          name: student.name,
          roll: student.roll,
          class: student.class,
          email: student.email,
          userId: student.userId?.toString(),
        },
      })
    }

    const student = await StudentModel.findById(id)
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        name: student.name,
        roll: student.roll,
        class: student.class,
        email: student.email,
        userId: student.userId?.toString(),
      },
    })
  } catch (err) {
    console.error("[GET /api/students/[id]]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json() as Partial<{ name: string; roll: string; class: string; email: string; userId: string }>
    await connectDB()

    const student = await StudentModel.findByIdAndUpdate(id, body, { new: true })
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      student: {
        id: student._id.toString(),
        name: student.name,
        roll: student.roll,
        class: student.class,
        email: student.email,
        userId: student.userId?.toString(),
      },
    })
  } catch (err) {
    console.error("[PUT /api/students/[id]]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()
    const student = await StudentModel.findByIdAndDelete(id)
    if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/students/[id]]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
