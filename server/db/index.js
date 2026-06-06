const path = require('path')
const Database = require('better-sqlite3')
const { createClient } = require('@libsql/client')

const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN
const isTurso = Boolean(tursoUrl)

let localDb
let tursoClient

if (isTurso) {
  tursoClient = createClient({
    url: tursoUrl,
    authToken: tursoAuthToken,
  })
} else {
  const dbPath = path.join(__dirname, 'protectgummies.db')
  localDb = new Database(dbPath)
  localDb.pragma('journal_mode = WAL')
}

const { seedProducts } = require('./products-catalog')

function normalizeArgs(args) {
  if (!args) return []
  return Array.isArray(args) ? args : [args]
}

function normalizeRow(row) {
  if (!row) return null
  return { ...row }
}

async function all(sql, args = []) {
  const normalizedArgs = normalizeArgs(args)
  if (isTurso) {
    const result = await tursoClient.execute({ sql, args: normalizedArgs })
    return result.rows.map((row) => normalizeRow(row))
  }
  return localDb.prepare(sql).all(...normalizedArgs)
}

async function get(sql, args = []) {
  const rows = await all(sql, args)
  return rows[0] || null
}

async function run(sql, args = []) {
  const normalizedArgs = normalizeArgs(args)
  if (isTurso) {
    const result = await tursoClient.execute({ sql, args: normalizedArgs })
    return {
      changes: result.rowsAffected || 0,
      lastInsertRowid: Number(result.lastInsertRowid || 0),
    }
  }
  const result = localDb.prepare(sql).run(...normalizedArgs)
  return {
      changes: result.changes,
      lastInsertRowid: Number(result.lastInsertRowid || 0),
  }
}

async function initDatabase() {
  const createTableSql = `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT,
      full_description TEXT,
      ingredients TEXT,
      benefits TEXT,
      price REAL,
      image_url TEXT,
      category TEXT,
      is_featured INTEGER DEFAULT 0
    );
  `

  if (isTurso) {
    await tursoClient.execute(createTableSql)
  } else {
    localDb.exec(createTableSql)
  }

  const countRow = await get('SELECT COUNT(*) AS count FROM products')
  const totalProducts = Number(countRow?.count || 0)

  if (totalProducts > 0) {
    return
  }

  const insertSql = `
    INSERT INTO products (
      name,
      slug,
      short_description,
      full_description,
      ingredients,
      benefits,
      price,
      image_url,
      category,
      is_featured
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  for (const product of seedProducts) {
    await run(insertSql, [
      product.name,
      product.slug,
      product.short_description,
      product.full_description,
      product.ingredients,
      product.benefits,
      product.price,
      product.image_url,
      product.category,
      product.is_featured,
    ])
  }
}

module.exports = {
  all,
  get,
  run,
  initDatabase,
  isTurso,
}
