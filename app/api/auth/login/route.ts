import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { signToken, buildSetCookieHeader } from "@/lib/auth"
import type { SessionUser } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json() as { email: string; password: string }

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const payload: SessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    }

    // For student role, find linked student record
    if (user.role === "student") {
      const Student = (await import("@/lib/models/Student")).default
      const student = await Student.findOne({ userId: user._id })
      if (student) payload.studentId = student._id.toString()
    }

    const token = await signToken(payload)
    const res = NextResponse.json({ user: payload })
    res.headers.set("Set-Cookie", buildSetCookieHeader(token))
    return res
  } catch (err) {
    console.error("[POST /api/auth/login]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
