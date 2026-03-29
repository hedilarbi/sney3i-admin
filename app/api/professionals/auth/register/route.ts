import { connectDB } from '@/lib/mongodb'
import Professional from '@/lib/models/Professional'
import { signToken } from '@/lib/auth'
import { uploadProPhoto } from '@/lib/uploadImage'
import bcrypt from 'bcryptjs'

export async function POST(request: Request) {
  try {
    await connectDB()

    // Support both multipart/form-data (with photo) and application/json
    const contentType = request.headers.get('content-type') || ''
    let name = '', phone = '', password = '', category = ''
    let governorat = '', city = '', address = '', bio = ''
    let photoBuffer: Buffer | null = null
    let photoMime = 'image/jpeg'

    if (contentType.includes('multipart/form-data')) {
      const fd = await request.formData()
      name       = fd.get('name') as string || ''
      phone      = fd.get('phone') as string || ''
      password   = fd.get('password') as string || ''
      category   = fd.get('category') as string || ''
      governorat = fd.get('governorat') as string || ''
      city       = fd.get('city') as string || ''
      address    = fd.get('address') as string || ''
      bio        = fd.get('bio') as string || ''
      const photoFile = fd.get('photo')
      if (photoFile instanceof File && photoFile.size > 0) {
        photoBuffer = Buffer.from(await photoFile.arrayBuffer())
        photoMime   = photoFile.type || 'image/jpeg'
      }
    } else {
      const body = await request.json()
      ;({ name, phone, password, category, governorat = '', city = '', address = '', bio = '' } = body)
    }

    if (!name || !phone || !password || !category) {
      return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    }

    const existing = await Professional.findOne({ phone })
    if (existing) {
      return Response.json({ error: 'Ce numéro de téléphone est déjà utilisé' }, { status: 409 })
    }

    const email  = `${phone.replace(/\s/g, '')}@tounsipro.tn`
    const hashed = await bcrypt.hash(password, 10)

    const pro = await Professional.create({
      name, email, phone, password: hashed,
      category, governorat, city, address, bio,
      status: 'pending',
    })

    // Upload photo after pro is created (we need the ID for the path)
    if (photoBuffer) {
      const photoUrl = await uploadProPhoto(photoBuffer, pro._id.toString(), photoMime)
      pro.photo = photoUrl
      await pro.save()
    }

    const token = signToken({ id: pro._id.toString(), email: pro.email, role: 'professional' })

    return Response.json({
      token,
      professional: {
        id: pro._id,
        name: pro.name,
        phone: pro.phone,
        photo: pro.photo,
        status: pro.status,
        category: pro.category,
        governorat: pro.governorat,
        city: pro.city,
      },
    })
  } catch (err) {
    console.error(err)
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
