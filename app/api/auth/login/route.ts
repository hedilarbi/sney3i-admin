import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return Response.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const match = await bcrypt.compare(password, user.password)
    if (!match) {
      return Response.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const token = signToken({ id: user._id.toString(), email: user.email, role: 'user' })

    return Response.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone },
    })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
