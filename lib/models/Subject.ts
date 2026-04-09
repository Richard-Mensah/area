import mongoose, { Schema, Document, Model, Types } from "mongoose"

export interface ISubject extends Document {
  name: string
  code: string
  class: string
  teacherId: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    class: { type: String, required: true, trim: true },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
)

const Subject: Model<ISubject> =
  (mongoose.models.Subject as Model<ISubject>) ?? mongoose.model<ISubject>("Subject", SubjectSchema)

export default Subject
