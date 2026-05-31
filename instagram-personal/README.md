# 🎨 Personal Instagram — دليل الإعداد الكامل

موقع بروفايل شخصي بأسلوب انستاغرام، مع نوافذ متعددة وكاروسيلات قابلة للتصدير.

---

## 🚀 خطوات التشغيل

### 1. تثبيت المتطلبات

```bash
npm install
```

### 2. إعداد Firebase

**أ) إنشاء مشروع Firebase:**
- اذهب إلى [console.firebase.google.com](https://console.firebase.google.com)
- افتح مشروعك: `bahaauddin-d655b`

**ب) تفعيل الخدمات:**
- Authentication → Sign-in methods → Google ✓
- Firestore Database → Create database (production mode)
- Storage → Get started

**ج) نسخ قواعد الأمان:**
- افتح `firestore.rules` → انسخ المحتوى → Firebase Console > Firestore > Rules
- افتح `storage.rules` → انسخ المحتوى → Firebase Console > Storage > Rules

> **مهم:** استبدل `REPLACE_WITH_YOUR_UID` في الـ rules بـ UID الخاص بك (خطوة 4)

### 3. متغيرات البيئة

الملف `.env.local` جاهز بقيمك. لا تحتاج تغيير شيء إلا:

```env
NEXT_PUBLIC_OWNER_UID=UID_الخاص_بك
```

### 4. الحصول على UID الخاص بك

1. شغّل المشروع: `npm run dev`
2. افتح الموقع على `localhost:3000`
3. اضغط "تسجيل الدخول" وادخل بـ Google
4. اذهب لـ Firebase Console > Authentication > Users
5. انسخ الـ UID الخاص بك وضعه في `.env.local`
6. أعد تشغيل السيرفر

---

## 📁 هيكل الملفات

```
src/
├── app/
│   ├── layout.tsx      ← الـ Layout + Metadata
│   ├── page.tsx        ← الصفحة الرئيسية
│   └── globals.css     ← الأنماط العامة
├── components/
│   ├── carousel/
│   │   ├── CarouselViewer.tsx  ← عارض الكاروسيل
│   │   ├── CarouselEditor.tsx  ← محرر الكاروسيل
│   │   └── ExportModal.tsx     ← تصدير GIF/MP4
│   ├── Header.tsx
│   ├── ProfileSidebar.tsx
│   ├── WindowTabs.tsx
│   └── WindowGrid.tsx
├── context/
│   ├── AuthContext.tsx
│   └── WindowsContext.tsx
├── lib/
│   ├── firebase.ts     ← إعداد Firebase
│   ├── db.ts          ← كل عمليات Firestore
│   └── defaults.ts    ← 🎨 خصّص الموقع من هنا
└── types/
    └── index.ts       ← أنواع TypeScript
```

---

## 🎨 التخصيص

### تغيير البروفايل
افتح `src/lib/defaults.ts`:
```ts
export const DEFAULT_PROFILE = {
  name:     'اسمك هنا',
  username: 'معرفك',
  bio:      'نبذتك...',
  avatar:   'رابط صورتك',
  links: [...],
}
```

### تعديل الثيمات أو إضافة ثيم جديد
في نفس الملف، في قسم `THEMES`:
```ts
myTheme: {
  bg:           '#000000',   // لون الخلفية
  surface:      '#111111',   // لون البطاقات
  accent:       '#ff0000',   // لون التمييز
  text:         '#ffffff',   // لون النص
  textMuted:    '#666666',   // لون النص الثانوي
  fontDisplay:  "'Playfair Display', serif",
  fontBody:     "'DM Sans', sans-serif",
  columns:      3,           // 1, 2, أو 3
  gap:          12,          // مسافة بين البطاقات
  cardRadius:   8,           // انحناء الزوايا
  grain:        false,       // texture حبيبية
  glassmorphism: false,      // تأثير زجاجي
}
```

### تغيير نسبة الكاروسيل
```ts
export const CAROUSEL_RATIO = { w: 4, h: 5 }  // 1:1 أو 9:16 الخ
```

### تغيير مدة كل شريحة عند التصدير
في `ExportModal.tsx`:
```ts
const SLIDE_DURATION = 2.5  // بالثواني
```

---

## 📱 الاستخدام

### إضافة نافذة جديدة
1. سجّل دخول كمالك
2. اضغط "+ نافذة جديدة" في شريط التبويبات
3. اختر اسم وثيم

### إنشاء كاروسيل
1. اختر النافذة المناسبة
2. اضغط "+ إضافة كاروسيل جديد"
3. أضف شرائح ونصوص وخلفيات
4. صدّر كـ GIF أو MP4

### مشاركة كاروسيل
- مرّر على البطاقة → اضغط أيقونة المشاركة
- يُنسخ الرابط تلقائياً

---

## 🛠 تشغيل المشروع

```bash
# تطوير
npm run dev

# بناء للإنتاج
npm run build
npm start
```

---

## 🚢 النشر على Vercel

1. ارفع المشروع على GitHub
2. اذهب لـ [vercel.com](https://vercel.com) → Import Project
3. أضف متغيرات البيئة من `.env.local`
4. انشر!
