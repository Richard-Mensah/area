import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import connectDB from "@/lib/mongodb"
import User from "@/lib/models/User"
import StudentModel from "@/lib/models/Student"
import SubjectModel from "@/lib/models/Subject"
import AttendanceRecord from "@/lib/models/AttendanceRecord"
import { SEED_USERS, SEED_STUDENTS, SEED_SUBJECTS, SEED_PASSWORD } from "@/constants"
import { seedAttendanceHistory } from "@/lib/attendance"
import type { Student, Subject } from "@/types"

export async function POST() {
  try {
    await connectDB()

    // ── 1. Users ──────────────────────────────────────────────────────────────
    const existingUserCount = await User.countDocuments()
    let users: { email: string; _id: import("mongoose").Types.ObjectId }[] = []

    if (existingUserCount === 0) {
      const hash = await bcrypt.hash(SEED_PASSWORD, 10)
      const created = await User.insertMany(
        SEED_USERS.map((u) => ({ ...u, passwordHash: hash }))
      )
      users = created.map((u) => ({ email: u.email, _id: u._id }))
    } else {
      const existing = await User.find({}, { email: 1 })
      users = existing.map((u) => ({ email: u.email, _id: u._id }))
    }

    const teacherUser = users.find((u) => u.email === "teacher@school.com")
    const studentUser = users.find((u) => u.email === "student@school.com")

    // ── 2. Subjects ──────────────────────────────────────────────────────────
    const existingSubjectCount = await SubjectModel.countDocuments()
    let subjectDocs: { _id: import("mongoose").Types.ObjectId; class: string; name: string; code: string }[] = []

    if (existingSubjectCount === 0 && teacherUser) {
      const created = await SubjectModel.insertMany(
        SEED_SUBJECTS.map((s) => ({
          name: s.name,
          code: s.code,
          class: s.class,
          teacherId: teacherUser._id,
        }))
      )
      subjectDocs = created.map((s) => ({ _id: s._id, class: s.class, name: s.name, code: s.code }))
    } else {
      const existing = await SubjectModel.find({}, { class: 1, name: 1, code: 1 })
      subjectDocs = existing.map((s) => ({ _id: s._id, class: s.class, name: s.name, code: s.code }))
    }

    // ── 3. Students ──────────────────────────────────────────────────────────
    const existingStudentCount = await StudentModel.countDocuments()
    let studentDocs: { _id: import("mongoose").Types.ObjectId; class: string; name: string; roll: string; email: string }[] = []

    if (existingStudentCount === 0) {
      const studentsToInsert = SEED_STUDENTS.map((s, i) => ({
        ...s,
        // Link first student (Alice) to the student user account
        userId: i === 0 && studentUser ? studentUser._id : undefined,
      }))
      const created = await StudentModel.insertMany(studentsToInsert)
      studentDocs = created.map((s) => ({
        _id: s._id,
        class: s.class,
        name: s.name,
        roll: s.roll,
        email: s.email,
      }))
    } else {
      const existing = await StudentModel.find({}, { class: 1, name: 1, roll: 1, email: 1 })
      studentDocs = existing.map((s) => ({
        _id: s._id,
        class: s.class,
        name: s.name,
        roll: s.roll,
        email: s.email,
      }))
    }

    // ── 4. Attendance records ────────────────────────────────────────────────
    const existingRecordCount = await AttendanceRecord.countDocuments()
    let recordCount = existingRecordCount

    if (existingRecordCount === 0 && teacherUser) {
      // Build Student[] and Subject[] shapes for seedAttendanceHistory
      const studentsForSeed: Student[] = studentDocs.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        roll: s.roll,
        class: s.class,
        email: s.email,
      }))

      const subjectsForSeed: Subject[] = subjectDocs.map((s) => ({
        id: s._id.toString(),
        name: s.name,
        code: s.code,
        class: s.class,
        teacher: "Ms. Sarah Thompson",
        teacherId: teacherUser._id.toString(),
      }))

      const syntheticRecords = seedAttendanceHistory(studentsForSeed, subjectsForSeed, 60)

      const recordsToInsert = syntheticRecords.map((r) => ({
        studentId: r.studentId,
        subjectId: r.subjectId,
        date: r.date,
        status: r.status,
        class: r.class,
        markedById: teacherUser._id,
      }))

      try {
        const inserted = await AttendanceRecord.insertMany(recordsToInsert, { ordered: false })
        recordCount = inserted.length
      } catch {
        // Ignore duplicate key errors from unique index
        recordCount = await AttendanceRecord.countDocuments()
      }
    }

    return NextResponse.json({
      seeded: true,
      counts: {
        users: await User.countDocuments(),
        subjects: await SubjectModel.countDocuments(),
        students: await StudentModel.countDocuments(),
        records: recordCount,
      },
    })
  } catch (err) {
    console.error("[POST /api/seed]", err)
    return NextResponse.json({ error: "Seed failed" }, { status: 500 })
  }
}
