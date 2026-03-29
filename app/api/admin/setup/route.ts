import { connectDB } from '@/lib/mongodb'
import Admin from '@/lib/models/Admin'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const existing = await Admin.findOne({ email })
    if (existing) {
      return Response.json({ error: 'Admin déjà existant' }, { status: 409 })
    }

    const hashed = await bcrypt.hash(password, 10)
    await Admin.create({ email, password: hashed })

    return Response.json({ message: 'Compte admin créé avec succès' })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
