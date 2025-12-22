
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
config();

// Ensure Firebase Admin is initialized only once.
if (!getApps().length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
            throw new Error("Firebase Admin environment variables are not set. Check your .env file.");
        }
        
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines in the private key
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        // Log a more informative error to help with debugging .env issues.
        console.error("CRITICAL: Firebase Admin SDK initialization failed.", error.message);
    }
}

// Export the Firestore database instance for use in server actions.
export const db = getFirestore();
