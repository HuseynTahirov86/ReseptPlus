// "use server" direktivini silin
import { initializeApp, getApps, getApp, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let dbInstance: any = null;

function getDb() {
    if (!dbInstance) {
        if (!getApps().length) {
            try {
                 initializeApp({
                    credential: cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    }),
                 });
                 console.log("Firebase Admin SDK initialized successfully.");
            } catch (e) {
                console.error("Firebase Admin SDK initialization error:", e);
                // Handle the error appropriately, maybe throw or log
            }
        }
        dbInstance = getFirestore();
    }
    return dbInstance;
}

export const db = getDb();
