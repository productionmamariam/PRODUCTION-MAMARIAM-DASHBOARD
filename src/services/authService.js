// =============================================================================
// AUTH SERVICE — gates the "Import Orders" write feature behind a login.
// The dashboard itself (read-only) never requires login; only writing new
// order data does. Team accounts are created manually in Firebase Console
// (Authentication > Users) — see README "Import Orders" section.
// =============================================================================

import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from './firebase.js'

export const authService = {
  isAvailable: () => isFirebaseConfigured && Boolean(auth),

  signIn: async (email, password) => {
    if (!auth) throw new Error('Firebase is not configured yet.')
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  },

  signOutUser: async () => {
    if (!auth) return
    await signOut(auth)
  },

  // calls callback(user | null) immediately and on every auth change
  subscribe: (callback) => {
    if (!auth) {
      callback(null)
      return () => {}
    }
    return onAuthStateChanged(auth, callback)
  },
}
