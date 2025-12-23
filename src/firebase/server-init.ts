import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { config } from 'dotenv';

config();

let app: App;

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || "studio-498030416-70ea5",
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@studio-498030416-70ea5.iam.gserviceaccount.com",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "-----BEGIN PRIVATE KEY-----\\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQCnaKZJDeS5v/X5\\n2EA9xk4cZ1EsPvqp9ZqADq4xBwPWmEPsNQxcem69+x1Fqx2VYSQomNfvTSSn2VGv\\ndIniJB7UhdXcAdEBjq8il1wV28PYPfRSVPWWB49G3ovpspFY3QPvI/d5XKEfUFKZ\\nuoeeYMUtUmxmR8rGQZDnTp9NmMb9pL0aVy3hRyGHzZfjXSdDEELilTPPr38CtKxr\\nbIAFh82wVVuXEq0W51hH3dG+034HNWWr/V69aPtfgJ/uclkV/RNeUsexJ375EKKz\\nZYc5gOVRlnl176sKmv4JpvVpRb+NFRarXKJzP68PK4FeNs3mBRdf31sV+GekVYdR\\n5LmXY0jhAgMBAAECggEAE1wH8CZ8qbnCvXqzbHwRzWQUoDFvoGxSynX9e+r2l9Wc\\n8+RrQl3gOkp0vKPzXwfQUXziFSjj0SCnEHYWz0GOan+drHxt9KhQ+txBHb//2nJz\\ns3piuiUJUyXqTS4ayTQp6nj2JfaUesAPBVBrsuDi/IDtyzgzLBEqANh361Z8cJlx\\nR8edcFWaFGQp6F7q4spN0A3MbDyVEiSeBQW9qJQWBSh6H6r8EOwIYXzWuEMu0L7k\\nZRR8H0IwcUegdD3TpkWriHAuY0+hoBT5ZXfB/+P8KMAKHuTC1Y8HVui/3wLTiMu\\n8nqKNhZpql8wfxugvsfxsUfF9/Z8vsBYFpy47LiylwKBgQDe75ySDqdFm3W/FNgH\\niFWsemoV7Wes+Z4dkMrA7q/WffTNfdDRpV9Ulg8aeHpyY3vkGiDbAgXrLW/fvyIa\\noUQiCrS8CQzFylhmFH01VHnhg/jm3FR7TQrw1Qt4Kg+qwwPn+Z29r+MC75gyHqO5\\nIk/9pHaf/m8ZvTrpkRMEc/XgZwKBgQDAPMrnqwBLGVsS6lv2SaZOShirQB9A7AhN\\nwL+1EZ3aNO7jIt/xZCm8ESf6ss681lQpMJhh8JmKdNQ1p1+nageNX/cw9zsnTu01\\n0T1GI3mDmixWf20BSX23nSMV9cgOOAyyww63bxp/bkFuCGeeedsnFAK9egHVyORU\\nI/nhRYifdwKBgQCBhpvkbGkZUyqFO5oMPlTwoisS1F1hLaKFMQPsNoGpUIM0BT6X\\nH8sUfR8HVSpnXY+0xs2CEVnY+ww95nHtIPdSBABgI63tGRRlMtBQdOVfdmrdzvOy\\ns9+Ab3d7eIyjvSx+0hOpCxENOqGltRGQ1fO9vZlCefSY8s3QuH5hHvKjTwKBgQCB\\nvEVfhctD44/QOzPnChtfeKgfYr307ZZJCw0WIRZ7/f8+cPnbijKURqvJiET3slnI\\nFpCwgFTO2TuiHhvy+x6vrZVAiYl1ZNG34UdN/4DxbOoBUiv5k2Rxt23HU0E5P2Bq\\ngDN9XlDusTUdEjUEAc8CF4Il56I3akWV91WbT3b9zwKBgQDHCPu71AWxpgqyf3BL\\nFx/rL/EQtx2orkmI0ZM19vE25qP5ZLgkchRLAuUu63kLTjS7mlkfx9r/lvlU8V2/\\nxYBfIahhJ56G/MYWvUZ/4SZBwc+VJLRIMLz3v/osBt39ArGV2nDMfsmg1S/p0V6D\\nlAW97mlvqFacpMyvNK+3Plml1A==\\n-----END PRIVATE KEY-----\\n").replace(/\\n/g, '\n'),
};

if (!getApps().length) {
    if (!serviceAccount.projectId || !serviceAccount.clientEmail || !serviceAccount.privateKey) {
         console.error("Firebase Admin SDK credentials are not set in .env or hardcoded. Server-side auth actions will fail.");
        // Initialize with a dummy to prevent crash, but this will fail on actual auth operations.
        app = initializeApp({ credential: cert({ projectId: 'dummy-project-for-dev' }) });
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
