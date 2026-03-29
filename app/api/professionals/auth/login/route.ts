import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return Response.json({ error: 'Téléphone et mot de passe requis' }, { status: 400 })
    }

    const pro = await Professional.findOne({ phone }).populate('category', 'name nameAr slug icon')
    if (!pro) {
      return Response.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const match = await bcrypt.compare(password, pro.password)
    if (!match) {
      return Response.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const token = signToken({ id: pro._id.toString(), email: pro.email, role: 'professional' })

    return Response.json({
      token,
      professional: {
        id: pro._id,
        name: pro.name,
        phone: pro.phone,
        category: pro.category,
        governorat: pro.governorat,
        city: pro.city,
        address: pro.address,
        bio: pro.bio,
        photo: pro.photo,
        rating: pro.rating,
        ratingsCount: pro.ratingsCount,
        isAvailable: pro.isAvailable,
        schedule: pro.schedule,
        status: pro.status,
        subscription: pro.subscription,
      },
    })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
