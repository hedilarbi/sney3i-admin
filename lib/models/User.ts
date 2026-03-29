import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  name: string
  email: string
  phone: string
  password: string
  favorites: mongoose.Types.ObjectId[]
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, default: '' },
    password: { type: String, required: true },
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Professional', default: [] }],
  },
  { timestamps: true }
)

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
