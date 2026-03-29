import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'
import '@/lib/models/Category'
import { getTokenFromRequest, verifyToken } from '@/lib/auth'
import { uploadProPhoto, deleteProPhoto } from '@/lib/uploadImage'
import bcrypt from 'bcryptjs'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const pro = await Professional.findById(id)
      .select('-password')
      .populate('category', 'name nameAr slug icon')

    if (!pro) return Response.json({ error: 'Professionnel introuvable' }, { status: 404 })

    return Response.json({ professional: pro })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB()
    const { id } = await params
    const token = getTokenFromRequest(request)
    if (!token) return Response.json({ error: 'Non autorisé' }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload || (payload.role !== 'professional' && payload.role !== 'admin')) {
      return Response.json({ error: 'Non autorisé' }, { status: 401 })
    }
    if (payload.role === 'professional' && payload.id !== id) {
      return Response.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type') || ''
    const update: Record<string, unknown> = {}
    let photoBuffer: Buffer | null = null
    let photoMime = 'image/jpeg'

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData()
      const textFields = ['name', 'phone', 'address', 'city', 'bio']
      for (const [key, value] of fd.entries()) {
        if (key === 'photo' && value instanceof File && value.size > 0) {
          photoBuffer = Buffer.from(await value.arrayBuffer())
          photoMime   = value.type || 'image/jpeg'
        } else if (textFields.includes(key) && typeof value === 'string') {
          update[key] = value
        } else if (key === 'isAvailable' && typeof value === 'string') {
          update.isAvailable = value === 'true'
        }
      }
    } else {
      const body = await request.json()
      const allowed = ['name', 'phone', 'address', 'city', 'bio', 'photo', 'isAvailable', 'schedule', 'location']
      for (const key of allowed) {
        if (body[key] !== undefined) update[key] = body[key]
      }
    }

    // Handle photo upload — delete old first
    if (photoBuffer) {
      const existing = await Professional.findById(id).select('photo').lean() as { photo?: string } | null
      if (existing?.photo) await deleteProPhoto(existing.photo)
      update.photo = await uploadProPhoto(photoBuffer, id, photoMime)
    }

    const pro = await Professional.findByIdAndUpdate(id, update, { new: true })
      .select('-password')
      .populate('category', 'name nameAr slug icon')

    return Response.json({ professional: pro })
  } catch (e) {
    console.error('[PUT /api/professionals/[id]]', e)
    return Response.json({ error: 'Erreur serveur', detail: String(e) }, { status: 500 })
  }
}
