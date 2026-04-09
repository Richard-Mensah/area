import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import StudentModel from "@/lib/models/Student"
import { getSession } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || (session.role !== "admin" && session.role !== "teacher")) {
      return NextResponse.json({ error: "Teacher or admin access required" }, { status: 403 })
    }

    const { descriptor } = await req.json() as { descriptor: number[] }
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ error: "Invalid face descriptor (must be 128 numbers)" }, { status: 400 })
    }

    await connectDB()
    const student = await StudentModel.findByIdAndUpdate(
      id,
      { faceDescriptor: descriptor },
      { new: true }
    )
    if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 })

    return NextResponse.json({ ok: true, studentId: student._id.toString() })
  } catch (err) {
    console.error("[PUT /api/students/[id]/face]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
