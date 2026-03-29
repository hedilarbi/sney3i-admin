import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'

export async function GET(request: Request) {
  try {
    await connectDB()
    const { searchParams } = new URL(request.url)
    const category   = searchParams.get('category')
    const governorat = searchParams.get('governorat')
    const city       = searchParams.get('city')
    const lat        = parseFloat(searchParams.get('lat') || '36.8065')
    const lng        = parseFloat(searchParams.get('lng') || '10.1815')
    const limit      = parseInt(searchParams.get('limit') || '50')

    const query: Record<string, unknown> = { status: 'approved' }
    if (category) query.category = category

    // Filter by governorat / city (no geo needed)
    if (governorat) {
      query.governorat = governorat
      if (city) query.city = city

      const professionals = await Professional.find(query)
        .sort({ isAvailable: -1, rating: -1 })
        .limit(limit)
        .populate('category', 'name nameAr icon')
        .lean()

      return Response.json({ professionals })
    }

    // Geo-based proximity sort (fallback / admin use)
    const professionals = await Professional.aggregate([
      { $match: query },
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [lng, lat] },
          distanceField: 'distance',
          spherical: true,
          distanceMultiplier: 0.001,
        },
      },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: { password: 0 } },
    ])

    return Response.json({ professionals })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
