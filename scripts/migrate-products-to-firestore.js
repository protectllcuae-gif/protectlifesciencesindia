/*
 * Migrates seed products into Firestore.
 * Usage: set FIREBASE_SERVICE_ACCOUNT_PATH in .env then run:
 * node scripts/migrate-products-to-firestore.js
 */

const admin = require('firebase-admin')
const path = require('path')
const { seedProducts } = require(path.resolve(__dirname, '..', 'server', 'db', 'products-catalog'))

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'

try {
  const serviceAccount = require(path.resolve(serviceAccountPath))
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
} catch (error) {
  console.error('Failed to load service account JSON:', error)
  process.exit(1)
}

const db = admin.firestore()

async function migrate() {
  for (const product of seedProducts) {
    const docRef = db.collection('products').doc(product.slug)
    await docRef.set(product, { merge: true })
    console.log('Migrated', product.slug)
  }
  console.log('Migration complete')
}

migrate().catch((error) => {
  console.error(error)
  process.exit(1)
})
