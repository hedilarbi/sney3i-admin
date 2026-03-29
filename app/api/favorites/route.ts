import { connectDB } from '@/lib/mongodb'
import User from '@/lib/models/User'
import '@/lib/models/Professional'
import '@/lib/models/Category'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

// GET /api/favorites — returns the user's favorite professionals (populated)
export async function GET(request: Request) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return Response.json({ error: 'Non autorisé' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'user') return Response.json({ error: 'Non autorisé' }, { status: 401 })

    const user = await User.findById(payload.id)
      .select('favorites')
      .populate({
        path: 'favorites',
        select: 'name phone city photo rating ratingsCount isAvailable category',
        populate: { path: 'category', select: 'name nameAr icon' },
      })
    if (!user) return Response.json({ error: 'Introuvable' }, { status: 404 })

    return Response.json({ favorites: user.favorites })
  } catch (e) {
    console.error('[GET /api/favorites]', e)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/favorites — toggle a professional in/out of favorites
// body: { professionalId: string }
export async function POST(request: Request) {
  try {
    await connectDB()
    const token = getTokenFromRequest(request)
    if (!token) return Response.json({ error: 'Non autorisé' }, { status: 401 })
    const payload = verifyToken(token)
    if (!payload || payload.role !== 'user') return Response.json({ error: 'Non autorisé' }, { status: 401 })

    const { professionalId } = await request.json()
    if (!professionalId) return Response.json({ error: 'professionalId requis' }, { status: 400 })

    const user = await User.findById(payload.id).select('favorites')
    if (!user) return Response.json({ error: 'Introuvable' }, { status: 404 })

    const idx = user.favorites.findIndex(id => id.toString() === professionalId)
    let added: boolean
    if (idx >= 0) {
      user.favorites.splice(idx, 1)
      added = false
    } else {
      user.favorites.push(new (require('mongoose').Types.ObjectId)(professionalId))
      added = true
    }
    await user.save()

    return Response.json({ added, favorites: user.favorites.map(id => id.toString()) })
  } catch (e) {
    console.error('[POST /api/favorites]', e)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
