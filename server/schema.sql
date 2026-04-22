-- مخطط قاعدة بيانات متجر الصقر (PostgreSQL)
-- الأسماء مسبوقة بـ saqer_ لتجنّب التعارض مع جداول سابقة في نفس القاعدة.
-- الملف idempotent — يمكن تشغيله عدّة مرّات بأمان.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS saqer_categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name_ar     TEXT NOT NULL,
  name_en     TEXT,
  description TEXT,
  icon        TEXT,
  image_url   TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE saqer_categories ADD COLUMN IF NOT EXISTS image_url TEXT;

CREATE TABLE IF NOT EXISTS saqer_products (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL UNIQUE,
  name_ar      TEXT NOT NULL,
  name_en      TEXT,
  description  TEXT,
  price        NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  currency     TEXT NOT NULL DEFAULT 'SAR',
  stock        INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url    TEXT,
  images       JSONB NOT NULL DEFAULT '[]'::jsonb,
  category_id  UUID REFERENCES saqer_categories(id) ON DELETE SET NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE saqer_products ADD COLUMN IF NOT EXISTS images JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_saqer_products_category_id ON saqer_products(category_id);
CREATE INDEX IF NOT EXISTS idx_saqer_products_is_active   ON saqer_products(is_active);
CREATE INDEX IF NOT EXISTS idx_saqer_categories_sort      ON saqer_categories(sort_order);

CREATE OR REPLACE FUNCTION saqer_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_saqer_categories_updated_at ON saqer_categories;
CREATE TRIGGER trg_saqer_categories_updated_at
  BEFORE UPDATE ON saqer_categories
  FOR EACH ROW EXECUTE FUNCTION saqer_set_updated_at();

DROP TRIGGER IF EXISTS trg_saqer_products_updated_at ON saqer_products;
CREATE TRIGGER trg_saqer_products_updated_at
  BEFORE UPDATE ON saqer_products
  FOR EACH ROW EXECUTE FUNCTION saqer_set_updated_at();

CREATE TABLE IF NOT EXISTS saqer_settings (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS trg_saqer_settings_updated_at ON saqer_settings;
CREATE TRIGGER trg_saqer_settings_updated_at
  BEFORE UPDATE ON saqer_settings
  FOR EACH ROW EXECUTE FUNCTION saqer_set_updated_at();

INSERT INTO saqer_settings (key, value) VALUES
  ('hero', jsonb_build_object(
    'image_url', 'https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=1920&q=80',
    'title',     'متجر الصقر',
    'subtitle',  'مستلزمات التخييم والرحلات'
  ))
ON CONFLICT (key) DO NOTHING;

-- استبدال صورة الواجهة القديمة (غابة خضراء) بصورة صحراوية محايدة إن كانت لا تزال مستخدمة
UPDATE saqer_settings
   SET value = jsonb_set(
         value,
         '{image_url}',
         '"https://images.unsplash.com/photo-1533873984035-25970ab07461?auto=format&fit=crop&w=1920&q=80"'::jsonb
       )
 WHERE key = 'hero'
   AND value->>'image_url' = 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1920&q=80';

CREATE TABLE IF NOT EXISTS saqer_orders (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number    SERIAL UNIQUE,
  customer_name   TEXT NOT NULL,
  phone           TEXT NOT NULL,
  governorate     TEXT NOT NULL,
  district        TEXT NOT NULL,
  landmark        TEXT,
  notes           TEXT,
  items           JSONB NOT NULL DEFAULT '[]'::jsonb,
  total           NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  currency        TEXT NOT NULL DEFAULT 'IQD',
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','confirmed','shipped','delivered','cancelled')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saqer_orders_status    ON saqer_orders(status);
CREATE INDEX IF NOT EXISTS idx_saqer_orders_created   ON saqer_orders(created_at DESC);

DROP TRIGGER IF EXISTS trg_saqer_orders_updated_at ON saqer_orders;
CREATE TRIGGER trg_saqer_orders_updated_at
  BEFORE UPDATE ON saqer_orders
  FOR EACH ROW EXECUTE FUNCTION saqer_set_updated_at();
