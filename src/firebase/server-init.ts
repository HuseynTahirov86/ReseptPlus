import { initializeApp, getApps, getApp, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';
config();

let dbInstance: any;

if (!getApps().length) {
    try {
        initializeApp({
            credential: cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // .env faylındakı private key-də olan \n simvollarını düzgün formatlaşdırır
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            }),
        });
        console.log("Firebase Admin SDK initialized successfully.");
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.message);
        // Bu xəta adətən .env faylındakı məlumatların səhv və ya əskik olması deməkdir.
    }
}

// Firestore instansiyasını alıb export edirik.
export const db = getFirestore();
