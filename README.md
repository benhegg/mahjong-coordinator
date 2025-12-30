# Mahjong Coordinator 🀄

A mobile-friendly web app for coordinating mahjong games, built with React, Firebase, and Tailwind CSS.

## Features

- 📱 Phone number authentication (SMS verification)
- 🎨 Beautiful pink/rose gradient design
- 📲 Mobile-first responsive layout
- 🔐 Secure Firebase authentication

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth (Phone)
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

### Step 2: Enable Phone Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Enable **Phone** as a sign-in provider
3. Add your domain to the authorized domains list (for Codespaces, add `*.app.github.dev`)

### Step 3: Get Your Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps"
3. Click the **Web** icon (`</>`)
4. Register your app with a nickname
5. Copy the configuration values

### Step 4: Add Firebase Credentials to Your Project

**Method 1: Using Environment Variables (Recommended for Codespaces)**

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
   ```

3. Restart the dev server:
   ```bash
   npm run dev
   ```

**Method 2: Direct Configuration (Alternative)**

1. Open `src/firebase.js`
2. Replace the placeholder values with your actual Firebase config:
   ```javascript
   const firebaseConfig = {
     apiKey: "your_actual_api_key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "your_sender_id",
     appId: "your_app_id"
   };
   ```

⚠️ **Important**: Never commit your `.env` file with real credentials to Git! It's already in `.gitignore`.

## Project Structure

```
mahjong-coordinator/
├── public/             # Static assets
├── src/
│   ├── components/     # React components
│   │   └── Login.jsx   # Phone authentication component
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # React entry point
│   ├── firebase.js     # Firebase configuration
│   └── index.css       # Tailwind CSS imports
├── index.html          # HTML template
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
├── package.json        # Dependencies and scripts
└── .env.example        # Environment variables template
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Testing Phone Authentication

### Important Notes

1. **ReCAPTCHA**: Firebase uses invisible reCAPTCHA for security. This requires:
   - Your domain to be publicly accessible (Codespaces URLs work!)
   - The domain to be added to Firebase authorized domains

2. **Phone Number Format**:
   - Currently configured for US numbers (+1)
   - Enter 10 digits: e.g., `(555) 123-4567`

3. **Test Phone Numbers** (for development):
   - In Firebase Console > Authentication > Sign-in method > Phone
   - Scroll to "Phone numbers for testing"
   - Add test numbers and their verification codes
   - Example: `+1 555-555-5555` with code `123456`

## Troubleshooting

### Port 5173 Already in Use
```bash
# Kill the process using the port
npx kill-port 5173
# Or specify a different port in vite.config.js
```

### ReCAPTCHA Errors
- Make sure your domain is in Firebase authorized domains
- Check browser console for specific error messages
- Try using a test phone number (see above)

### Firebase Config Errors
- Verify all environment variables are set correctly
- Check for typos in `.env` file
- Ensure `.env` is in the project root
- Restart the dev server after changing `.env`

## Next Steps (Session 2 & 3)

- Add game coordination features
- Create lobby/room system
- Add player management
- Implement score tracking
- Add notifications

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
