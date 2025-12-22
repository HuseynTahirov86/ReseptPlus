import { db } from "@/firebase/server-init";
import type { Pharmacy } from "@/lib/types";
import { PharmaciesClientPage } from "./client-page";

async function getPharmacies() {
  try {
    const snapshot = await db.collection("pharmacies").orderBy("name").get();
    const pharmacies = snapshot.docs.map(doc => doc.data() as Pharmacy);
    return pharmacies;
  } catch (error) {
    console.error("Error fetching pharmacies:", error);
    return [];
  }
}

export default async function AdminPharmaciesPage() {
  const pharmacies = await getPharmacies();
  return <PharmaciesClientPage initialPharmacies={pharmacies} />;
}
