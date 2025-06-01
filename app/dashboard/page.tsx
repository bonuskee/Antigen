// app/dashboard/page.tsx
import { fetchUserData } from "@/components/dashboard-server";
import DashboardClient from "@/components/dashboard-client";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const { submissionHistory, stats, email } = await fetchUserData();

  return (
    <DashboardClient
      initialSubmissionHistory={submissionHistory}
      initialStats={stats}
      userEmail={email}
    />
  );
}
