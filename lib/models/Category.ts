import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICategory extends Document {
  name: string
  nameAr: string
  slug: string
  icon: string
  description: string
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  nameAr: { type: String, default: '' },
  slug: { type: String, required: true, unique: true },
  icon: { type: String, required: true },
  description: { type: String, default: '' },
})

const Category: Model<ICategory> =
  mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema)

export default Category
