import { db } from "@/firebase/server-init";
import { Inventory } from "@/lib/types";
import { InventoryClientPage } from "./client-page";
import { cookies } from "next/headers";
import { auth } from "firebase-admin";

async function getInventory(pharmacyId: string) {
  try {
    const snapshot = await db.collection(`pharmacies/${pharmacyId}/inventory`).orderBy("name").get();
    const medications = snapshot.docs.map(doc => doc.data() as Inventory);
    return medications;
  } catch (error) {
    console.error("Error fetching inventory:", error);
    return [];
  }
}

export default async function AdminInventoryPage() {
  const sessionCookie = cookies().get("session")?.value;
  if (!sessionCookie) {
    return <InventoryClientPage initialMedications={[]} />;
  }

  try {
    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    const userDoc = await db.collection("pharmacists").doc(decodedToken.uid).get();

    if (!userDoc.exists || userDoc.data()?.role !== 'head_pharmacist') {
      return <p className="text-destructive text-center p-8">Bu səhifəyə giriş üçün icazəniz yoxdur.</p>;
    }
    
    const pharmacyId = userDoc.data()?.pharmacyId;
    if (!pharmacyId) {
       return <p className="text-destructive text-center p-8">Əczaçı heç bir aptekə bağlı deyil.</p>;
    }

    const medications = await getInventory(pharmacyId);
    return <InventoryClientPage initialMedications={medications} />;
  } catch (error) {
     console.error("Error on inventory page:", error);
     return <InventoryClientPage initialMedications={[]} />;
  }
}
