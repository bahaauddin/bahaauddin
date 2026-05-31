'use client'
// ============================================================
// Header — الشريط العلوي
// ============================================================

import { useAuth } from '@/context/AuthContext'
import { LogIn, LogOut } from 'lucide-react'

export default function Header({ siteName }: { siteName: string }) {
  const { user, isOwner, login, logout } = useAuth()

  return (
    <header className="site-header">
      {/* ── الشعار / الاسم ────────────────────────── */}
      <strong style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: 0.5 }}>
        {siteName}
      </strong>

      {/* ── يمين: حالة المستخدم ───────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {isOwner && (
          <span style={{
            fontSize: 11, padding: '3px 8px', borderRadius: 4,
            background: 'var(--accent)', color: '#000', fontWeight: 700,
          }}>
            مالك
          </span>
        )}

        {!user ? (
          <button
            onClick={login}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, padding: '6px 12px', borderRadius: 7,
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text)', background: 'transparent', cursor: 'pointer',
            }}
          >
            <LogIn size={14} /> تسجيل الدخول
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src={user.photoURL ?? '/default-avatar.png'}
              alt=""
              style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }}
            />
            <button
              onClick={logout}
              style={{ color: 'var(--text-muted)', cursor: 'pointer' }}
              title="تسجيل الخروج"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
