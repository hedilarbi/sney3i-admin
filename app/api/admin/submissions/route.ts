import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

function requireAdmin(request: Request) {
  const token = getTokenFromRequest(request)
  if (!token) return false
  const payload = verifyToken(token)
  return payload?.role === 'admin'
}

// GET pending submissions
export async function GET(request: Request) {
  try {
    if (!requireAdmin(request)) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    await connectDB()
    const submissions = await Professional.find({ status: 'pending' })
      .select('-password')
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 })

    return Response.json({ submissions })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
