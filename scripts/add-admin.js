/*
 * Adds an admin document to Firestore at /admins/{uid}
 * Usage: set FIREBASE_SERVICE_ACCOUNT_PATH in .env then run:
 * node scripts/add-admin.js <uid>
 */

const admin = require('firebase-admin')
const path = require('path')

const uid = process.argv[2]
if (!uid) {
  console.error('Usage: node scripts/add-admin.js <uid>')
  process.exit(1)
}

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json'

try {
  const serviceAccount = require(path.resolve(serviceAccountPath))
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
} catch (error) {
  console.error('Failed to load service account JSON:', error)
  process.exit(1)
}

const db = admin.firestore()

async function addAdmin() {
  await db.doc(`admins/${uid}`).set({ createdAt: admin.firestore.FieldValue.serverTimestamp() })
  console.log('Admin created:', uid)
}

addAdmin().catch((error) => {
  console.error(error)
  process.exit(1)
})
