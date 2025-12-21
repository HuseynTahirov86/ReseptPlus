'use server';

import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

// In a server environment (like Firebase App Hosting), initializeApp() with no arguments
// will automatically use the available service account and project configuration
// from the environment variables.
if (!getApps().length) {
    app = initializeApp();
} else {
    app = getApp();
}

export const db = getFirestore(app);