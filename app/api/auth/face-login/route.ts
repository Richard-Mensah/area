import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { signToken, buildSetCookieHeader } from "@/lib/auth"
import type { SessionUser } from "@/lib/auth"

function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((sum, v, i) => sum + (v - b[i]) ** 2, 0))
}

const THRESHOLD = 0.5

export async function POST(req: Request) {
  try {
    const { descriptor } = await req.json() as { descriptor: number[] }

    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ error: "Invalid face descriptor" }, { status: 400 })
    }

    await connectDB()
    const usersWithFace = await User.find({ faceDescriptor: { $exists: true, $ne: null } })

    let matchedUser = null
    let bestDistance = Infinity

    for (const user of usersWithFace) {
      if (!user.faceDescriptor || user.faceDescriptor.length !== 128) continue
      const dist = euclideanDistance(descriptor, user.faceDescriptor)
      if (dist < bestDistance) {
        bestDistance = dist
        matchedUser = user
      }
    }

    if (!matchedUser || bestDistance >= THRESHOLD) {
      return NextResponse.json(
        { error: "Face not recognised. Enrol your face from your profile first." },
        { status: 401 }
      )
    }

    const payload: SessionUser = {
      id: matchedUser._id.toString(),
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
    }

    if (matchedUser.role === "student") {
      const Student = (await import("@/lib/models/Student")).default
      const student = await Student.findOne({ userId: matchedUser._id })
      if (student) payload.studentId = student._id.toString()
    }

    const token = await signToken(payload)
    const res = NextResponse.json({ user: payload })
    res.headers.set("Set-Cookie", buildSetCookieHeader(token))
    return res
  } catch (err) {
    console.error("[POST /api/auth/face-login]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
