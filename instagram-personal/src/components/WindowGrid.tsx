'use client'
// ============================================================
// WindowGrid — الـ Grid الخاص بكل نافذة
// ============================================================
// يعرض بوستات النافذة الحالية بالهوية البصرية المخصصة لها

import { useState, useEffect } from 'react'
import type { Post, Window as AppWindow } from '@/types'
import { subscribePosts, deletePost } from '@/lib/db'
import { useAuth } from '@/context/AuthContext'
import CarouselViewer from './carousel/CarouselViewer'
import CarouselEditor from './carousel/CarouselEditor'
import { Plus, Trash2, Share2 } from 'lucide-react'

type Props = { window: AppWindow }

export default function WindowGrid({ window: win }: Props) {
  const { isOwner } = useAuth()
  const [posts, setPosts]       = useState<Post[]>([])
  const [loading, setLoading]   = useState(true)
  const [editPost, setEditPost] = useState<Post | 'new' | null>(null)

  // ── تطبيق الثيم ────────────────────────────────────────
  useEffect(() => {
    const t = win.theme
    const root = document.documentElement
    root.style.setProperty('--bg',           t.bg)
    root.style.setProperty('--surface',      t.surface)
    root.style.setProperty('--accent',       t.accent)
    root.style.setProperty('--text',         t.text)
    root.style.setProperty('--text-muted',   t.textMuted)
    root.style.setProperty('--font-display', t.fontDisplay)
    root.style.setProperty('--font-body',    t.fontBody)
    root.style.setProperty('--radius',       `${t.cardRadius}px`)
    root.style.setProperty('--gap',          `${t.gap}px`)
    document.body.style.background   = t.bg
    document.body.style.color        = t.text
    document.body.style.fontFamily   = t.fontBody
  }, [win.id, win.theme])

  // ── تحميل البوستات realtime ─────────────────────────────
  useEffect(() => {
    setLoading(true)
    const unsub = subscribePosts(win.id, ps => {
      setPosts(ps)
      setLoading(false)
    })
    return unsub
  }, [win.id])

  // ── نسخ رابط المشاركة ──────────────────────────────────
  const sharePost = (post: Post) => {
    const url = `${location.origin}?w=${win.slug}&p=${post.id}`
    navigator.clipboard.writeText(url)
      .then(() => alert('تم نسخ الرابط!'))
  }

  // ── عدد الأعمدة حسب الثيم ──────────────────────────────
  const cols = win.theme.columns

  return (
    <div style={{ background: win.theme.bg }}>
      {/* ── زر إضافة بوست جديد ─────────────────────── */}
      {isOwner && (
        <button
          onClick={() => setEditPost('new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 8, marginBottom: 16,
            border: `1px dashed ${win.theme.accent}66`,
            color: win.theme.accent, fontSize: 13, fontWeight: 600,
            background: 'transparent', cursor: 'pointer',
          }}
        >
          <Plus size={16} /> إضافة كاروسيل جديد
        </button>
      )}

      {/* ── Loading ────────────────────────────────── */}
      {loading && (
        <div style={{ color: win.theme.textMuted, textAlign: 'center', padding: 40, fontSize: 14 }}>
          جاري التحميل...
        </div>
      )}

      {/* ── Grid ──────────────────────────────────── */}
      {!loading && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: win.theme.gap,
        }}>
          {posts.map(post => (
            <PostCard
              key={post.id}
              post={post}
              window={win}
              isOwner={isOwner}
              onEdit={() => setEditPost(post)}
              onShare={() => sharePost(post)}
              onDelete={async () => {
                if (confirm('حذف هذا الكاروسيل؟')) await deletePost(post.id)
              }}
            />
          ))}

          {/* فراغ عند عدم وجود بوستات */}
          {!loading && posts.length === 0 && !isOwner && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: win.theme.textMuted, fontSize: 14 }}>
              لا يوجد محتوى بعد.
            </div>
          )}
        </div>
      )}

      {/* ── محرر الكاروسيل ────────────────────────── */}
      {editPost !== null && (
        <CarouselEditor
          post={editPost === 'new' ? undefined : editPost}
          windowId={win.id}
          onSave={saved => {
            setPosts(ps =>
              editPost === 'new'
                ? [...ps, saved]
                : ps.map(p => p.id === saved.id ? saved : p)
            )
          }}
          onClose={() => setEditPost(null)}
        />
      )}
    </div>
  )
}

// ── بطاقة البوست ─────────────────────────────────────────
function PostCard({ post, window: win, isOwner, onEdit, onShare, onDelete }: {
  post: Post
  window: AppWindow
  isOwner: boolean
  onEdit: () => void
  onShare: () => void
  onDelete: () => void
}) {
  const [hover, setHover] = useState(false)

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <CarouselViewer
        post={post}
        theme={win.theme}
        onEdit={isOwner ? onEdit : undefined}
      />

      {/* ── أدوات عند Hover ─────────────────────── */}
      {hover && (
        <div style={{
          position: 'absolute', top: 6, right: 6,
          display: 'flex', gap: 4, zIndex: 10,
        }}>
          {/* زر المشاركة — للجميع */}
          <IconBtn onClick={onShare} title="شارك">
            <Share2 size={13} />
          </IconBtn>

          {/* زر الحذف — للمالك فقط */}
          {isOwner && (
            <IconBtn onClick={onDelete} title="حذف" danger>
              <Trash2 size={13} />
            </IconBtn>
          )}
        </div>
      )}
    </div>
  )
}

function IconBtn({ onClick, title, danger, children }: any) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick() }}
      title={title}
      style={{
        width: 28, height: 28, borderRadius: 6,
        background: danger ? 'rgba(239,68,68,0.8)' : 'rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', border: 'none', cursor: 'pointer',
        backdropFilter: 'blur(4px)',
      }}
    >
      {children}
    </button>
  )
}
