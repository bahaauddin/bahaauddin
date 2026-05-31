// ============================================================
// Firestore — كل عمليات قراءة وكتابة البيانات
// ============================================================

import {
  collection, doc, getDocs, getDoc, setDoc, addDoc,
  updateDoc, deleteDoc, query, orderBy, onSnapshot,
  serverTimestamp, writeBatch, Timestamp,
} from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage, COLLECTIONS } from './firebase'
import type { ProfileData, Window, Post, Slide } from '@/types'
import { DEFAULT_PROFILE, DEFAULT_WINDOWS, THEMES } from './defaults'
import { nanoid } from 'nanoid'

// ── Helper ─────────────────────────────────────────────────
function nanoidShort() {
  return Math.random().toString(36).slice(2, 10)
}

// ============================================================
// PROFILE
// ============================================================

export async function getProfile(): Promise<ProfileData> {
  const snap = await getDoc(doc(db, COLLECTIONS.PROFILE, 'main'))
  if (snap.exists()) return snap.data() as ProfileData
  // أول مرة — احفظ البيانات الافتراضية
  await setDoc(doc(db, COLLECTIONS.PROFILE, 'main'), DEFAULT_PROFILE)
  return DEFAULT_PROFILE
}

export async function updateProfile(data: Partial<ProfileData>) {
  await updateDoc(doc(db, COLLECTIONS.PROFILE, 'main'), data as any)
}

// ── رفع صورة البروفايل ────────────────────────────────────
export async function uploadAvatar(file: File): Promise<string> {
  const r = ref(storage, `profile/avatar.${file.name.split('.').pop()}`)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}

// ============================================================
// WINDOWS (النوافذ)
// ============================================================

export async function getWindows(): Promise<Window[]> {
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.WINDOWS), orderBy('order'))
  )
  if (!snap.empty) {
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Window))
  }
  // أول مرة — أنشئ النوافذ الافتراضية
  return seedWindows()
}

async function seedWindows(): Promise<Window[]> {
  const batch = writeBatch(db)
  const windows: Window[] = []
  for (const w of DEFAULT_WINDOWS) {
    const id = nanoidShort()
    const win: Window = { ...w, id, createdAt: Date.now() }
    batch.set(doc(db, COLLECTIONS.WINDOWS, id), win)
    windows.push(win)
  }
  await batch.commit()
  return windows
}

export async function createWindow(data: Omit<Window, 'id' | 'createdAt'>): Promise<Window> {
  const id = nanoidShort()
  const win: Window = { ...data, id, createdAt: Date.now() }
  await setDoc(doc(db, COLLECTIONS.WINDOWS, id), win)
  return win
}

export async function updateWindow(id: string, data: Partial<Window>) {
  await updateDoc(doc(db, COLLECTIONS.WINDOWS, id), data as any)
}

export async function deleteWindow(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.WINDOWS, id))
}

// ── Realtime listener للنوافذ ─────────────────────────────
export function subscribeWindows(cb: (windows: Window[]) => void) {
  return onSnapshot(
    query(collection(db, COLLECTIONS.WINDOWS), orderBy('order')),
    snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() } as Window)))
  )
}

// ============================================================
// POSTS (البوستات / الكاروسيلات)
// ============================================================

export async function getPosts(windowId?: string): Promise<Post[]> {
  const q = windowId
    ? query(collection(db, COLLECTIONS.POSTS), orderBy('order'))
    : query(collection(db, COLLECTIONS.POSTS), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as Post))
  return windowId ? all.filter(p => p.windowId === windowId) : all
}

export async function getPost(id: string): Promise<Post | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.POSTS, id))
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Post) : null
}

export async function createPost(windowId: string, slides: Slide[]): Promise<Post> {
  const id = nanoidShort()
  const post: Post = {
    id,
    windowId,
    order: Date.now(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    slides,
  }
  await setDoc(doc(db, COLLECTIONS.POSTS, id), post)
  return post
}

export async function updatePost(id: string, data: Partial<Post>) {
  await updateDoc(doc(db, COLLECTIONS.POSTS, id), {
    ...data,
    updatedAt: Date.now(),
  } as any)
}

export async function deletePost(id: string) {
  await deleteDoc(doc(db, COLLECTIONS.POSTS, id))
}

// ── Realtime listener للبوستات ────────────────────────────
export function subscribePosts(windowId: string, cb: (posts: Post[]) => void) {
  return onSnapshot(
    query(collection(db, COLLECTIONS.POSTS), orderBy('order')),
    snap => {
      const posts = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as Post))
        .filter(p => p.windowId === windowId)
      cb(posts)
    }
  )
}

// ── رفع صورة داخل شريحة ──────────────────────────────────
export async function uploadSlideImage(file: File, postId: string, slideIndex: number): Promise<string> {
  const ext = file.name.split('.').pop()
  const r = ref(storage, `posts/${postId}/slide-${slideIndex}.${ext}`)
  await uploadBytes(r, file)
  return getDownloadURL(r)
}
