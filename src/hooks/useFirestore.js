import { useState, useCallback, useRef, useEffect } from 'react'
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  documentId
} from 'firebase/firestore'
import { db } from '../firebase'

/**
 * Error messages mapped to user-friendly descriptions
 */
const ERROR_MESSAGES = {
  'permission-denied': 'You don\'t have permission to perform this action.',
  'not-found': 'The requested data could not be found.',
  'unavailable': 'Service temporarily unavailable. Please try again.',
  'cancelled': 'Operation was cancelled.',
  'unknown': 'An unexpected error occurred. Please try again.',
  'unauthenticated': 'Please sign in to continue.',
  'resource-exhausted': 'Too many requests. Please wait a moment.',
  'failed-precondition': 'Operation cannot be completed at this time.',
  'aborted': 'Operation was interrupted. Please try again.'
}

/**
 * Converts Firestore error to user-friendly message
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
const getErrorMessage = (error) => {
  const code = error.code?.replace('firestore/', '') || 'unknown'
  return ERROR_MESSAGES[code] || error.message || ERROR_MESSAGES.unknown
}

/**
 * Custom hook for Firestore document operations with error handling
 *
 * @param {string} collectionName - Name of the Firestore collection
 * @returns {Object} Document operations and state
 */
export const useDocument = (collectionName) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => setError(null), [])

  const getDocument = useCallback(async (docId) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(db, collectionName, docId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() }
      }
      return null
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error(`Error fetching ${collectionName}/${docId}:`, err)
      return null
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const setDocument = useCallback(async (docId, data, merge = true) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(db, collectionName, docId)
      await setDoc(docRef, data, { merge })
      return true
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error(`Error setting ${collectionName}/${docId}:`, err)
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const updateDocument = useCallback(async (docId, data) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(db, collectionName, docId)
      await updateDoc(docRef, data)
      return true
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error(`Error updating ${collectionName}/${docId}:`, err)
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  const deleteDocument = useCallback(async (docId) => {
    setLoading(true)
    setError(null)
    try {
      const docRef = doc(db, collectionName, docId)
      await deleteDoc(docRef)
      return true
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error(`Error deleting ${collectionName}/${docId}:`, err)
      return false
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  return {
    loading,
    error,
    clearError,
    getDocument,
    setDocument,
    updateDocument,
    deleteDocument
  }
}

/**
 * Custom hook for Firestore collection queries with error handling
 *
 * @param {string} collectionName - Name of the Firestore collection
 * @returns {Object} Query operations and state
 */
export const useCollection = (collectionName) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const clearError = useCallback(() => setError(null), [])

  const queryDocuments = useCallback(async (constraints = []) => {
    setLoading(true)
    setError(null)
    try {
      const collectionRef = collection(db, collectionName)
      const q = constraints.length > 0
        ? query(collectionRef, ...constraints)
        : collectionRef

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error(`Error querying ${collectionName}:`, err)
      return []
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  /**
   * Batch fetch documents by their IDs (max 10 per batch due to Firestore limitations)
   * @param {string[]} ids - Array of document IDs
   * @returns {Promise<Array>} Array of documents
   */
  const getByIds = useCallback(async (ids) => {
    if (!ids || ids.length === 0) return []

    setLoading(true)
    setError(null)
    try {
      const results = []
      // Firestore 'in' query supports max 10 items, so we batch
      const batches = []
      for (let i = 0; i < ids.length; i += 10) {
        batches.push(ids.slice(i, i + 10))
      }

      for (const batch of batches) {
        const collectionRef = collection(db, collectionName)
        const q = query(collectionRef, where(documentId(), 'in', batch))
        const snapshot = await getDocs(q)
        results.push(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      }

      return results
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      console.error(`Error batch fetching ${collectionName}:`, err)
      return []
    } finally {
      setLoading(false)
    }
  }, [collectionName])

  return {
    loading,
    error,
    clearError,
    queryDocuments,
    getByIds,
    // Re-export query helpers for convenience
    where,
    orderBy,
    limit
  }
}

/**
 * Custom hook for real-time Firestore document subscription
 *
 * @param {string} collectionName - Name of the Firestore collection
 * @param {string} docId - Document ID to subscribe to
 * @returns {Object} Document data and state
 */
export const useRealtimeDocument = (collectionName, docId) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const unsubscribeRef = useRef(null)

  useEffect(() => {
    if (!docId) {
      setData(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const docRef = doc(db, collectionName, docId)
    unsubscribeRef.current = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() })
        } else {
          setData(null)
        }
        setLoading(false)
      },
      (err) => {
        const message = getErrorMessage(err)
        setError(message)
        console.error(`Error subscribing to ${collectionName}/${docId}:`, err)
        setLoading(false)
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [collectionName, docId])

  return { data, loading, error }
}

/**
 * Custom hook for real-time Firestore collection subscription
 *
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Array} constraints - Query constraints (where, orderBy, limit)
 * @returns {Object} Collection data and state
 */
export const useRealtimeCollection = (collectionName, constraints = []) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const unsubscribeRef = useRef(null)

  // Stringify constraints for dependency comparison
  const constraintsKey = JSON.stringify(constraints.map(c => c.toString()))

  useEffect(() => {
    setLoading(true)
    setError(null)

    const collectionRef = collection(db, collectionName)
    const q = constraints.length > 0
      ? query(collectionRef, ...constraints)
      : collectionRef

    unsubscribeRef.current = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setData(docs)
        setLoading(false)
      },
      (err) => {
        const message = getErrorMessage(err)
        setError(message)
        console.error(`Error subscribing to ${collectionName}:`, err)
        setLoading(false)
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [collectionName, constraintsKey])

  return { data, loading, error }
}

export { where, orderBy, limit }
