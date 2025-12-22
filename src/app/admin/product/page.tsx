import { db } from "@/firebase/server-init";
import type { ProductFeature } from "@/lib/types";
import { ProductClientPage } from "./client-page";

async function getFeatures() {
  try {
    const snapshot = await db.collection("productFeatures").orderBy("title").get();
    const features = snapshot.docs.map(doc => doc.data() as ProductFeature);
    return features;
  } catch (error) {
    console.error("Error fetching product features:", error);
    return [];
  }
}

export default async function AdminProductPage() {
  const features = await getFeatures();
  return <ProductClientPage initialFeatures={features} />;
}
