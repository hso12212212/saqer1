import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg'

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    '[db] DATABASE_URL غير معرّف — تأكد من إنشاء ملف .env (انسخه من .env.example).',
  )
}

const useSsl = (process.env.PG_SSL ?? '').toLowerCase() === 'true'

export const pool = new Pool({
  connectionString: databaseUrl,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
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
