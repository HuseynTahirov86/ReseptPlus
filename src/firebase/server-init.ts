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
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
        if (process.env.NODE_ENV === 'production') {
            console.warn("Firebase Admin SDK credentials not found in environment variables. Production functionalities might be affected.");
            // In production, we might rely on default credentials if available
            app = initializeApp();
        } else {
            console.error("Firebase Admin SDK credentials are not set. Please check your .env file.");
            // To avoid crashing the dev server, we can create a dummy app, but auth-dependent features will fail.
            app = initializeApp({ credential: cert({ projectId: 'dummy-project' }) });
        }
    } else {
        app = initializeApp({
            credential: cert(serviceAccount),
        });
    }
} else {
    app = getApps()[0];
}

export const db = getFirestore(app);
export const auth = getAuth(app);
