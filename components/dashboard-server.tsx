// components/dashboard-server.ts
import { currentUser } from "@clerk/nextjs/server";
import { redirect }     from "next/navigation";
import { prisma }       from "@/lib/prisma";

export type SubmissionRow = {
  id:       string;
  date:     string;  // ISO string
  result:   string;
  imageUrl: string;
};

export type SubmissionHistory = SubmissionRow[];

export type Stats = {
  totalTests:     number;
  positiveRate:   number;
  lastSubmission: string | null;
  streak:         number;
};

export async function fetchUserData(): Promise<{
  submissionHistory: SubmissionHistory;
  stats: Stats;
  email: string;
}> {
  // 1) Server‐side auth
  const user = await currentUser();
  if (!user?.id) {
    redirect("/sign-in");
  }
  const userId = user.id;
  const email  = user.primaryEmailAddress?.emailAddress || "";

  // 2) Query directly via Prisma
  const results = await prisma.aTKResult.findMany({
    where:   { userId },
    orderBy: { createdAt: "desc" },
  });

  // 3) Serialize the rows
  const submissionHistory: SubmissionHistory = results.map((r) => ({
    id:       r.id,
    date:     r.createdAt.toISOString(), // now a string
    result:   r.result,
    imageUrl: r.imageUrl,
  }));

  // 4) Compute stats
  const totalTests    = submissionHistory.length;
  const positiveCount = submissionHistory.filter((r) => r.result === "Positive").length;
  const positiveRate  = totalTests ? (positiveCount / totalTests) * 100 : 0;
  const lastSubmission = submissionHistory[0]?.date || null;

  // 5) Compute streak of consecutive calendar days
  const days: string[] = Array.from(
    new Set(
      submissionHistory.map((r) => r.date.split("T")[0])
    )
  );
  let streak = 0;
  if (days.length > 0) {
    streak = 1;
    let prevDay = new Date(days[0]);
    for (let i = 1; i < days.length; i++) {
      const currDay = new Date(days[i]);
      const diffDays = (prevDay.getTime() - currDay.getTime()) / 86400000;
      if (diffDays === 1) {
        streak++;
        prevDay = currDay;
      } else {
        break;
      }
    }
  }

  return {
    submissionHistory,
    stats: { totalTests, positiveRate, lastSubmission, streak },
    email,
  };
}
