import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

function requireAdmin(request: Request) {
  const token = getTokenFromRequest(request)
  if (!token) return false
  const payload = verifyToken(token)
  return payload?.role === 'admin'
}

export async function GET(request: Request) {
  try {
    if (!requireAdmin(request)) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    await connectDB()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const query: Record<string, unknown> = {}
    if (status) query.status = status

    const professionals = await Professional.find(query)
      .select('-password')
      .populate('category', 'name slug icon')
      .sort({ createdAt: -1 })

    return Response.json({ professionals })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
