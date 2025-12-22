import { db } from "@/firebase/server-init";
import type { Pharmacist, Pharmacy } from "@/lib/types";
import { PharmacistsClientPage } from "./client-page";

async function getPharmacistsAndPharmacies() {
  try {
    const pharmacistsSnapshot = await db.collection("pharmacists").orderBy("lastName").get();
    const pharmacists = pharmacistsSnapshot.docs.map(doc => doc.data() as Pharmacist);

    const pharmaciesSnapshot = await db.collection("pharmacies").orderBy("name").get();
    const pharmacies = pharmaciesSnapshot.docs.map(doc => doc.data() as Pharmacy);

    return { pharmacists, pharmacies };
  } catch (error) {
    console.error("Error fetching pharmacists/pharmacies:", error);
    return { pharmacists: [], pharmacies: [] };
  }
}

export default async function AdminPharmacistsPage() {
  const { pharmacists, pharmacies } = await getPharmacistsAndPharmacies();
  return <PharmacistsClientPage initialPharmacists={pharmacists} initialPharmacies={pharmacies} />;
}
