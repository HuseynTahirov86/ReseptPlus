import { db } from "@/firebase/server-init";
import type { PricingPlan } from "@/lib/types";
import { PricingClientPage } from "./client-page";

async function getPlans() {
  try {
    const snapshot = await db.collection("pricingPlans").orderBy("price").get();
    const plans = snapshot.docs.map(doc => doc.data() as PricingPlan);
    return plans;
  } catch (error) {
    console.error("Error fetching pricing plans:", error);
    return [];
  }
}

export default async function AdminPricingPage() {
  const plans = await getPlans();
  return <PricingClientPage initialPlans={plans} />;
}
