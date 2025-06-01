// app/api/atk-results/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const results = await prisma.aTKResult.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  // 1) Extract ISO date strings, remove duplicates
  const dateStrings: string[] = results.map((r) =>
    (r.createdAt as Date).toISOString().split("T")[0]
  );
  const days: string[] = Array.from(new Set(dateStrings));

  // 2) Compute lastSubmission and streak
  let streak = 0;
  let lastSubmission: string | null = null;

  if (results.length > 0) {
    lastSubmission = (results[0].createdAt as Date).toISOString();

    // Walk the unique days to count consecutive days
    let prev = new Date(days[0]); // days[0] is a string
    streak = 1;
    for (let i = 1; i < days.length; i++) {
      const curr = new Date(days[i]);
      const diff = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        prev = curr;
      } else {
        break;
      }
    }
  }

  // 3) Compute overall stats
  const totalTests = results.length;
  const positiveCount = results.filter((r) => r.result === "Positive").length;
  const positiveRate = totalTests > 0 ? (positiveCount / totalTests) * 100 : 0;

  return NextResponse.json({ totalTests, positiveRate, lastSubmission, streak });
}
