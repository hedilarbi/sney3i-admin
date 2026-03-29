import { connectDB } from '@/lib/mongodb'
import Category from '@/lib/models/Category'

export async function GET() {
  try {
    await connectDB()
    const categories = await Category.find({}).sort({ name: 1 })
    return Response.json({ categories })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
