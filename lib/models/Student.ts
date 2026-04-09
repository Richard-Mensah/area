import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface IStudent extends Document {
  name: string
  roll: string
  class: string
  email: string
  userId?: Types.ObjectId      // linked User account (optional)
  faceDescriptor?: number[]    // for future face-based attendance
  createdAt: Date
  updatedAt: Date
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    roll: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: undefined },
    faceDescriptor: { type: [Number], default: undefined },
  },
  { timestamps: true }
)

const Student: Model<IStudent> =
  (mongoose.models.Student as Model<IStudent>) ?? mongoose.model<IStudent>("Student", StudentSchema)

export default Student
