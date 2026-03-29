import { connectDB } from '@/lib/mongodb'
import Admin from '@/lib/models/Admin'
import { signToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()
    const { email, password } = await request.json()

    if (!email || !password) {
      return Response.json({ error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const admin = await Admin.findOne({ email })
    if (!admin) {
      return Response.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const match = await bcrypt.compare(password, admin.password)
    if (!match) {
      return Response.json({ error: 'Identifiants incorrects' }, { status: 401 })
    }

    const token = signToken({ id: admin._id.toString(), email: admin.email, role: 'admin' })
    return Response.json({ token })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
