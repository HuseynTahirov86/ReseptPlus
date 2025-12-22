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
      // Artıq yönləndirmirik. Sadəcə məlumatların olmadığını qeyd edirik.
      // RedirectHandler bu vəziyyəti idarə edəcək.
      return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0 } };
    }

    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;

    // Doctor check
    const doctorDoc = await db.collection("doctors").doc(userId).get();
    if (doctorDoc.exists) {
        const userProfile = { id: doctorDoc.id, ...doctorDoc.data() } as Doctor;
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
            docCount = (await db.collection("doctors").where("hospitalId", "==", userProfile.hospitalId).count().get()).data().count;
        }
        
        patientCount = (await db.collection("patients").count().get()).data().count;

        return {
          user: { uid: userId, email: decodedToken.email, profile: userProfile } as AppUser,
          prescriptions,
          stats: {
            prescriptions: presCount,
            patients: patientCount,
            doctors: docCount,
          }
        };
    }

    // Pharmacist check
    const pharmacistDoc = await db.collection("pharmacists").doc(userId).get();
    if (pharmacistDoc.exists) {
        const pharmacistProfile = { id: pharmacistDoc.id, ...pharmacistDoc.data() } as Pharmacist;
        return { 
            user: { uid: userId, email: decodedToken.email, profile: pharmacistProfile } as AppUser,
            prescriptions: [], 
            stats: { prescriptions: 0, patients: 0, doctors: 0 } 
        };
    }

    // Admin checks
    const adminDoc = await db.collection('admins').doc(userId).get();
    if (adminDoc.exists()) {
        const adminProfile = adminDoc.data();
        return {
            user: { uid: userId, email: decodedToken.email, profile: adminProfile } as AppUser,
            prescriptions: [],
            stats: { prescriptions: 0, patients: 0, doctors: 0 }
        };
    }

    const systemAdminDoc = await db.collection('systemAdmins').doc(userId).get();
    if (systemAdminDoc.exists()) {
        const systemAdminProfile = systemAdminDoc.data();
        return {
            user: { uid: userId, email: decodedToken.email, profile: systemAdminProfile } as AppUser,
            prescriptions: [],
            stats: { prescriptions: 0, patients: 0, doctors: 0 }
        };
    }

    // No profile found, let RedirectHandler manage it.
    return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0 } };

  } catch (error) {
    // Səssizcə xətanı qeyd edirik, lakin yönləndirmirik.
    // NEXT_REDIRECT xətası da daxil olmaqla, hər hansı bir xəta,
    // istifadəçinin yönləndirilməsinə səbəb olmamalıdır.
    console.error("Error fetching dashboard data:", error);
    return { user: null, prescriptions: [], stats: { prescriptions: 0, patients: 0, doctors: 0 } };
  }
}


export default async function DashboardPage() {
  const { user, prescriptions, stats } = await getDashboardData();
  
  // Əgər server tərəfində istifadəçi tapılmazsa, client-side məntiqinə güvənirik.
  // Bu, ilkin yükləmə zamanı boş bir səhifə göstərə bilər, lakin RedirectHandler onu düzgün yerə göndərəcək.
  return <DashboardClientPage initialUser={user} initialPrescriptions={prescriptions} initialStats={stats} />;
}
