import { NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import { getSession } from "@/lib/auth"

export async function PUT(req: Request) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: "Unauthorised" }, { status: 401 })

    const { descriptor } = await req.json() as { descriptor: number[] }
    if (!Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json({ error: "Invalid face descriptor (must be 128 numbers)" }, { status: 400 })
    }

    await connectDB()
    await User.findByIdAndUpdate(session.id, { faceDescriptor: descriptor })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[PUT /api/profile/face]", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
