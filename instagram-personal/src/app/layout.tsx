import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider }    from '@/context/AuthContext'
import { WindowsProvider } from '@/context/WindowsContext'

// ============================================================
// Metadata — عدّل هذه المعلومات لتظهر في نتائج البحث
// ============================================================
export const metadata: Metadata = {
  title:       'بهاء الدين',           // ← عدّل العنوان
  description: 'مدير إبداعي · مصوّر',  // ← عدّل الوصف
  openGraph: {
    title:       'بهاء الدين',
    description: 'مدير إبداعي · مصوّر',
    images: ['/og-image.png'],          // ← أضف صورة OG في مجلد public
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      {/* ── Google Fonts ──────────────────────────────────── */}
      {/* أضف أو عدّل الخطوط هنا — كل ثيم يستخدم خطوطه الخاصة */}
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=DM+Sans:wght@300;400;500;600&family=Cormorant+Garamond:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&family=Fraunces:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;600&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <WindowsProvider>
            {children}
          </WindowsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
