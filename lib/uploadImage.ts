import { getBucket } from './firebase'

export async function uploadProPhoto(
  buffer: Buffer,
  proId: string,
  mimeType = 'image/jpeg',
): Promise<string> {
  const ext = mimeType.includes('png') ? 'png' : 'jpg'
  const destination = `professionals/${proId}/profile.${ext}`
  const file = getBucket().file(destination)
  await file.save(buffer, { metadata: { contentType: mimeType } })
  try {
    await file.makePublic()
    return file.publicUrl()
  } catch {
    // Uniform bucket-level access is enabled — fall back to long-lived signed URL
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 10 * 365 * 24 * 60 * 60 * 1000, // 10 years
    })
    return url
  }
}

export async function deleteProPhoto(photoUrl: string): Promise<void> {
  if (!photoUrl || !photoUrl.includes('storage.googleapis.com')) return
  try {
    const url = new URL(photoUrl)
    // URL path: /BUCKET_NAME/professionals/ID/profile.jpg
    const filePath = url.pathname.split('/').slice(2).join('/')
    await getBucket().file(decodeURIComponent(filePath)).delete()
  } catch {} // ignore — file may not exist
}
