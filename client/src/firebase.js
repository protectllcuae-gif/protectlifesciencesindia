import { initializeApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const missingKeys = Object.entries(firebaseConfig).filter(([, value]) => !value).map(([key]) => key)
if (missingKeys.length > 0) {
  throw new Error(
    `Missing Firebase environment variables: ${missingKeys.join(', ')}. ` +
      'Ensure your root .env file contains VITE_FIREBASE_* values and rebuild the client.'
  )
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const provider = new GoogleAuthProvider()

export async function signInWithGoogle(){
  const result = await signInWithPopup(auth, provider)
  return result.user
}

export async function signOutGoogle(){
  return signOut(auth)
}

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function createAccount(email, password, userType) {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await setDoc(doc(db, userType === 'client' ? 'clients' : 'customers', credential.user.uid), {
    email,
    role: userType,
    createdAt: serverTimestamp(),
  })
  return credential.user
}

export async function isAdminUser(uid) {
  const snapshot = await getDoc(doc(db, 'admins', uid))
  return snapshot.exists()
}

export default app
