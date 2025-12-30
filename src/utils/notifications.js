import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';

// Request notification permission and get FCM token
export const requestNotificationPermission = async () => {
  try {
    // Check if messaging is supported
    if (!messaging) {
      console.warn('Firebase Messaging is not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Notification permission granted.');

      // Get FCM token
      // Note: You'll need to add your VAPID key in Firebase Console:
      // Project Settings > Cloud Messaging > Web Push certificates
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;

      if (!vapidKey || vapidKey === 'YOUR_VAPID_KEY') {
        console.warn('VAPID key not configured. Please add it to your .env file.');
        return null;
      }

      const token = await getToken(messaging, { vapidKey });

      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else if (permission === 'denied') {
      console.log('Notification permission denied.');
      return null;
    } else {
      console.log('Notification permission dismissed.');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

// Listen for foreground messages
export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) {
      console.warn('Firebase Messaging is not supported');
      return;
    }

    onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      resolve(payload);
    });
  });
