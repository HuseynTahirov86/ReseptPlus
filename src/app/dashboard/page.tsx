import { DashboardClientPage } from "./client-page";

export default async function DashboardPage() {
  // All data fetching and logic is now handled client-side in DashboardClientPage
  // This simplifies the server component and avoids server-side session/redirect conflicts.
  return <DashboardClientPage />;
}
