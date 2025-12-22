import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file.
// This is crucial for server-side code to access process.env variables.
config();

// Ensure Firebase Admin is initialized only once across the application.
let app: App;
if (!getApps().length) {
    // These variables MUST be set in your .env file.
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

    // Check if all required environment variables are present.
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "CRITICAL: Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Check your .env file."
        );
    }
    
    // Initialize the app with the credentials.
    app = initializeApp({
        credential: cert({
            projectId: projectId,
            clientEmail: clientEmail,
            // The private key from the .env file often has escaped newlines (\\n).
            // We need to replace them with actual newline characters (\n).
            privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
    });
    console.log("Firebase Admin SDK initialized successfully.");
} else {
    // If already initialized, get the existing app instance.
    app = getApps()[0];
}

// Export the Firestore database instance for use in server actions.
export const db = getFirestore(app);
