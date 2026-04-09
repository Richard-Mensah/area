import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

export async function proxy(req: NextRequest) {
  const session = await getSessionFromRequest(req)

  if (!session) {
    const loginUrl = new URL("/login", req.url)
    return NextResponse.redirect(loginUrl)
  }

  // Inject role into request headers so Server Components can read it without re-verifying
  const res = NextResponse.next()
  res.headers.set("x-user-id", session.id)
  res.headers.set("x-user-role", session.role)
  res.headers.set("x-user-name", session.name)
  if (session.studentId) res.headers.set("x-student-id", session.studentId)
  return res
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
