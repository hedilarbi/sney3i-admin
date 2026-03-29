import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IRating extends Document {
  professional: mongoose.Types.ObjectId
  user: mongoose.Types.ObjectId | null
  userName: string
  rating: number
  comment: string
  createdAt: Date
}

const RatingSchema = new Schema<IRating>(
  {
    professional: { type: Schema.Types.ObjectId, ref: 'Professional', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    userName: { type: String, default: 'Anonyme' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' },
  },
  { timestamps: true }
)

const Rating: Model<IRating> =
  mongoose.models.Rating || mongoose.model<IRating>('Rating', RatingSchema)

export default Rating
