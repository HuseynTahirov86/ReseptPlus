import { db } from "@/firebase/server-init";
import type { Admin, SystemAdmin } from "@/lib/types";
import { UsersClientPage } from "./client-page";

async function getAdmins() {
  try {
    const adminsSnapshot = await db.collection("admins").orderBy("email").get();
    const admins = adminsSnapshot.docs.map(doc => doc.data() as Admin);

    const systemAdminsSnapshot = await db.collection("systemAdmins").orderBy("email").get();
    const systemAdmins = systemAdminsSnapshot.docs.map(doc => doc.data() as SystemAdmin);

    return { admins, systemAdmins };
  } catch (error) {
    console.error("Error fetching admins:", error);
    return { admins: [], systemAdmins: [] };
  }
}

export default async function AdminUsersPage() {
  const { admins, systemAdmins } = await getAdmins();
  return <UsersClientPage initialAdmins={admins} initialSystemAdmins={systemAdmins} />;
}
