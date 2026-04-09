import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { getSession } from "@/lib/auth"

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()
    const user = await User.findById(id, { passwordHash: 0 })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error("[GET /api/users/[id]]", err)
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

    const body = await req.json() as Partial<{ name: string; email: string; password: string; role: string }>
    const update: Record<string, unknown> = {}

    if (body.name) update.name = body.name
    if (body.email) update.email = body.email.toLowerCase()
    if (body.role) update.role = body.role
    if (body.password) update.passwordHash = await bcrypt.hash(body.password, 10)

    await connectDB()
    const user = await User.findByIdAndUpdate(id, update, { new: true, select: "-passwordHash" })
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    })
  } catch (err) {
    console.error("[PUT /api/users/[id]]", err)
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

    // Prevent self-deletion
    if (session.id === id) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await connectDB()
    const user = await User.findByIdAndDelete(id)
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[DELETE /api/users/[id]]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
