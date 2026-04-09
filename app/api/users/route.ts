import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { getSession } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    await connectDB()
    const users = await User.find({}, { passwordHash: 0, faceDescriptor: 0 }).sort({ role: 1, name: 1 })

    return NextResponse.json({
      users: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
        hasFace: !!(u.faceDescriptor && u.faceDescriptor.length > 0),
        createdAt: u.createdAt.toISOString(),
      })),
    })
  } catch (err) {
    console.error("[GET /api/users]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession()
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await req.json() as { name: string; email: string; password: string; role: string }
    const { name, email, password, role } = body

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }
    if (!["teacher", "admin", "student"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    await connectDB()
    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash, role })

    return NextResponse.json({
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role },
    }, { status: 201 })
  } catch (err) {
    console.error("[POST /api/users]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
