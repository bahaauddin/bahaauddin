'use client'
// ============================================================
// WindowTabs — شريط النوافذ (Tabs)
// ============================================================

import { useState } from 'react'
import type { Window as AppWindow } from '@/types'
import { useWindows } from '@/context/WindowsContext'
import { useAuth } from '@/context/AuthContext'
import { THEMES } from '@/lib/defaults'
import { Plus, Settings, Trash2, X, Check } from 'lucide-react'

export default function WindowTabs() {
  const { windows, activeId, setActiveId, activeWindow, addWindow, editWindow, removeWindow } = useWindows()
  const { isOwner } = useAuth()
  const [showAdd, setShowAdd]   = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)

  return (
    <>
      <div className="tabs-bar">
        {windows.map(w => (
          <div key={w.id} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 4 }}>
            <button
              className={`tab-btn ${w.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(w.id)}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              {w.title}
            </button>

            {/* زر إعدادات النافذة — للمالك فقط */}
            {isOwner && w.id === activeId && (
              <button
                onClick={() => setEditId(w.id)}
                style={{ color: 'rgba(255,255,255,0.3)', padding: 2 }}
              >
                <Settings size={12} />
              </button>
            )}
          </div>
        ))}

        {/* زر إضافة نافذة جديدة */}
        {isOwner && (
          <button
            className="tab-btn"
            onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <Plus size={13} /> نافذة جديدة
          </button>
        )}
      </div>

      {/* ── Modal إضافة نافذة ─────────────────────────── */}
      {showAdd && (
        <AddWindowModal
          onSave={async (title, slug, theme) => {
            await addWindow(title, slug, theme)
            setShowAdd(false)
          }}
          onClose={() => setShowAdd(false)}
        />
      )}

      {/* ── Modal تعديل نافذة ─────────────────────────── */}
      {editId && (
        <EditWindowModal
          window={windows.find(w => w.id === editId)!}
          onSave={async data => {
            await editWindow(editId, data)
            setEditId(null)
          }}
          onDelete={async () => {
            await removeWindow(editId)
            setEditId(null)
          }}
          onClose={() => setEditId(null)}
        />
      )}
    </>
  )
}

// ── Modal إضافة نافذة جديدة ──────────────────────────────
function AddWindowModal({
  onSave, onClose,
}: { onSave: (title: string, slug: string, theme: string) => Promise<void>; onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [slug, setSlug]   = useState('')
  const [theme, setTheme] = useState('dark')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim()) return
    setSaving(true)
    await onSave(title, slug, theme)
    setSaving(false)
  }

  return (
    <div className="modal-overlay">
      <div style={modalBoxStyle}>
        <ModalHeader title="نافذة جديدة" onClose={onClose} />

        <Field label="اسم النافذة">
          <input
            value={title} onChange={e => setTitle(e.target.value)}
            placeholder="مثال: التسويق"
            style={inputStyle} autoFocus
          />
        </Field>

        <Field label="الـ Slug (اختياري)">
          <input
            value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
            placeholder="marketing"
            style={inputStyle}
          />
        </Field>

        <Field label="الثيم">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: t.bg,
                  border: key === theme ? `2px solid ${t.accent}` : '2px solid transparent',
                  cursor: 'pointer',
                  position: 'relative', overflow: 'hidden',
                }}
                title={key}
              >
                <div style={{ position: 'absolute', inset: 0, background: t.accent, opacity: 0.3, borderRadius: 4 }} />
              </button>
            ))}
          </div>
        </Field>

        {/* معاينة الثيم */}
        <ThemePreview themeKey={theme} />

        <button onClick={save} disabled={!title || saving} style={saveBtnStyle}>
          {saving ? 'جاري...' : 'إنشاء النافذة'}
        </button>
      </div>
    </div>
  )
}

// ── Modal تعديل نافذة موجودة ─────────────────────────────
function EditWindowModal({
  window: win, onSave, onDelete, onClose,
}: {
  window: AppWindow
  onSave: (data: Partial<AppWindow>) => Promise<void>
  onDelete: () => Promise<void>
  onClose: () => void
}) {
  const [title, setTitle] = useState(win.title)
  const [theme, setTheme] = useState(
    Object.keys(THEMES).find(k => THEMES[k].accent === win.theme.accent) ?? 'dark'
  )
  const [saving, setSaving]   = useState(false)
  const [confirm, setConfirm] = useState(false)

  const save = async () => {
    setSaving(true)
    await onSave({ title, theme: THEMES[theme] })
    setSaving(false)
  }

  return (
    <div className="modal-overlay">
      <div style={modalBoxStyle}>
        <ModalHeader title="إعدادات النافذة" onClose={onClose} />

        <Field label="الاسم">
          <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} autoFocus />
        </Field>

        <Field label="الثيم">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setTheme(key)}
                style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: t.bg,
                  border: key === theme ? `2px solid ${t.accent}` : '2px solid transparent',
                  cursor: 'pointer', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', inset: 0, background: t.accent, opacity: 0.3, borderRadius: 4 }} />
              </button>
            ))}
          </div>
        </Field>

        <ThemePreview themeKey={theme} />

        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} disabled={saving} style={{ ...saveBtnStyle, flex: 1 }}>
            {saving ? '...' : 'حفظ'}
          </button>

          {!confirm ? (
            <button onClick={() => setConfirm(true)} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #ef4444', color: '#ef4444', background: 'transparent', cursor: 'pointer' }}>
              <Trash2 size={14} />
            </button>
          ) : (
            <button onClick={onDelete} style={{ padding: '10px 14px', borderRadius: 8, background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: 12, border: 'none', cursor: 'pointer' }}>
              تأكيد الحذف
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── معاينة الثيم ─────────────────────────────────────────
function ThemePreview({ themeKey }: { themeKey: string }) {
  const t = THEMES[themeKey]
  if (!t) return null
  return (
    <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', marginBottom: 12 }}>
      <div style={{ background: t.bg, padding: 12 }}>
        <div style={{ fontFamily: t.fontDisplay, fontSize: 16, fontWeight: 700, color: t.text, marginBottom: 4 }}>
          عنوان النافذة
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>نص توضيحي</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{
              flex: 1, aspectRatio: '1',
              background: t.surface,
              borderRadius: t.cardRadius,
              border: `1px solid ${t.accent}22`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

// ── UI Helpers ────────────────────────────────────────────
function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <h3 style={{ fontWeight: 700, fontSize: 16 }}>{title}</h3>
      <button onClick={onClose} style={{ color: '#999' }}><X size={18} /></button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 600 }}>{label}</p>
      {children}
    </div>
  )
}

const modalBoxStyle: React.CSSProperties = {
  background: '#111', borderRadius: 16, padding: 24,
  width: 360, border: '1px solid rgba(255,255,255,0.1)',
  maxHeight: '90dvh', overflowY: 'auto',
  color: '#fff',
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: 7,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff', fontSize: 13, outline: 'none',
}

const saveBtnStyle: React.CSSProperties = {
  width: '100%', padding: '11px 0', borderRadius: 8,
  background: '#c8ff00', color: '#000',
  fontWeight: 700, fontSize: 14, border: 'none', cursor: 'pointer',
}
