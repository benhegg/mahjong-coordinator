import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBXxxx",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mahjong-coordinator.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mahjong-coordinator",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mahjong-coordinator.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize messaging only if supported
let messaging = null
isSupported().then(yes => {
  if (yes) {
    messaging = getMessaging(app)
  }
}).catch(() => {
  // Messaging not supported
})

export { messaging }
