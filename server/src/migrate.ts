import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { pool } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

async function main() {
  const schemaPath = resolve(__dirname, '../schema.sql')
  const sql = await readFile(schemaPath, 'utf8')

  // eslint-disable-next-line no-console
  console.log('[migrate] تطبيق schema.sql ...')
  await pool.query(sql)
  // eslint-disable-next-line no-console
  console.log('[migrate] تم بنجاح.')
  await pool.end()
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('[migrate] فشل:', err)
  process.exit(1)
})
