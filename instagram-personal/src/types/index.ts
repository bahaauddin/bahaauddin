// ============================================================
// TYPES — كل أنواع البيانات في الموقع
// ============================================================

// ── بيانات صاحب البروفايل ──────────────────────────────────
export type ProfileData = {
  name: string          // الاسم الظاهر
  username: string      // اسم المستخدم (بدون @)
  bio: string           // النبذة التعريفية (يدعم줄 سطور متعددة)
  avatar: string        // رابط الصورة الشخصية
  links: ProfileLink[]  // الروابط الخارجية
}

export type ProfileLink = {
  label: string   // النص الظاهر
  url: string     // الرابط
  icon?: string   // 'instagram' | 'twitter' | 'website' | 'email'
}

// ── النافذة (Tab / Page) ───────────────────────────────────
export type Window = {
  id: string          // معرف فريد
  title: string       // اسم النافذة (يظهر في الـ Tabs)
  slug: string        // رابط النافذة /w/slug
  order: number       // ترتيب الظهور
  theme: WindowTheme  // الهوية البصرية
  createdAt: number
}

// ── الهوية البصرية لكل نافذة ──────────────────────────────
export type WindowTheme = {
  // ألوان
  bg: string            // لون الخلفية الرئيسي
  surface: string       // لون البطاقات/العناصر
  accent: string        // لون التمييز
  text: string          // لون النص الأساسي
  textMuted: string     // لون النص الثانوي

  // خطوط — استخدم أي خط من Google Fonts
  fontDisplay: string   // خط العناوين
  fontBody: string      // خط النصوص

  // Grid
  columns: 1 | 2 | 3   // عدد الأعمدة في الـ Grid (desktop)
  gap: number           // المسافة بين البطاقات (px)
  cardRadius: number    // انحناء زوايا البطاقات (px)

  // تأثير خاص
  grain: boolean        // إضافة texture حبيبية على الخلفية
  glassmorphism: boolean // تأثير زجاجي على البطاقات
}

// ── الكاروسيل / البوست ────────────────────────────────────
export type Post = {
  id: string
  windowId: string      // في أي نافذة
  order: number
  createdAt: number
  updatedAt: number
  slides: Slide[]       // الشرائح
}

// ── الشريحة داخل الكاروسيل ────────────────────────────────
export type Slide = {
  id: string
  // الخلفية
  bgType: 'color' | 'gradient' | 'image'
  bgValue: string       // لون hex أو gradient CSS أو URL صورة

  // العناصر النصية
  elements: TextElement[]
}

// ── عنصر نصي داخل الشريحة ────────────────────────────────
export type TextElement = {
  id: string
  text: string

  // الموضع (بالنسبة للشريحة، 0-100)
  x: number
  y: number
  width: number  // عرض الصندوق بالـ %

  // تنسيق النص
  fontSize: number      // حجم الخط (px)
  fontFamily: string
  fontWeight: string    // '400' | '600' | '700' | '800' | '900'
  color: string
  align: 'left' | 'center' | 'right'
  lineHeight: number

  // حركة النص
  animation: TextAnimation
}

export type TextAnimation = {
  type: 'none' | 'fadeIn' | 'slideUp' | 'slideLeft' | 'typewriter' | 'scaleIn' | 'blur'
  delay: number    // ثانية
  duration: number // ثانية
}

// ── إعدادات التصدير ────────────────────────────────────────
export type ExportOptions = {
  format: 'gif' | 'mp4'
  width: number   // الوضع الافتراضي: 1080
  height: number  // الوضح الافتراضي: 1350 (4:5 ratio)
  fps: number     // الإطارات في الثانية
  quality: number // 1-10
}
