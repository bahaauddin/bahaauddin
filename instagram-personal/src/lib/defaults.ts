// ============================================================
// البيانات الافتراضية — عدّل هذا الملف لتخصيص الموقع
// ============================================================

import type { ProfileData, Window, WindowTheme, Post } from '@/types'

// ── البروفايل الافتراضي ────────────────────────────────────
// عدّل هذه القيم لتظهر على الصفحة الرئيسية
export const DEFAULT_PROFILE: ProfileData = {
  name:     'بهاء الدين',           // ← عدّل اسمك
  username: 'bahaauddin',           // ← عدّل معرفك
  bio:      'مدير إبداعي · مصوّر\nكاتب محتوى تسويقي',  // ← عدّل نبذتك
  avatar:   'https://picsum.photos/400/400',             // ← رابط صورتك
  links: [
    { label: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
    { label: 'موقعي',     url: 'https://example.com',   icon: 'website'   },
    { label: 'تواصل',     url: 'mailto:hello@example.com', icon: 'email'  },
  ],
}

// ── ثيمات جاهزة — يمكنك إضافة ثيمات جديدة هنا ─────────────
// كل ثيم يمثّل هوية بصرية مختلفة تماماً

export const THEMES: Record<string, WindowTheme> = {

  // ── ثيم 1: داكن راقي ─────────────────────────────────
  dark: {
    bg:           '#0a0a0a',
    surface:      '#141414',
    accent:       '#c8ff00',      // ← أخضر نيون
    text:         '#f0f0f0',
    textMuted:    '#666666',
    fontDisplay:  "'Playfair Display', serif",
    fontBody:     "'DM Sans', sans-serif",
    columns:      3,
    gap:          12,
    cardRadius:   8,
    grain:        true,
    glassmorphism: false,
  },

  // ── ثيم 2: أبيض إبداعي ───────────────────────────────
  light: {
    bg:           '#f5f0eb',
    surface:      '#ffffff',
    accent:       '#ff3d00',      // ← برتقالي حار
    text:         '#1a1a1a',
    textMuted:    '#888888',
    fontDisplay:  "'Cormorant Garamond', serif",
    fontBody:     "'Plus Jakarta Sans', sans-serif",
    columns:      2,
    gap:          16,
    cardRadius:   16,
    grain:        false,
    glassmorphism: false,
  },

  // ── ثيم 3: زجاجي بنفسجي ──────────────────────────────
  glass: {
    bg:           '#0f0a1e',
    surface:      'rgba(255,255,255,0.07)',
    accent:       '#a855f7',      // ← بنفسجي
    text:         '#e2e8f0',
    textMuted:    '#94a3b8',
    fontDisplay:  "'Space Grotesk', sans-serif",
    fontBody:     "'Inter', sans-serif",
    columns:      3,
    gap:          10,
    cardRadius:   20,
    grain:        false,
    glassmorphism: true,
  },

  // ── ثيم 4: إرث كلاسيكي ───────────────────────────────
  editorial: {
    bg:           '#1c1917',
    surface:      '#292524',
    accent:       '#d97706',      // ← ذهبي
    text:         '#fafaf9',
    textMuted:    '#78716c',
    fontDisplay:  "'Fraunces', serif",
    fontBody:     "'Source Sans 3', sans-serif",
    columns:      2,
    gap:          2,
    cardRadius:   0,
    grain:        true,
    glassmorphism: false,
  },

  // ── ثيم 5: بستاليا ناعم ──────────────────────────────
  pastel: {
    bg:           '#fdf4ff',
    surface:      '#ffffff',
    accent:       '#ec4899',      // ← وردي
    text:         '#3b0764',
    textMuted:    '#a78bfa',
    fontDisplay:  "'Playfair Display', serif",
    fontBody:     "'Nunito', sans-serif",
    columns:      3,
    gap:          14,
    cardRadius:   24,
    grain:        false,
    glassmorphism: false,
  },
}

// ── النوافذ الافتراضية ─────────────────────────────────────
// عدّل العناوين والـ slugs والثيمات حسب محاور محتواك
export const DEFAULT_WINDOWS: Omit<Window, 'id' | 'createdAt'>[] = [
  {
    title: 'الكل',
    slug:  'all',
    order: 0,
    theme: THEMES.dark,
  },
  {
    title: 'التسويق',
    slug:  'marketing',
    order: 1,
    theme: THEMES.editorial,
  },
  {
    title: 'التصوير',
    slug:  'photography',
    order: 2,
    theme: THEMES.light,
  },
  {
    title: 'السفر',
    slug:  'travel',
    order: 3,
    theme: THEMES.glass,
  },
]

// ── إعدادات الكاروسيل الافتراضية ──────────────────────────
export const DEFAULT_SLIDE_BG = '#1a1a1a'
export const DEFAULT_FONT     = "'DM Sans', sans-serif"

// ── نسبة الكاروسيل الافتراضية ─────────────────────────────
// 4:5 مثالية للانستاغرام، يمكنك تغييرها
export const CAROUSEL_RATIO = { w: 4, h: 5 }

// ── إعدادات التصدير الافتراضية ────────────────────────────
export const DEFAULT_EXPORT = {
  width:   1080,
  height:  1350,
  fps:     30,
  quality: 8,
}
