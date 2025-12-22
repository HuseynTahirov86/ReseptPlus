import { db } from "@/firebase/server-init";
import type { Doctor, Hospital } from "@/lib/types";
import { DoctorsClientPage } from "./client-page";

async function getDoctorsAndHospitals() {
  try {
    const doctorsSnapshot = await db.collection("doctors").orderBy("lastName").get();
    const doctors = doctorsSnapshot.docs.map(doc => doc.data() as Doctor);

    const hospitalsSnapshot = await db.collection("hospitals").orderBy("name").get();
    const hospitals = hospitalsSnapshot.docs.map(doc => doc.data() as Hospital);

    return { doctors, hospitals };
  } catch (error) {
    console.error("Error fetching doctors/hospitals:", error);
    return { doctors: [], hospitals: [] };
  }
}

export default async function AdminDoctorsPage() {
  const { doctors, hospitals } = await getDoctorsAndHospitals();
  return <DoctorsClientPage initialDoctors={doctors} initialHospitals={hospitals} />;
}
