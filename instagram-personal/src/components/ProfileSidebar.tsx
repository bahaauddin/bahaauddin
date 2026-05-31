'use client'
// ============================================================
// ProfileSidebar — البروفايل الجانبي (desktop) / العلوي (mobile)
// ============================================================

import { useState } from 'react'
import type { ProfileData } from '@/types'
import { useAuth } from '@/context/AuthContext'
import { updateProfile, uploadAvatar } from '@/lib/db'
import { Instagram, Globe, Mail, Edit2, Check, X, Camera } from 'lucide-react'

type Props = {
  profile: ProfileData
  onUpdate: (data: ProfileData) => void
}

export default function ProfileSidebar({ profile, onUpdate }: Props) {
  const { isOwner } = useAuth()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState<ProfileData>(profile)
  const [saving, setSaving]   = useState(false)

  const save = async () => {
    setSaving(true)
    await updateProfile(draft)
    onUpdate(draft)
    setEditing(false)
    setSaving(false)
  }

  const cancel = () => {
    setDraft(profile)
    setEditing(false)
  }

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadAvatar(file)
    setDraft(d => ({ ...d, avatar: url }))
  }

  return (
    <div style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── الصورة الشخصية ────────────────────────── */}
      <div style={{ position: 'relative', width: 'fit-content', marginBottom: 16 }}>
        <img
          src={editing ? draft.avatar : profile.avatar}
          alt={profile.name}
          style={{
            width: 80, height: 80, borderRadius: '50%',
            objectFit: 'cover',
            border: '2px solid rgba(255,255,255,0.1)',
          }}
        />
        {/* زر تغيير الصورة (للمالك فقط في وضع التعديل) */}
        {editing && isOwner && (
          <label style={{
            position: 'absolute', bottom: 0, right: 0,
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--accent)', color: '#000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', border: '2px solid var(--bg)',
          }}>
            <Camera size={12} />
            <input type="file" accept="image/*" onChange={handleAvatar} style={{ display: 'none' }} />
          </label>
        )}
      </div>

      {/* ── الاسم والمعرف ─────────────────────────── */}
      {editing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <input
            value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
            placeholder="الاسم"
            style={inputStyle}
          />
          <input
            value={draft.username}
            onChange={e => setDraft(d => ({ ...d, username: e.target.value }))}
            placeholder="@username"
            style={inputStyle}
          />
          <textarea
            value={draft.bio}
            onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
            placeholder="النبذة التعريفية..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      ) : (
        <>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, marginBottom: 2 }}>
            {profile.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 10 }}>
            @{profile.username}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-line', marginBottom: 14, color: 'var(--text)' }}>
            {profile.bio}
          </div>
        </>
      )}

      {/* ── الروابط ───────────────────────────────── */}
      {!editing && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {profile.links.map((link, i) => (
            <a
              key={i}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 13, color: 'var(--accent)',
                transition: 'opacity 0.2s',
              }}
            >
              <LinkIcon type={link.icon} />
              {link.label}
            </a>
          ))}
        </div>
      )}

      {/* ── أزرار التعديل ─────────────────────────── */}
      {isOwner && (
        <div style={{ display: 'flex', gap: 6 }}>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              style={btnStyle}
            >
              <Edit2 size={12} /> تعديل البروفايل
            </button>
          ) : (
            <>
              <button onClick={save} disabled={saving} style={{ ...btnStyle, background: 'var(--accent)', color: '#000' }}>
                <Check size={12} /> {saving ? '...' : 'حفظ'}
              </button>
              <button onClick={cancel} style={btnStyle}>
                <X size={12} /> إلغاء
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function LinkIcon({ type }: { type?: string }) {
  if (type === 'instagram') return <Instagram size={14} />
  if (type === 'website')   return <Globe size={14} />
  if (type === 'email')     return <Mail size={14} />
  return <Globe size={14} />
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', borderRadius: 7,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: 'var(--text)', fontSize: 13, outline: 'none',
}

const btnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 5,
  padding: '6px 12px', borderRadius: 8, fontSize: 12,
  border: '1px solid rgba(255,255,255,0.15)',
  color: 'var(--text)', background: 'transparent', cursor: 'pointer',
}
