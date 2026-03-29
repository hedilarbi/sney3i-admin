import mongoose, { Schema, Document, Model } from 'mongoose'

export type ProStatus = 'pending' | 'approved' | 'rejected' | 'suspended'
export type SubscriptionPlan = 'free' | 'basic' | 'premium'

interface DaySchedule {
  open: boolean
  start: string
  end: string
}

export interface IProfessional extends Document {
  name: string
  email: string
  phone: string
  password: string
  category: mongoose.Types.ObjectId
  address: string
  governorat: string
  city: string
  location: {
    type: string
    coordinates: [number, number]
  }
  bio: string
  photo: string
  rating: number
  ratingsCount: number
  isAvailable: boolean
  schedule: {
    lundi: DaySchedule
    mardi: DaySchedule
    mercredi: DaySchedule
    jeudi: DaySchedule
    vendredi: DaySchedule
    samedi: DaySchedule
    dimanche: DaySchedule
  }
  status: ProStatus
  subscription: {
    plan: SubscriptionPlan
    expiresAt: Date | null
    isActive: boolean
  }
  createdAt: Date
}

const DayScheduleSchema = {
  open: { type: Boolean, default: true },
  start: { type: String, default: '08:00' },
  end: { type: String, default: '18:00' },
}


const ProfessionalSchema = new Schema<IProfessional>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    address: { type: String, default: '' },
    governorat: { type: String, default: '' },
    city: { type: String, default: '' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [10.1815, 36.8065] }, // Tunis default
    },
    bio: { type: String, default: '' },
    photo: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    schedule: {
      lundi: DayScheduleSchema,
      mardi: DayScheduleSchema,
      mercredi: DayScheduleSchema,
      jeudi: DayScheduleSchema,
      vendredi: DayScheduleSchema,
      samedi: DayScheduleSchema,
      dimanche: DayScheduleSchema,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
      expiresAt: { type: Date, default: null },
      isActive: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
)

ProfessionalSchema.index({ location: '2dsphere' })

const Professional: Model<IProfessional> =
  mongoose.models.Professional ||
  mongoose.model<IProfessional>('Professional', ProfessionalSchema)

export default Professional
