import { getToken } from 'firebase/messaging'
import { messaging } from '../firebase'

export const requestNotificationPermission = async () => {
  if (!messaging) {
    console.log('Messaging not supported')
    return null
  }

  try {
    const permission = await Notification.requestPermission()

    if (permission === 'granted') {
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
      if (!vapidKey) {
        console.warn('VAPID key not configured')
        return null
      }

      const token = await getToken(messaging, { vapidKey })
      return token
    }

    return null
  } catch (error) {
    console.error('Error getting notification token:', error)
    return null
  }
}
