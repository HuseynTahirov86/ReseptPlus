import { db } from "@/firebase/server-init";
import type { TeamMember } from "@/lib/types";
import { TeamClientPage } from "./client-page";

async function getTeam() {
  try {
    const snapshot = await db.collection("teamMembers").orderBy("name").get();
    const members = snapshot.docs.map(doc => doc.data() as TeamMember);
    return members;
  } catch (error) {
    console.error("Error fetching team members:", error);
    return [];
  }
}

export default async function AdminTeamPage() {
  const members = await getTeam();
  return <TeamClientPage initialMembers={members} />;
}
