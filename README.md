# Mahjong Night 🀄

A mobile-friendly web app for coordinating mahjong games with your group. Built with React, Firebase, and Tailwind CSS.

## Features

- 🔐 Google Sign-In authentication
- 🔔 Push notifications for game updates
- 🎨 Beautiful pink/rose gradient design
- 📲 Mobile-first responsive layout
- ☁️ Cloud Firestore for user data
- 🚀 Fast and modern with Vite

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Google)
- **Database**: Cloud Firestore
- **Notifications**: Firebase Cloud Messaging
- **Routing**: React Router v6
- **Hosting**: Designed for deployment on any static host

## Getting Started

### Option 1: Run in GitHub Codespaces (Recommended)

1. **Open in Codespaces**
   - Navigate to this repository on GitHub
   - Click the green **Code** button
   - Select **Codespaces** tab
   - Click **Create codespace on [branch-name]**
   - Wait for the environment to build (usually 1-2 minutes)

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (see section below)

4. **Start the Development Server**
   ```bash
   npm run dev
   ```

5. **View the App**
   - Codespaces will show a notification about port 5173
   - Click "Open in Browser" or go to the Ports tab
   - Your app will open in a new browser tab

### Option 2: Run Locally

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd mahjong-coordinator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase** (see section below)

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to `http://localhost:5173`

## Firebase Configuration

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Follow the setup wizard

### Step 2: Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** in the sign-in providers list
3. Toggle **Enable** to ON
4. Set a **Project support email** (required by Google)
5. Click **Save**
6. Add your domain to the authorized domains list:
   - For Codespaces: Add `*.app.github.dev`
   - For local development: `localhost` should already be there

### Step 3: Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development)
   - ⚠️ Remember to update security rules before production!
4. Select a Firestore location (choose one close to your users)
5. Click **Enable**

### Step 4: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Click on the **Cloud Messaging** tab
3. Under **Web Push certificates**, click **Generate key pair**
4. Copy the **Key pair** value - this is your VAPID key

### Step 5: Get Your Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`) to add a web app
4. Register your app with a nickname (e.g., "Mahjong Night Web")
5. Copy all the configuration values

### Step 6: Add Firebase Credentials to Your Project

**Method 1: Using Environment Variables (Recommended)**

1. Create a `.env` file in the project root:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and fill in your Firebase configuration:
   ```env
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key_from_step_4
   ```

3. **Also update** `public/firebase-messaging-sw.js`:
   - Open the file
   - Replace the placeholder values with your actual Firebase config
   - This is necessary for background notifications to work

4. Restart the dev server:
   ```bash
   npm run dev
   ```

**Method 2: Direct Configuration (Not Recommended)**

1. Open `src/firebase.js`
2. Replace the placeholder values with your actual Firebase config
3. Open `public/firebase-messaging-sw.js`
4. Replace the placeholder values there as well

⚠️ **Important**: Never commit your `.env` file with real credentials to Git! It's already in `.gitignore`.

## Project Structure

```
mahjong-coordinator/
├── public/
│   └── firebase-messaging-sw.js  # Service worker for notifications
├── src/
│   ├── components/
│   │   └── Login.jsx             # Google Sign-In & notifications
│   ├── utils/
│   │   └── notifications.js      # FCM helper functions
│   ├── App.jsx                   # Main app with routing
│   ├── main.jsx                  # React entry point
│   ├── firebase.js               # Firebase configuration
│   └── index.css                 # Tailwind CSS imports
├── index.html                    # HTML template
├── vite.config.js                # Vite configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── package.json                  # Dependencies and scripts
└── .env.example                  # Environment variables template
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## How Authentication Works

1. **Google Sign-In**
   - User clicks "Sign in with Google"
   - Firebase handles the OAuth flow via popup
   - User selects their Google account
   - App receives user info (name, email, photo)

2. **Notification Permission**
   - After successful login, user is prompted to enable notifications
   - If user accepts, FCM token is generated
   - Token is stored in Firestore under `/users/{uid}`
   - This token is used to send push notifications

3. **User Profile Storage**
   - User data is automatically saved to Firestore:
     - Display name
     - Email
     - Profile photo URL
     - FCM token
     - Notification preference

## Notifications

### How It Works

- **Foreground**: When app is open, notifications are handled by `src/utils/notifications.js`
- **Background**: When app is closed, notifications are handled by `public/firebase-messaging-sw.js`

### Testing Notifications

1. **Enable notifications** in the app after signing in
2. Go to Firebase Console > **Cloud Messaging** > **Send test message**
3. Add your FCM token (check browser console logs)
4. Send a test notification

### Notification Permissions

Users can:
- Enable notifications on first login
- Skip and enable later (feature to be added in session 2)
- Receive notifications about:
  - New game invitations
  - Game reminders
  - Player availability updates

## Firestore Security Rules

⚠️ **Before going to production**, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Add more rules for game coordination features in session 2
  }
}
```

## Troubleshooting

### Google Sign-In Issues

**Pop-up blocked:**
- Allow pop-ups in your browser settings
- Or try signing in via redirect (requires code changes)

**Unauthorized domain:**
- Make sure your domain is listed in Firebase Console > Authentication > Settings > Authorized domains
- For Codespaces: Add `*.app.github.dev`

### Notification Issues

**Permission denied:**
- User must manually enable notifications in browser settings
- On mobile: Check app notification settings in device settings

**No token generated:**
- Verify VAPID key is set in `.env`
- Check that `firebase-messaging-sw.js` has correct config
- Service workers only work on HTTPS or localhost

**Service worker errors:**
- Make sure `firebase-messaging-sw.js` is in the `public` folder
- Clear browser cache and service workers (DevTools > Application > Service Workers)

### Firebase Config Errors

- Verify all environment variables are set correctly
- Check for typos in `.env` file
- Ensure `.env` is in the project root
- Restart the dev server after changing `.env`
- Don't forget to update `public/firebase-messaging-sw.js` too!

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Google Sign-In works, but push notifications have limited support
- **Mobile browsers**: Full support on Android, limited notifications on iOS

## Next Steps (Session 2 & 3)

- Create game coordination features
- Build lobby/room system
- Add player management
- Implement score tracking
- Send real notifications for game events
- Add settings page to manage notifications

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
