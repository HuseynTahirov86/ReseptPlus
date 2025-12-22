import { db } from "@/firebase/server-init";
import { auth } from "firebase-admin";
import type { Prescription, Doctor, Pharmacist, AppUser } from "@/lib/types";
import { DashboardClientPage } from "./client-page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


async function getDashboardData() {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0 } };
    }

    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;
    const userEmail = decodedToken.email || '';
    
    const collections = ['doctors', 'pharmacists', 'admins', 'systemAdmins', 'patients'];
    let userProfile: any = null;

    for (const collectionName of collections) {
        const doc = await db.collection(collectionName).doc(userId).get();
        if (doc.exists) {
            userProfile = { id: doc.id, ...doc.data() };
            break;
        }
    }
    
    if (!userProfile) {
        return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0 } };
    }

    const appUser = { uid: userId, email: userEmail, profile: userProfile } as AppUser;
    let prescriptions: Prescription[] = [];
    const stats = { prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0, pendingPrescriptions: 0 };
    
    const presCollection = db.collection("prescriptions");

    if (userProfile.role === 'doctor') {
        const snapshot = await presCollection.where("doctorId", "==", userId).orderBy("datePrescribed", "desc").limit(10).get();
        prescriptions = snapshot.docs.map(doc => doc.data() as Prescription);
    } else if (userProfile.role === 'head_doctor' && userProfile.hospitalId) {
        const snapshot = await presCollection.where("hospitalId", "==", userProfile.hospitalId).orderBy("datePrescribed", "desc").limit(10).get();
        prescriptions = snapshot.docs.map(doc => doc.data() as Prescription);
    }
    
    // Initial stats can be calculated here if needed, but client-side fetching is more real-time.

    return { user: appUser, prescriptions, stats };

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0, inventoryCount: 0 } };
  }
}


export default async function DashboardPage() {
  const { user, prescriptions, stats } = await getDashboardData();
  
  return <DashboardClientPage initialUser={user} initialPrescriptions={prescriptions} initialStats={stats} />;
}
