import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'

function requireAdmin(request: Request) {
  const token = getTokenFromRequest(request)
  if (!token) return false
  const payload = verifyToken(token)
  return payload?.role === 'admin'
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!requireAdmin(request)) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const allowed = ['status', 'subscription']
    const update: Record<string, unknown> = {}
    for (const key of allowed) {
      if (body[key] !== undefined) update[key] = body[key]
    }

    const pro = await Professional.findByIdAndUpdate(id, update, { new: true })
      .select('-password')
      .populate('category', 'name slug icon')

    if (!pro) return Response.json({ error: 'Introuvable' }, { status: 404 })

    return Response.json({ professional: pro })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!requireAdmin(request)) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    await connectDB()
    const { id } = await params
    await Professional.findByIdAndDelete(id)
    return Response.json({ success: true })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
