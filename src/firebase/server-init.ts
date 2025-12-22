import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

// Load environment variables from .env file.
// This is crucial for server-side code to access process.env variables.
config();

// Ensure Firebase Admin is initialized only once across the application.
let app: App;

if (!getApps().length) {
    // These variables MUST be set in your environment (e.g., in a .env file).
    const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    // Check if all required environment variables for the Admin SDK are present.
    // This is the most common source of "unexpected errors" on the server.
    if (!projectId || !clientEmail || !privateKey) {
        throw new Error(
            "CRITICAL: Firebase Admin environment variables (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are not set. Please check your .env file or hosting environment configuration. These are required for server-side actions."
        );
    }
    
    try {
        // Initialize the app with the service account credentials.
        app = initializeApp({
            credential: cert({
                projectId: projectId,
                clientEmail: clientEmail,
                // The private key from .env files often has escaped newlines (\\n).
                // We need to replace them with actual newline characters (\n) for the cert object.
                privateKey: privateKey.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error) {
        console.error("Firebase Admin SDK initialization failed:", error);
        // Re-throw the error to ensure the server process fails loudly
        // instead of continuing in a broken state.
        throw new Error("Could not initialize Firebase Admin SDK. Please check your credentials.");
    }
} else {
    // If already initialized, get the existing app instance.
    app = getApps()[0];
}

// Export the Firestore database instance for use in server actions.
export const db = getFirestore(app);
