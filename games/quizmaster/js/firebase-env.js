// Firebase project settings.
//
// You normally never edit this file. When the site is built, GitHub Actions
// replaces it with the values stored in your repository secrets
// (Settings > Secrets and variables > Actions). See docs/FIREBASE_LOGIN_SETUP.md.
//
// These values only tell the app WHICH Firebase project to talk to. They are
// not passwords. The security rules in firestore.rules protect the data.
export const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "PASTE_YOUR_PROJECT_ID",
  storageBucket: "PASTE_YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "PASTE_YOUR_SENDER_ID",
  appId: "PASTE_YOUR_APP_ID"
};
