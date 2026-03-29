import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !password) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const existing = await User.findOne({ email })
    if (existing) {
      return Response.json({ error: 'Email déjà utilisé' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, phone, password: hashed })

    const token = signToken({ id: user._id.toString(), email: user.email, role: 'user' })

    return Response.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    })
  } catch (err) {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
