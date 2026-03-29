import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'

function initFirebase() {
  if (getApps().length > 0) return getApp()
  const creds = JSON.parse(process.env.FIREBASE_CREDENTIALS!)
  return initializeApp({
    credential: cert(creds),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? `${creds.project_id}.appspot.com`,
  })
}

export function getBucket() {
  return getStorage(initFirebase()).bucket()
}
