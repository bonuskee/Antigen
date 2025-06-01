// app/api/atk-results/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { google } from 'googleapis';
import { prisma } from '@/lib/prisma';

function getGoogleConfig() {
  return {
    clientId:     process.env.GOOGLE_CLIENT_ID     || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri:  process.env.GOOGLE_REDIRECT_URI  || '',
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || '',
    uploadFolder: process.env.GOOGLE_DRIVE_FOLDER  || '',
  };
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const file   = form.get('file')   as File;
    const email  = form.get('email')  as string;
    const result = form.get('result') as string; // “Positive” | “Negative”

    if (!file || !email || !result) {
      return NextResponse.json(
        { error: 'Missing file, email or result' },
        { status: 400 }
      );
    }

    // Find user in the database
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check for duplicate submissions within the last 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.aTKResult.findFirst({
      where: { userId: user.id, createdAt: { gt: cutoff } }
    });
    if (recent) {
      return NextResponse.json(
        { error: 'You’ve already reported within the last 24 hours.' },
        { status: 429 }
      );
    }

    // 3) Upload image to Google Drive
    const cfg = getGoogleConfig();
    const auth = new google.auth.OAuth2(
      cfg.clientId, cfg.clientSecret, cfg.redirectUri
    );
    auth.setCredentials({ refresh_token: cfg.refreshToken });
    const drive = google.drive({ version: 'v3', auth });

    const tempDir = join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName  = `atk_${user.id}_${timestamp}_${file.name}`;
    const tempPath  = join(tempDir, fileName);
    const bytes     = Buffer.from(await file.arrayBuffer());
    await writeFile(tempPath, bytes);

    const upload = await drive.files.create({
      requestBody: { name: fileName, parents: [cfg.uploadFolder] },
      media:       { mimeType: file.type || 'image/jpeg', body: fs.createReadStream(tempPath) },
      fields:      'id',
    });
    fs.unlinkSync(tempPath);

    const imageUrl = `https://drive.google.com/uc?id=${upload.data.id}`;

    // 4) Persist ATKResult
    const atk = await prisma.aTKResult.create({
      data: {
        result,
        imageUrl,
        userId: user.id,
      },
    });

    return NextResponse.json(atk, { status: 201 });
  }
  catch (e) {
    console.error('⚠️ ATK route error:', e);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
