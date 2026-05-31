'use client'
// ============================================================
// ExportModal — تصدير الكاروسيل كـ GIF أو MP4
// ============================================================
// الطريقة: نرسم كل شريحة على <canvas>، ثم نصدّر
//   GIF  → باستخدام gif.js
//   MP4  → باستخدام MediaRecorder API
// ============================================================

import { useState, useRef, useEffect } from 'react'
import type { Slide } from '@/types'
import { X, Download } from 'lucide-react'
import { DEFAULT_EXPORT } from '@/lib/defaults'

type Props = {
  slides: Slide[]
  onClose: () => void
}

// مدة كل شريحة بالثواني
// ── عدّل هذه القيمة لتغيير السرعة ─────────────────────────
const SLIDE_DURATION = 2.5

export default function ExportModal({ slides, onClose }: Props) {
  const [format, setFormat]     = useState<'gif' | 'mp4'>('mp4')
  const [progress, setProgress] = useState(0)
  const [exporting, setExporting] = useState(false)
  const [done, setDone]         = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const { width, height } = DEFAULT_EXPORT

  // ── رسم شريحة على الـ canvas ──────────────────────────
  async function drawSlide(canvas: HTMLCanvasElement, slide: Slide) {
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, width, height)

    // الخلفية
    if (slide.bgType === 'image' && slide.bgValue) {
      await new Promise<void>(resolve => {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          resolve()
        }
        img.onerror = () => resolve()
        img.src = slide.bgValue
      })
    } else if (slide.bgType === 'gradient') {
      // نرسم الـ gradient عبر div وهمي
      ctx.fillStyle = '#1a1a1a' // fallback
      ctx.fillRect(0, 0, width, height)
    } else {
      ctx.fillStyle = slide.bgValue || '#1a1a1a'
      ctx.fillRect(0, 0, width, height)
    }

    // النصوص
    for (const el of slide.elements) {
      ctx.save()
      ctx.font = `${el.fontWeight} ${el.fontSize * (width / 340)}px ${el.fontFamily}`
      ctx.fillStyle = el.color
      ctx.textAlign = el.align
      ctx.textBaseline = 'top'

      const x = (el.x / 100) * width
      const y = (el.y / 100) * height

      // تقسيم النص بالأسطر
      const lines = el.text.split('\n')
      const lineH = el.fontSize * (width / 340) * el.lineHeight
      lines.forEach((line, i) => {
        let tx = x
        if (el.align === 'center') tx = x + (el.width / 100 * width) / 2
        if (el.align === 'left')   tx = x + (el.width / 100 * width)
        ctx.fillText(line, tx, y + i * lineH)
      })
      ctx.restore()
    }
  }

  // ── تصدير MP4 ─────────────────────────────────────────
  async function exportMP4() {
    const canvas = canvasRef.current!
    canvas.width  = width
    canvas.height = height

    const stream   = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
    const chunks: Blob[] = []

    recorder.ondataavailable = e => chunks.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url  = URL.createObjectURL(blob)
      setDone(url)
      setExporting(false)
    }

    recorder.start()

    for (let i = 0; i < slides.length; i++) {
      setProgress(Math.round((i / slides.length) * 100))
      await drawSlide(canvas, slides[i])
      await sleep(SLIDE_DURATION * 1000)
    }

    recorder.stop()
  }

  // ── تصدير GIF ─────────────────────────────────────────
  async function exportGIF() {
    // نستخدم gif.js عبر CDN
    const GIF = await loadGIF()
    const gif = new GIF({ workers: 2, quality: 10, width, height })
    const canvas = canvasRef.current!
    canvas.width  = width
    canvas.height = height

    for (let i = 0; i < slides.length; i++) {
      setProgress(Math.round((i / slides.length) * 80))
      await drawSlide(canvas, slides[i])
      gif.addFrame(canvas, { copy: true, delay: SLIDE_DURATION * 1000 })
    }

    setProgress(90)
    gif.on('finished', (blob: Blob) => {
      const url = URL.createObjectURL(blob)
      setDone(url)
      setExporting(false)
    })
    gif.render()
  }

  const startExport = async () => {
    setExporting(true)
    setProgress(0)
    setDone(null)
    if (format === 'mp4') await exportMP4()
    else await exportGIF()
  }

  const download = () => {
    if (!done) return
    const a = document.createElement('a')
    a.href = done
    a.download = `carousel.${format === 'mp4' ? 'webm' : 'gif'}`
    a.click()
  }

  return (
    <div className="modal-overlay">
      <div style={{
        background: '#111', borderRadius: 16, padding: 24,
        width: 360, border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700 }}>تصدير الكاروسيل</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>

        {/* ── اختيار الصيغة ──────────────────────────── */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {(['mp4', 'gif'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={{
                flex: 1, padding: '10px 0', borderRadius: 8,
                border: '1px solid',
                borderColor: format === f ? '#c8ff00' : 'rgba(255,255,255,0.15)',
                color: format === f ? '#000' : '#888',
                background: format === f ? '#c8ff00' : 'transparent',
                fontWeight: 700, fontSize: 14,
              }}
            >
              {f === 'mp4' ? '🎬 MP4 / WebM' : '🎞 GIF'}
            </button>
          ))}
        </div>

        <p style={{ fontSize: 12, color: '#666', marginBottom: 16, lineHeight: 1.5 }}>
          {format === 'mp4'
            ? 'تصدير كفيديو WebM عالي الجودة، يمكن تحويله لاحقاً لـ MP4.'
            : 'تصدير كـ GIF متحرك. مناسب للمشاركة المباشرة.'}
        </p>

        {/* ── شريط التقدم ──────────────────────────── */}
        {exporting && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progress}%`, background: '#c8ff00', transition: 'width 0.3s', borderRadius: 3 }} />
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 6 }}>جاري المعالجة... {progress}%</p>
          </div>
        )}

        {/* ── Canvas مخفي للرسم ─────────────────────── */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* ── أزرار ────────────────────────────────── */}
        {!done ? (
          <button
            onClick={startExport}
            disabled={exporting}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 8,
              background: exporting ? 'rgba(200,255,0,0.3)' : '#c8ff00',
              color: '#000', fontWeight: 700, fontSize: 14,
            }}
          >
            {exporting ? 'جاري التصدير...' : 'ابدأ التصدير'}
          </button>
        ) : (
          <button
            onClick={download}
            style={{
              width: '100%', padding: '12px 0', borderRadius: 8,
              background: '#22c55e', color: '#000', fontWeight: 700, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Download size={16} /> تحميل الملف
          </button>
        )}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────
function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function loadGIF(): Promise<any> {
  return new Promise(resolve => {
    if ((window as any).GIF) return resolve((window as any).GIF)
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js'
    s.onload = () => resolve((window as any).GIF)
    document.head.appendChild(s)
  })
}
