import { db } from "@/firebase/server-init";
import { auth } from "firebase-admin";
import type { Prescription, Doctor } from "@/lib/types";
import { DashboardClientPage } from "./client-page";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";


async function getDashboardData() {
  try {
    const sessionCookie = cookies().get("session")?.value;
    if (!sessionCookie) {
      return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0 } };
    }

    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    const doctorsCollection = db.collection("doctors");
    const userDoc = await doctorsCollection.doc(userId).get();
    
    if (!userDoc.exists) {
        // This handles cases where the user might be another role, but trying to access the doctor dashboard
        // A more robust role check might be needed here, but for now we focus on doctor/head_doctor
         const pharmacistsCollection = db.collection("pharmacists");
         const pharmacistDoc = await pharmacistsCollection.doc(userId).get();
         if(pharmacistDoc.exists) {
            const pharmacistProfile = { id: pharmacistDoc.id, ...pharmacistDoc.data() };
            return { user: { uid: userId, profile: pharmacistProfile }, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0 } };
         }
         return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0 } };
    }

    const userProfile = { id: userDoc.id, ...userDoc.data() } as Doctor;

    let prescriptions: Prescription[] = [];
    let presCount = 0;
    let patientCount = 0;
    let docCount = 0;
    
    const prescriptionsCollection = db.collection("prescriptions");
    
    if (userProfile.role === 'doctor') {
        const snapshot = await prescriptionsCollection.where("doctorId", "==", userId).orderBy("datePrescribed", "desc").limit(10).get();
        prescriptions = snapshot.docs.map(doc => doc.data() as Prescription);
        presCount = (await prescriptionsCollection.where("doctorId", "==", userId).count().get()).data().count;

    } else if (userProfile.role === 'head_doctor' && userProfile.hospitalId) {
        const snapshot = await prescriptionsCollection.where("hospitalId", "==", userProfile.hospitalId).orderBy("datePrescribed", "desc").limit(10).get();
        prescriptions = snapshot.docs.map(doc => doc.data() as Prescription);
        presCount = (await prescriptionsCollection.where("hospitalId", "==", userProfile.hospitalId).count().get()).data().count;
        docCount = (await doctorsCollection.where("hospitalId", "==", userProfile.hospitalId).count().get()).data().count;
    }
    
    patientCount = (await db.collection("patients").count().get()).data().count;

    return {
      user: { uid: userId, profile: userProfile },
      prescriptions,
      stats: {
        prescriptions: presCount,
        patients: patientCount,
        doctors: docCount,
      }
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // If there's an error (e.g., cookie expired), redirect to login
    // This is a server component, so we use redirect
    if (error instanceof Error && (error.message.includes('session cookie') || error.message.includes('token'))) {
        redirect('/login');
    }
    return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0 } };
  }
}


export default async function DashboardPage() {
  const { user, prescriptions, stats } = await getDashboardData();
  return <DashboardClientPage initialUser={user} initialPrescriptions={prescriptions} initialStats={stats} />;
}
