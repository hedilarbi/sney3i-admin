import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IAdmin extends Document {
  email: string
  password: string
  createdAt: Date
}

const AdminSchema = new Schema<IAdmin>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
)

const Admin: Model<IAdmin> =
  mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema)

export default Admin
