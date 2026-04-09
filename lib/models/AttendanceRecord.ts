import mongoose, { Schema, Document, Model, Types } from "mongoose"
import type { AttendanceStatus } from "@/types"

export interface IAttendanceRecord extends Document {
  studentId: Types.ObjectId
  subjectId: Types.ObjectId
  date: string           // ISO "YYYY-MM-DD"
  status: AttendanceStatus
  class: string
  markedById: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["present", "absent", "late", "unmarked"], required: true },
    class: { type: String, required: true },
    markedById: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

// Compound index: one record per student per subject per date
AttendanceRecordSchema.index({ studentId: 1, subjectId: 1, date: 1 }, { unique: true })

const AttendanceRecord: Model<IAttendanceRecord> =
  (mongoose.models.AttendanceRecord as Model<IAttendanceRecord>) ??
  mongoose.model<IAttendanceRecord>("AttendanceRecord", AttendanceRecordSchema)

export default AttendanceRecord
