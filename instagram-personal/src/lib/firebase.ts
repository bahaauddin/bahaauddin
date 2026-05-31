// ============================================================
// Firebase — الإعداد والـ helpers
// ============================================================

import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const db      = getFirestore(app)
export const storage = getStorage(app)
export const auth    = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// ── أسماء Collections في Firestore ────────────────────────
// إذا أردت تغيير الأسماء، عدّلها هنا فقط
export const COLLECTIONS = {
  PROFILE: 'profile',      // وثيقة واحدة بـ id: 'main'
  WINDOWS: 'windows',      // كل نافذة وثيقة
  POSTS:   'posts',        // كل بوست وثيقة
} as const
