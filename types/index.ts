export type AttendanceStatus = "present" | "absent" | "late" | "unmarked"

export type UserRole = "teacher" | "admin" | "student"

export type RiskLevel = "At Risk" | "Needs Improvement" | "Good Standing" | "Excellent"

export type GradeBand = "A" | "B" | "C" | "D" | "F"

// ── Client-side shape (IDs are strings, returned from API) ──────────────────

export type Student = {
  id: string
  name: string
  roll: string
  class: string
  email: string
  userId?: string
  faceDescriptor?: number[]
}

export type Subject = {
  id: string
  name: string
  code: string
  class: string
  teacher: string      // display name
  teacherId: string    // User._id
}

export type AttendanceRecord = {
  id: string
  studentId: string
  subjectId: string
  date: string
  status: AttendanceStatus
  class: string
}

// ── Auth ────────────────────────────────────────────────────────────────────

export type UserRole_ = UserRole  // alias

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  studentId?: string
}

export type AuthSession = {
  user: AuthUser
  expiresAt: string
}

// SessionUser is the JWT payload (same shape as AuthUser)
export type SessionUser = AuthUser

// ── Analytics ───────────────────────────────────────────────────────────────

export type SubjectBreakdown = {
  subjectId: string
  subjectName: string
  rate: number
  risk: RiskLevel
}

export type Prediction = {
  studentId: string
  studentName: string
  studentClass: string
  riskLevel: RiskLevel
  gradeBand: GradeBand
  attendanceRate: number
  consecutiveAbsences: number
  lateRate: number
  subjectBreakdown: SubjectBreakdown[]
  interventions: string[]
}

export type ChartDataPoint = {
  date: string
  present: number
  absent: number
  late: number
}

export type SubjectChartPoint = {
  subject: string
  rate: number
  risk: RiskLevel
}

// ── Legacy (kept for seed constants) ────────────────────────────────────────

export type MockUser = {
  id: string
  email: string
  password: string
  role: UserRole
  name: string
}
