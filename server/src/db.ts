import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    '[db] DATABASE_URL غير معرّف — تأكد من إنشاء ملف .env (انسخه من .env.example).',
  )
}

/**
 * كشف تلقائي لحاجة SSL:
 *  - داخل شبكة Railway الخاصة (postgres.railway.internal) → SSL مُعطّل.
 *  - عبر بروكسي Railway العام (rlwy.net) أو مضيف Supabase/Neon/Render → SSL مُفعّل.
 *  - يمكن إجبار القيمة عبر PG_SSL=true|false (يتجاوز الكشف التلقائي).
 */
function resolveSsl(url: string | undefined): false | { rejectUnauthorized: false } {
  const explicit = (process.env.PG_SSL ?? '').toLowerCase()
  if (explicit === 'true') return { rejectUnauthorized: false }
  if (explicit === 'false') return false

  if (!url) return false

  // شبكة Railway الداخلية — لا SSL.
  if (url.includes('.railway.internal')) return false
  if (url.includes('localhost') || url.includes('127.0.0.1')) return false

  // مزوّدون سحابيون يتطلّبون SSL.
  const needsSsl = [
    'rlwy.net',           // Railway public proxy
    'railway.app',
    'supabase.co',
    'neon.tech',
    'render.com',
    'amazonaws.com',
    'azure.com',
    'gcp.neon',
  ].some((h) => url.includes(h))

  return needsSsl ? { rejectUnauthorized: false } : false
}

const ssl = resolveSsl(databaseUrl)

// eslint-disable-next-line no-console
console.log(
  `[db] الاتصال بـ Postgres — SSL: ${ssl ? 'مُفعّل' : 'مُعطّل'}${
    databaseUrl?.includes('.railway.internal') ? ' (شبكة Railway الداخلية)' : ''
  }`,
)

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: ssl || undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

pool.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.error('[db] unexpected pool error', err)
})

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: ReadonlyArray<unknown>,
): Promise<QueryResult<T>> {
  return pool.query<T>(text, params as unknown[] | undefined)
}

export async function withClient<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}
