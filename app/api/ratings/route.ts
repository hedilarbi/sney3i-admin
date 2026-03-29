import { connectDB } from '@/lib/mongodb'
import Rating from '@/lib/models/Rating'
import Professional from '@/lib/models/Professional'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const professionalId = searchParams.get('professional')

    if (!professionalId) {
      return Response.json({ error: 'professional requis' }, { status: 400 })
    }

    const ratings = await Rating.find({ professional: professionalId })
      .sort({ createdAt: -1 })
      .limit(20)

    return Response.json({ ratings })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await connectDB()
    const { professionalId, rating, comment, userName } = await request.json()

    if (!professionalId || !rating) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
      return Response.json({ error: 'Note invalide (1-5)' }, { status: 400 })
    }

    const token = getTokenFromRequest(request)
    let userId = null
    let resolvedName = userName || 'Anonyme'

    if (token) {
      const payload = verifyToken(token)
      if (payload && payload.role === 'user') {
        userId = payload.id
      }
    }

    const newRating = await Rating.create({
      professional: professionalId,
      user: userId,
      userName: resolvedName,
      rating,
      comment: comment || '',
    })

    // Recalculate professional average
    const allRatings = await Rating.find({ professional: professionalId })
    const avg = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length
    await Professional.findByIdAndUpdate(professionalId, {
      rating: Math.round(avg * 10) / 10,
      ratingsCount: allRatings.length,
    })

    return Response.json({ rating: newRating })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
