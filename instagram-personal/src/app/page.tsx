'use client'
// ============================================================
// الصفحة الرئيسية — Home Page
// ============================================================

import { useState, useEffect } from 'react'
import type { ProfileData } from '@/types'
import { getProfile } from '@/lib/db'
import { useWindows } from '@/context/WindowsContext'
import { DEFAULT_PROFILE } from '@/lib/defaults'
import Header        from '@/components/Header'
import ProfileSidebar from '@/components/ProfileSidebar'
import WindowTabs    from '@/components/WindowTabs'
import WindowGrid    from '@/components/WindowGrid'
import { Home, Grid, PlusSquare, User } from 'lucide-react'

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE)
  const { windows, activeId, activeWindow, loading } = useWindows()

  // ── تحميل البروفايل ────────────────────────────────────
  useEffect(() => {
    getProfile().then(setProfile)
  }, [])

  if (loading) {
    return (
      <div style={{
        minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', color: 'var(--text-muted)', fontSize: 14,
      }}>
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="site-layout">
      {/* ── الهيدر ─────────────────────────────────── */}
      <Header siteName={profile.username} />

      {/* ── السايدبار (البروفايل) ─────────────────── */}
      <aside className="site-sidebar">
        <ProfileSidebar profile={profile} onUpdate={setProfile} />
      </aside>

      {/* ── المحتوى الرئيسي ──────────────────────── */}
      <main className="site-main">
        {/* شريط النوافذ */}
        <WindowTabs />

        {/* Grid النافذة الحالية */}
        {activeWindow && (
          <WindowGrid window={activeWindow} />
        )}
      </main>

      {/* ── Bottom Nav (جوال فقط) ────────────────── */}
      <nav className="mobile-nav">
        <MobileNavBtn icon={<Home size={22} />} label="الرئيسية" active />
        <MobileNavBtn icon={<Grid size={22} />}  label="الشبكة" />
        <MobileNavBtn icon={<PlusSquare size={22} />} label="جديد" />
        <MobileNavBtn icon={<User size={22} />}  label="البروفايل" />
      </nav>
    </div>
  )
}

function MobileNavBtn({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      color: active ? 'var(--accent)' : 'var(--text-muted)',
      fontSize: 9, fontWeight: active ? 700 : 400,
    }}>
      {icon}
      {label}
    </button>
  )
}
