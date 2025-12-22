// 'use server'; satırını SİL

import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let app: App;

if (!getApps().length) {
    app = initializeApp();
} else {
    app = getApp();
}

export const db = getFirestore(app);