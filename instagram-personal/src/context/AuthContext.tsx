'use client'
// ============================================================
// Auth Context — إدارة تسجيل الدخول
// ============================================================

import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth'
import { auth, googleProvider } from '@/lib/firebase'

type AuthCtx = {
  user: User | null
  isOwner: boolean      // هل المستخدم الحالي هو صاحب الموقع؟
  login: () => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthCtx | null>(null)

// ── معرف المالك — يُقرأ من متغيرات البيئة ─────────────────
// تأكد إنك حطيت NEXT_PUBLIC_OWNER_UID في .env.local
const OWNER_UID = process.env.NEXT_PUBLIC_OWNER_UID

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
  }, [])

  const login  = async () => { await signInWithPopup(auth, googleProvider) }
  const logout = async () => { await signOut(auth) }

  const isOwner = !!user && (user.uid === OWNER_UID || !OWNER_UID)

  return (
    <AuthContext.Provider value={{ user, isOwner, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
