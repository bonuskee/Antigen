// app/api/admin/atk-results/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  calculateWeeklyStats,
  type Submission,
  type WeeklyStats,
} from "@/lib/mock-atk";

export async function GET() {
  // 1) Fetch all ATK results with user info
  const results = await prisma.aTKResult.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  // 2) Map them into your Submission shape
  const submissions: Submission[] = results.map((r) => ({
    id:     r.id,
    name:
      `${r.user.firstName ?? ""} ${r.user.lastName ?? ""}`.trim() ||
      r.user.email,
    email:  r.user.email,
    date:   r.createdAt.toISOString(),
    result: r.result,
    // everything we load from the DB is already “verified”
    verified: true,
  }));

  // 3) Compute the built-in weekly stats
  const weeklyStats: WeeklyStats = calculateWeeklyStats(submissions);

  // 4) Compute counts for today / this week / this month
  const now        = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const dayCount   = submissions.filter(s => new Date(s.date) >= startOfDay).length;
  const weekCount  = submissions.filter(s => new Date(s.date) >= startOfWeek).length;
  const monthCount = submissions.filter(s => new Date(s.date) >= startOfMonth).length;

  // 5) Return everything in one payload
  return NextResponse.json({
    submissions,
    stats: {
      dayCount,
      weekCount,
      monthCount,
      weeklyStats,
    },
  });
}
