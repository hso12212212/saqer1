# الصقر · Saqer

متجر متخصص بمستلزمات التخييم (خيام، كراسي، طاولات، إضاءة، أدوات رحلات).

- **الواجهة:** React 18 + TypeScript + Vite + Tailwind v3 + React Router v6 + Lucide + خط Tajawal.
- **الخادم:** Node.js + Express + TypeScript + `pg` (PostgreSQL).
- **قاعدة البيانات:** PostgreSQL (مُعدّة للاستضافة على Railway).

## البنية

```
saqer/
├─ src/                  # الواجهة (React)
│  ├─ components/        # Navbar, Footer, Layout, FalconLogo, …
│  ├─ context/           # ThemeContext
│  ├─ hooks/             # useAsync
│  ├─ lib/api.ts         # عميل الـ API
│  └─ pages/             # Home, Products, Categories, About, Contact, Cart, NotFound
├─ server/               # خادم الـ API
│  ├─ src/
│  │  ├─ index.ts        # Express app
│  │  ├─ db.ts           # Postgres pool
│  │  ├─ migrate.ts      # تطبيق schema.sql
│  │  └─ routes/         # categories, products
│  ├─ schema.sql         # مخطط قاعدة البيانات
│  ├─ .env.example
│  └─ package.json
├─ vite.config.ts        # Proxy من /api إلى :3001 في التطوير
├─ tailwind.config.js    # لوحة reno + Tajawal
└─ package.json
```

## التشغيل محلياً

### 1) الواجهة

```bash
npm install
npm run dev
```

افتح `http://localhost:5173`.

### 2) الخادم + Postgres

```bash
cd server
cp .env.example .env        # ثم حرّر القيم
npm install
npm run db:migrate          # ينشئ الجداول
npm run dev                 # يعمل على http://localhost:3001
```

يتكفّل Vite بتوجيه `/api/*` إلى `http://localhost:3001` تلقائياً أثناء التطوير،
فلا حاجة لضبط `VITE_API_URL` محلياً.

## الربط مع Railway (Postgres + خادم)

### الخطوة 1 — إنشاء قاعدة Postgres
1. في لوحة Railway: **New Project → Provision PostgreSQL**.
2. افتح خدمة Postgres وانسخ **`DATABASE_URL`** من تبويب *Variables*.

### الخطوة 2 — تشغيل المهاجرة محلياً على Railway
على جهازك، بعد الخطوة أعلاه:

```bash
cd server
# ضع DATABASE_URL من Railway في server/.env
# و PG_SSL=true (Railway يتطلب SSL)
npm run db:migrate
```

(أو يمكنك استخدام Railway CLI: `railway run npm run db:migrate`.)

### الخطوة 3 — نشر الـ API على Railway
1. **New Service → Deploy from GitHub repo** (اختر المستودع).
2. في إعدادات الخدمة:
   - **Root Directory:** `server`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
3. أضف المتغيرات في *Variables*:
   - `DATABASE_URL` → اربطها بمتغيّر Postgres: `${{Postgres.DATABASE_URL}}`
   - `PG_SSL` → `true`
   - `CORS_ORIGIN` → عنوان موقعك النهائي (مثلاً `https://saqer.up.railway.app`)
4. بعد النشر ستحصل على رابط عام مثل `https://saqer-api.up.railway.app`.
   اختبره: `GET /api/health` يجب أن يُرجع `{"status":"ok","db":"connected"}`.

### الخطوة 4 — نشر الواجهة
أسهل طريقة مع Railway:

1. **New Service → Deploy from GitHub repo** (نفس المستودع).
2. الإعدادات:
   - **Root Directory:** `/` (الجذر)
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npx vite preview --host 0.0.0.0 --port $PORT`
3. في *Variables*:
   - `VITE_API_URL` → رابط خدمة الـ API (من الخطوة 3).

> بديل: يمكن نشر الواجهة على **Vercel** أو **Netlify** بسهولة
> (ضع `VITE_API_URL` فقط)، واستخدم Railway للـ API + Postgres.

## نقاط الـ API

| الطريقة | المسار | الوصف |
|--------|-------|-------|
| GET | `/api/health` | فحص صحّة الاتصال بقاعدة البيانات |
| GET | `/api/categories` | كل الأقسام |
| GET | `/api/categories/:slug` | قسم واحد |
| GET | `/api/products` | كل المنتجات (يدعم `?category=slug&active=true`) |
| GET | `/api/products/:slug` | منتج واحد |

## لوحة ألوان `reno`

| الدرجة | القيمة |
|--------|--------|
| 50  | `#f1faf4` |
| 100 | `#ddf3e3` |
| 200 | `#bce7c9` |
| 300 | `#8dd3a6` |
| 400 | `#59b77e` |
| 500 | `#349c60` |
| 600 | `#247e4c` |
| 700 | `#1e653f` |
| 800 | `#1a5135` |
| 900 | `#16432c` |

## الأوامر

الواجهة (جذر المشروع):

| الأمر | الوظيفة |
|-------|---------|
| `npm run dev` | خادم التطوير |
| `npm run build` | بناء للإنتاج |
| `npm run preview` | معاينة البناء |

الخادم (داخل `server/`):

| الأمر | الوظيفة |
|-------|---------|
| `npm run dev` | تشغيل الـ API مع الإعادة التلقائية (tsx watch) |
| `npm run build` | بناء TypeScript إلى `dist/` |
| `npm run start` | تشغيل البناء للإنتاج |
| `npm run db:migrate` | تطبيق `schema.sql` |

## ملاحظات

- **لا بيانات افتراضية**: الجداول تبدأ فارغة، والواجهة تعرض حالات فراغ أنيقة.
  لإضافة بياناتك، أدخلها مباشرة في Postgres (عبر Railway Data Explorer أو `psql`).
- **اتجاه RTL** افتراضي مع خط Tajawal.
- **الوضع الداكن** يُحفظ في `localStorage` ويتبع تفضيل النظام أول مرة.
