import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import SubjectModel from "@/lib/models/Subject"
import { getSession } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json() as Partial<{ name: string; code: string; class: string; teacherId: string }>
    await connectDB()

    const subject = await SubjectModel.findByIdAndUpdate(id, body, { new: true })
      .populate<{ teacherId: { name: string } }>("teacherId", "name")

    if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      subject: {
        id: subject._id.toString(),
        name: subject.name,
        code: subject.code,
        class: subject.class,
        teacher: (subject.teacherId as unknown as { name: string })?.name ?? "Unknown",
        teacherId: subject.teacherId?.toString?.() ?? "",
      },
    })
  } catch (err) {
    console.error("[PUT /api/subjects/[id]]", err)
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
    const subject = await SubjectModel.findByIdAndDelete(id)
    if (!subject) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/subjects/[id]]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
