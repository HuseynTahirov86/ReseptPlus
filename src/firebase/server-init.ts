import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Ensure Firebase Admin is initialized only once.
if (!getApps().length) {
    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const projectId = process.env.FIREBASE_PROJECT_ID;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

        if (!projectId || !clientEmail || !privateKey) {
            throw new Error("CRITICAL: Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Check your .env file.");
        }
        
        initializeApp({
            credential: cert({
                projectId: projectId,
                clientEmail: clientEmail,
                // Replace escaped newlines in the private key from .env file
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin SDK initialized successfully.");

    } catch (error: any) {
        // Log a more informative error to help with debugging .env issues.
        console.error("CRITICAL: Firebase Admin SDK initialization failed.", error.message);
        // In a real app, you might want to prevent the app from starting or handle this more gracefully.
    }
}

// Export the Firestore database instance for use in server actions.
export const db = getFirestore();
