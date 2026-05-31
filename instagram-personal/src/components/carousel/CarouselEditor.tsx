'use client'
// ============================================================
// CarouselEditor — محرر الكاروسيل الكامل
// ============================================================
// الميزات:
//   - إضافة / حذف / ترتيب الشرائح
//   - تحرير النصوص بالسحب والإفلات
//   - تغيير خلفية كل شريحة (لون / gradient / صورة)
//   - تنسيق كل عنصر نصي (خط، حجم، لون، محاذاة، حركة)
//   - تصدير GIF و MP4
// ============================================================

import { useState, useRef, useCallback } from 'react'
import type { Post, Slide, TextElement, TextAnimation } from '@/types'
import {
  Plus, Trash2, Copy, MoveLeft, MoveRight,
  Type, Image as ImageIcon, Download, X, Save, Play,
} from 'lucide-react'
import ExportModal from './ExportModal'
import { uploadSlideImage, updatePost, createPost } from '@/lib/db'
import { nanoid } from 'nanoid'

// Helper
function uid() { return Math.random().toString(36).slice(2, 8) }

type Props = {
  post?: Post           // null = إنشاء جديد
  windowId: string
  onSave?: (post: Post) => void
  onClose: () => void
}

// ── الشريحة الفارغة الافتراضية ────────────────────────────
function emptySlide(): Slide {
  return {
    id: uid(),
    bgType: 'color',
    bgValue: '#1a1a1a',
    elements: [],
  }
}

// ── العنصر النصي الافتراضي ────────────────────────────────
function emptyElement(): TextElement {
  return {
    id: uid(),
    text: 'اكتب هنا...',
    x: 10, y: 30, width: 80,
    fontSize: 24,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: '600',
    color: '#ffffff',
    align: 'center',
    lineHeight: 1.4,
    animation: { type: 'fadeIn', delay: 0, duration: 0.6 },
  }
}

