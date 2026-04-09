import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SubjectModel from "@/lib/models/Subject"
import User from "@/lib/models/User"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    await connectDB()

    let query: Record<string, unknown> = {}
    if (session.role === "teacher") {
      query = { teacherId: session.id }
    }

    const subjects = await SubjectModel.find(query)
      .populate<{ teacherId: { name: string } }>("teacherId", "name")
      .sort({ class: 1, name: 1 })

    return NextResponse.json({
      subjects: subjects.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
        class: s.class,
        teacher: (s.teacherId as unknown as { name: string })?.name ?? "Unknown",
        teacherId: s.teacherId?.toString?.() ?? "",
      })),
    })
  } catch (err) {
    console.error("[GET /api/subjects]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json() as { name: string; code: string; class: string; teacherId: string }
    const { name, code, class: cls, teacherId } = body

    if (!name || !code || !cls || !teacherId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    await connectDB()
    const teacher = await User.findById(teacherId)
    if (!teacher) return NextResponse.json({ error: "Teacher not found" }, { status: 404 })

    const subject = await SubjectModel.create({ name, code, class: cls, teacherId })

    return NextResponse.json({
      subject: {
        id: subject._id.toString(),
        name: subject.name,
        code: subject.code,
        class: subject.class,
        teacher: teacher.name,
        teacherId: teacherId,
      },
    }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/subjects]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
