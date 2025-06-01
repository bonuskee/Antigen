// app/api/atk-results/history/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'Missing email' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const results = await prisma.aTKResult.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  // Here we explicitly type `r` as `any` to satisfy TS
  const data = results.map((r) => ({
    id:       r.id as string,
    date:     (r.createdAt as Date).toISOString(),
    result:   r.result as string,
    imageUrl: r.imageUrl as string,
  }));

  return NextResponse.json(data);
}
