// This file is populated from .env variables OR falls back to hardcoded values.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAT1SdEaITNIdv4WvWXXsoSeTg3gy7MQos",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-498030416-70ea5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-498030416-70ea5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-498030416-70ea5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "150295020220",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:150295020220:web:a596244b2b120daa9446b9",
};
