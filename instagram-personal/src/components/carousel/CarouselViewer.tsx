'use client'
// ============================================================
// CarouselViewer — عارض الكاروسيل (للمشاهدة فقط)
// ============================================================

import { useState, useRef, useEffect } from 'react'
import type { Post, Slide, TextElement, WindowTheme } from '@/types'
import { ChevronLeft, ChevronRight } from 'lucide-react'

type Props = {
  post: Post
  theme: WindowTheme
  // عرض/ارتفاع البطاقة بالـ px
  width?: number
  height?: number
  // عند الضغط لفتح المحرر (للمالك فقط)
  onEdit?: () => void
}

export default function CarouselViewer({ post, theme, width = 300, height = 375, onEdit }: Props) {
  const [current, setCurrent] = useState(0)
  const slide = post.slides[current]
  const total = post.slides.length

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent(c => Math.max(0, c - 1))
  }
  const next = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCurrent(c => Math.min(total - 1, c + 1))
  }

  return (
    <div
      className="carousel-card"
      style={{
        width,
        height,
        borderRadius: theme.cardRadius,
        overflow: 'hidden',
        background: theme.surface,
        ...(theme.glassmorphism ? {
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
        } : {}),
      }}
      onClick={onEdit}
    >
      {/* ── الشريحة الحالية ─────────────────────────────── */}
      <SlideView slide={slide} width={width} height={height} />

      {/* ── أسهم التنقل ─────────────────────────────────── */}
      {total > 1 && (
        <>
          {current > 0 && (
            <button
              onClick={prev}
              style={{
                position: 'absolute', left: 8, top: '50%',
                transform: 'translateY(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', zIndex: 10,
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {current < total - 1 && (
            <button
              onClick={next}
              style={{
                position: 'absolute', right: 8, top: '50%',
                transform: 'translateY(-50%)',
                width: 28, height: 28, borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', zIndex: 10,
              }}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </>
      )}

      {/* ── مؤشر الشرائح ────────────────────────────────── */}
      {total > 1 && (
        <div style={{
          position: 'absolute', bottom: 8, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', gap: 4, zIndex: 10,
        }}>
          {post.slides.map((_, i) => (
            <button
              key={i}
              onClick={e => { e.stopPropagation(); setCurrent(i) }}
              style={{
                width: i === current ? 16 : 6,
                height: 6,
                borderRadius: 3,
                background: i === current ? '#fff' : 'rgba(255,255,255,0.4)',
                transition: 'all 0.2s',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ── عرض شريحة واحدة ──────────────────────────────────────
function SlideView({ slide, width, height }: { slide: Slide; width: number; height: number }) {
  if (!slide) return null

  const bgStyle: React.CSSProperties =
    slide.bgType === 'color'    ? { backgroundColor: slide.bgValue } :
    slide.bgType === 'gradient' ? { background: slide.bgValue } :
    slide.bgType === 'image'    ? { backgroundImage: `url(${slide.bgValue})`, backgroundSize: 'cover', backgroundPosition: 'center' } :
    { backgroundColor: '#1a1a1a' }

  return (
    <div style={{ width, height, position: 'relative', ...bgStyle }}>
      {slide.elements.map(el => (
        <AnimatedText key={el.id} element={el} containerW={width} containerH={height} />
      ))}
    </div>
  )
}

// ── عنصر نصي متحرك ──────────────────────────────────────
function AnimatedText({ element: el, containerW, containerH }: {
  element: TextElement
  containerW: number
  containerH: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const el2 = ref.current
    // إعادة تشغيل الأنيميشن عند ظهور الشريحة
    el2.style.animation = 'none'
    void el2.offsetHeight
    el2.style.animation = ''
  }, [el])

  // تحويل النسب المئوية إلى px
  const x = (el.x / 100) * containerW
  const y = (el.y / 100) * containerH
  const w = (el.width / 100) * containerW

  const animClass =
    el.animation.type === 'fadeIn'   ? 'anim-fade-in'  :
    el.animation.type === 'slideUp'  ? 'anim-slide-up' :
    el.animation.type === 'scaleIn'  ? 'anim-scale-in' :
    ''

  return (
    <div
      ref={ref}
      className={animClass}
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        fontSize: el.fontSize,
        fontFamily: el.fontFamily,
        fontWeight: el.fontWeight as any,
        color: el.color,
        textAlign: el.align,
        lineHeight: el.lineHeight,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        '--delay': `${el.animation.delay}s`,
        '--dur':   `${el.animation.duration}s`,
      } as React.CSSProperties}
    >
      {el.text}
    </div>
  )
}
