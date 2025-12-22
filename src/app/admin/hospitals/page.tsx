import { db } from "@/firebase/server-init";
import type { Hospital } from "@/lib/types";
import { HospitalsClientPage } from "./client-page";

async function getHospitals() {
  try {
    const snapshot = await db.collection("hospitals").orderBy("name").get();
    const hospitals = snapshot.docs.map(doc => doc.data() as Hospital);
    return hospitals;
  } catch (error) {
    console.error("Error fetching hospitals:", error);
    return [];
  }
}

export default async function AdminHospitalsPage() {
  const hospitals = await getHospitals();
  return <HospitalsClientPage initialHospitals={hospitals} />;
}