export default function CarouselEditor({ post, windowId, onSave, onClose }: Props) {
  const [slides, setSlides] = useState<Slide[]>(
    post?.slides?.length ? post.slides : [emptySlide()]
  )
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedEl, setSelectedEl]     = useState<string | null>(null)
  const [dragging, setDragging]         = useState<string | null>(null)
  const [showExport, setShowExport]     = useState(false)
  const [saving, setSaving]             = useState(false)
  const canvasRef = useRef<HTMLDivElement>(null)

  const slide = slides[currentSlide]
  const el    = slide?.elements.find(e => e.id === selectedEl)

  // ── تحديث شريحة ────────────────────────────────────────
  const updateSlide = (idx: number, data: Partial<Slide>) => {
    setSlides(ss => ss.map((s, i) => i === idx ? { ...s, ...data } : s))
  }

  // ── تحديث عنصر نصي ─────────────────────────────────────
  const updateEl = (id: string, data: Partial<TextElement>) => {
    setSlides(ss => ss.map((s, i) =>
      i === currentSlide
        ? { ...s, elements: s.elements.map(e => e.id === id ? { ...e, ...data } : e) }
        : s
    ))
  }

  // ── إضافة شريحة ────────────────────────────────────────
  const addSlide = () => {
    const s = emptySlide()
    setSlides(ss => [...ss, s])
    setCurrentSlide(slides.length)
    setSelectedEl(null)
  }

  // ── نسخ شريحة ──────────────────────────────────────────
  const dupSlide = (idx: number) => {
    const copy = { ...slides[idx], id: uid() }
    const next = [...slides]
    next.splice(idx + 1, 0, copy)
    setSlides(next)
    setCurrentSlide(idx + 1)
  }

  // ── حذف شريحة ──────────────────────────────────────────
  const deleteSlide = (idx: number) => {
    if (slides.length === 1) return
    setSlides(ss => ss.filter((_, i) => i !== idx))
    setCurrentSlide(Math.max(0, idx - 1))
  }

  // ── إضافة نص ───────────────────────────────────────────
  const addText = () => {
    const ne = emptyElement()
    updateSlide(currentSlide, { elements: [...slide.elements, ne] })
    setSelectedEl(ne.id)
  }

  // ── حذف عنصر ───────────────────────────────────────────
  const deleteEl = (id: string) => {
    updateSlide(currentSlide, { elements: slide.elements.filter(e => e.id !== id) })
    setSelectedEl(null)
  }

  // ── السحب والإفلات ──────────────────────────────────────
  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setSelectedEl(id)
    setDragging(id)
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(1)
    const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(1)
    updateEl(dragging, { x: parseFloat(x), y: parseFloat(y) })
  }, [dragging, currentSlide])

  const handleMouseUp = () => setDragging(null)

  // ── رفع صورة خلفية ─────────────────────────────────────
  const pickBgImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !post) return
    const url = await uploadSlideImage(file, post.id, currentSlide)
    updateSlide(currentSlide, { bgType: 'image', bgValue: url })
  }

  // ── حفظ ────────────────────────────────────────────────
  const save = async () => {
    setSaving(true)
    try {
      if (post) {
        await updatePost(post.id, { slides })
        onSave?.({ ...post, slides })
      } else {
        const np = await createPost(windowId, slides)
        onSave?.(np)
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  // ── الخلفية ─────────────────────────────────────────────
  const bgStyle: React.CSSProperties =
    slide.bgType === 'color'    ? { backgroundColor: slide.bgValue } :
    slide.bgType === 'gradient' ? { background: slide.bgValue } :
    { backgroundImage: `url(${slide.bgValue})`, backgroundSize: 'cover', backgroundPosition: 'center' }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
      zIndex: 1000, display: 'flex', flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {/* ── شريط علوي ──────────────────────────────────── */}
      <div style={{
        height: 52, borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', gap: 12, background: '#111',
      }}>
        <button onClick={onClose} style={{ color: '#999' }}><X size={18} /></button>
        <span style={{ fontWeight: 600, fontSize: 14, color: '#fff' }}>
          {post ? 'تعديل الكاروسيل' : 'كاروسيل جديد'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setShowExport(true)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)', color: '#ccc', fontSize: 13 }}
          >
            <Download size={14} /> تصدير
          </button>
          <button
            onClick={save}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 14px', borderRadius: 6, background: '#c8ff00', color: '#000', fontWeight: 700, fontSize: 13 }}
          >
            <Save size={14} /> {saving ? 'جاري...' : 'حفظ'}
          </button>
        </div>
      </div>

      {/* ── المنطقة الرئيسية ────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* ── شريط الشرائح (يسار) ─────────────────────── */}
        <div style={{
          width: 100, borderLeft: '1px solid rgba(255,255,255,0.08)',
          background: '#0d0d0d', overflowY: 'auto', padding: '12px 8px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {slides.map((s, i) => (
            <div
              key={s.id}
              onClick={() => { setCurrentSlide(i); setSelectedEl(null) }}
              style={{
                position: 'relative', aspectRatio: '4/5',
                borderRadius: 6, overflow: 'hidden', cursor: 'pointer',
                border: i === currentSlide ? '2px solid #c8ff00' : '2px solid transparent',
                ...slidePreviewBg(s),
              }}
            >
              <span style={{ position: 'absolute', top: 2, left: 4, fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>
                {i + 1}
              </span>
            </div>
          ))}
          <button
            onClick={addSlide}
            style={{ aspectRatio: '4/5', borderRadius: 6, border: '1px dashed rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* ── Canvas المنتصف ──────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#0a0a0a' }}>
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={() => setSelectedEl(null)}
            style={{
              position: 'relative',
              width: 'min(340px, 90%)',
              aspectRatio: '4/5',
              borderRadius: 8,
              overflow: 'hidden',
              userSelect: 'none',
              ...bgStyle,
            }}
          >
            {slide.elements.map(e => (
              <div
                key={e.id}
                onMouseDown={ev => handleMouseDown(ev, e.id)}
                style={{
                  position: 'absolute',
                  left: `${e.x}%`, top: `${e.y}%`,
                  width: `${e.width}%`,
                  fontSize: e.fontSize,
                  fontFamily: e.fontFamily,
                  fontWeight: e.fontWeight as any,
                  color: e.color,
                  textAlign: e.align,
                  lineHeight: e.lineHeight,
                  cursor: 'move',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  outline: e.id === selectedEl ? '1px dashed rgba(200,255,0,0.7)' : 'none',
                  padding: 4,
                }}
              >
                {e.text}
              </div>
            ))}
          </div>
        </div>

        {/* ── لوحة الخصائص (يمين) ─────────────────────── */}
        <div style={{
          width: 240, borderRight: '1px solid rgba(255,255,255,0.08)',
          background: '#0d0d0d', overflowY: 'auto', padding: 12,
          display: 'flex', flexDirection: 'column', gap: 16,
        }}>

          {/* ── أدوات الشريحة ─────────────────────────── */}
          <section>
            <Label>الشريحة {currentSlide + 1}</Label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
              <ToolBtn icon={<Type size={14} />} label="نص" onClick={addText} />
              <ToolBtn icon={<Copy size={14} />} label="نسخ" onClick={() => dupSlide(currentSlide)} />
              <ToolBtn
                icon={<Trash2 size={14} />} label="حذف"
                onClick={() => deleteSlide(currentSlide)}
                disabled={slides.length === 1}
              />
            </div>
          </section>

          {/* ── خلفية الشريحة ─────────────────────────── */}
          <section>
            <Label>الخلفية</Label>
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              {(['color', 'gradient', 'image'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => updateSlide(currentSlide, { bgType: t })}
                  style={{
                    flex: 1, padding: '4px 0', fontSize: 11, borderRadius: 4,
                    border: '1px solid',
                    borderColor: slide.bgType === t ? '#c8ff00' : 'rgba(255,255,255,0.15)',
                    color: slide.bgType === t ? '#c8ff00' : '#999',
                    background: 'transparent',
                  }}
                >
                  {t === 'color' ? 'لون' : t === 'gradient' ? 'تدرج' : 'صورة'}
                </button>
              ))}
            </div>

            {slide.bgType === 'color' && (
              <input
                type="color"
                value={slide.bgValue}
                onChange={e => updateSlide(currentSlide, { bgValue: e.target.value })}
                style={{ width: '100%', height: 36, borderRadius: 4, border: 'none', cursor: 'pointer', marginTop: 6 }}
              />
            )}
            {slide.bgType === 'gradient' && (
              <input
                type="text"
                value={slide.bgValue}
                onChange={e => updateSlide(currentSlide, { bgValue: e.target.value })}
                placeholder="linear-gradient(135deg, #000 0%, #333 100%)"
                style={inputStyle}
              />
            )}
            {slide.bgType === 'image' && (
              <label style={{ display: 'block', marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#888' }}>رفع صورة</span>
                <input type="file" accept="image/*" onChange={pickBgImage} style={{ display: 'none' }} />
                <div style={{ marginTop: 4, padding: '6px 10px', border: '1px dashed rgba(255,255,255,0.2)', borderRadius: 6, textAlign: 'center', cursor: 'pointer', fontSize: 12, color: '#888' }}>
                  اختر صورة
                </div>
              </label>
            )}
          </section>

          {/* ── خصائص العنصر المحدد ─────────────────────── */}
          {el && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Label>النص</Label>
                <button onClick={() => deleteEl(el.id)} style={{ color: '#f87171' }}><Trash2 size={12} /></button>
              </div>

              <textarea
                value={el.text}
                onChange={e => updateEl(el.id, { text: e.target.value })}
                style={{ ...inputStyle, height: 70, resize: 'vertical', marginTop: 6 }}
              />

              <Row label="حجم الخط">
                <input
                  type="range" min={10} max={120}
                  value={el.fontSize}
                  onChange={e => updateEl(el.id, { fontSize: +e.target.value })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 11, color: '#888', minWidth: 24 }}>{el.fontSize}</span>
              </Row>

              <Row label="اللون">
                <input
                  type="color" value={el.color}
                  onChange={e => updateEl(el.id, { color: e.target.value })}
                  style={{ width: 40, height: 24, border: 'none', cursor: 'pointer', borderRadius: 4, background: 'none' }}
                />
              </Row>

              <Row label="الوزن">
                <select
                  value={el.fontWeight}
                  onChange={e => updateEl(el.id, { fontWeight: e.target.value })}
                  style={selectStyle}
                >
                  {['400','500','600','700','800','900'].map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </Row>

              <Row label="المحاذاة">
                {(['right','center','left'] as const).map(a => (
                  <button
                    key={a}
                    onClick={() => updateEl(el.id, { align: a })}
                    style={{
                      padding: '2px 8px', fontSize: 11, borderRadius: 3,
                      border: '1px solid',
                      borderColor: el.align === a ? '#c8ff00' : 'rgba(255,255,255,0.15)',
                      color: el.align === a ? '#c8ff00' : '#888',
                      background: 'transparent',
                    }}
                  >
                    {a === 'right' ? 'يمين' : a === 'center' ? 'وسط' : 'يسار'}
                  </button>
                ))}
              </Row>

              <Row label="العرض %">
                <input
                  type="range" min={10} max={100}
                  value={el.width}
                  onChange={e => updateEl(el.id, { width: +e.target.value })}
                  style={{ flex: 1 }}
                />
                <span style={{ fontSize: 11, color: '#888', minWidth: 24 }}>{el.width}</span>
              </Row>

              {/* ── الحركة ──────────────────────────── */}
              <Label style={{ marginTop: 8 }}>الحركة</Label>
              <select
                value={el.animation.type}
                onChange={e => updateEl(el.id, { animation: { ...el.animation, type: e.target.value as any } })}
                style={selectStyle}
              >
                <option value="none">بدون</option>
                <option value="fadeIn">Fade In</option>
                <option value="slideUp">Slide Up</option>
                <option value="slideLeft">Slide Left</option>
                <option value="scaleIn">Scale In</option>
                <option value="blur">Blur In</option>
                <option value="typewriter">Typewriter</option>
              </select>

              {el.animation.type !== 'none' && (
                <>
                  <Row label="تأخير (ث)">
                    <input
                      type="range" min={0} max={3} step={0.1}
                      value={el.animation.delay}
                      onChange={e => updateEl(el.id, { animation: { ...el.animation, delay: +e.target.value } })}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 11, color: '#888', minWidth: 24 }}>{el.animation.delay}s</span>
                  </Row>
                  <Row label="مدة (ث)">
                    <input
                      type="range" min={0.1} max={3} step={0.1}
                      value={el.animation.duration}
                      onChange={e => updateEl(el.id, { animation: { ...el.animation, duration: +e.target.value } })}
                      style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: 11, color: '#888', minWidth: 24 }}>{el.animation.duration}s</span>
                  </Row>
                </>
              )}
            </section>
          )}
        </div>
      </div>

      {/* ── Export Modal ────────────────────────────────── */}
      {showExport && (
        <ExportModal
          slides={slides}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  )
}

// ── UI Helpers ───────────────────────────────────────────
function slidePreviewBg(s: Slide): React.CSSProperties {
  if (s.bgType === 'color')    return { backgroundColor: s.bgValue }
  if (s.bgType === 'gradient') return { background: s.bgValue }
  if (s.bgType === 'image')    return { backgroundImage: `url(${s.bgValue})`, backgroundSize: 'cover' }
  return { backgroundColor: '#1a1a1a' }
}

function Label({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#555', textTransform: 'uppercase', ...style }}>{children}</p>
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
      <span style={{ fontSize: 11, color: '#888', minWidth: 60 }}>{label}</span>
      {children}
    </div>
  )
}

function ToolBtn({ icon, label, onClick, disabled }: any) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '5px 10px', borderRadius: 5, fontSize: 11,
        border: '1px solid rgba(255,255,255,0.15)',
        color: disabled ? '#444' : '#ccc',
        background: 'transparent',
      }}
    >
      {icon} {label}
    </button>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '6px 8px', borderRadius: 5,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.05)',
  color: '#fff', fontSize: 12, marginTop: 4,
}

const selectStyle: React.CSSProperties = {
  ...inputStyle, marginTop: 6, cursor: 'pointer',
}
