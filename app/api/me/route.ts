import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'
import User from '@/lib/models/User'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return Response.json({ error: 'Non autorisé' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return Response.json({ error: 'Token invalide' }, { status: 401 })

    if (payload.role === 'professional') {
      const pro = await Professional.findById(payload.id)
        .select('-password')
        .populate('category', 'name slug icon')
      if (!pro) return Response.json({ error: 'Introuvable' }, { status: 404 })
      return Response.json({ professional: pro })
    }

    if (payload.role === 'user') {
      const user = await User.findById(payload.id).select('-password')
      if (!user) return Response.json({ error: 'Introuvable' }, { status: 404 })
      return Response.json({ user })
    }

    return Response.json({ error: 'Rôle invalide' }, { status: 400 })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
