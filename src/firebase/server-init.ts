import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

config();

let app: App;

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    if (process.env.NODE_ENV === 'production' && (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey)) {
        // In a real production environment (like Vercel), we might rely on default application credentials
        // but for this build process, if .env is missing, we must handle it gracefully.
        console.warn("Firebase Admin SDK credentials not found in environment variables for production build. Admin-dependent server actions (like user creation) may fail if not configured correctly on the server.");
        // We initialize with a dummy project to prevent the build from crashing.
        // The actual server environment MUST have the correct .env variables.
        app = initializeApp({ credential: cert({ projectId: 'dummy-project-for-build' }) });
    } else if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        // For local development
        console.error("Firebase Admin SDK credentials are not set in .env. Server-side auth actions will fail.");
        app = initializeApp({ credential: cert({ projectId: 'dummy-project-for-dev' }) });
    }
    else {
        // Credentials are provided
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    }
} else {
    app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
