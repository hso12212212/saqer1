import 'dotenv/config'
import { pool } from './db.js'

async function main() {
  for (const t of ['categories', 'products', 'orders']) {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ${t}`,
    )
    // eslint-disable-next-line no-console
    console.log(`${t}: ${rows[0]?.count ?? '?'} rows`)
  }
  await pool.end()
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
