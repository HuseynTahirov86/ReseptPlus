import { db } from "@/firebase/server-init";
import { Inventory } from "@/lib/types";
import { InventoryClientPage } from "./client-page";
import { cookies } from "next/headers";
import { auth } from "firebase-admin";

// This page now only acts as a wrapper. All logic is in client-page.
export default async function AdminInventoryPage() {
  return <InventoryClientPage />;
}
