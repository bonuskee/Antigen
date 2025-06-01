// app/api/upload/route.ts
import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs";

import { writeFile } from "fs/promises";
import { join } from "path";

const getGoogleConfig = () => {
  return {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN || "",
    uploadFolder: process.env.GOOGLE_DRIVE_FOLDER || "",
  };
};

export async function POST(request: NextRequest) {
  try {
    console.log("Post method being called");

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const namePrefix = (formData.get("namePrefix") as string) || "upload";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log("file", file.name);
    console.log("namePrefix", namePrefix);

    const config = getGoogleConfig();
    const auth = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
    auth.setCredentials({ refresh_token: config.refreshToken });

    const drive = google.drive({ version: "v3", auth });

    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Create filename and path
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `${namePrefix}_${timestamp}.jpg`;
    const tempFilePath = join(tempDir, fileName);

    // Convert File to Buffer and save to temp file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(tempFilePath, buffer);

    // Upload to Google Drive
    const uploadResponse = await drive.files.create({
      requestBody: {
        name: fileName,
        parents: [config.uploadFolder],
      },
      media: {
        mimeType: file.type || "image/jpeg",
        body: fs.createReadStream(tempFilePath),
      },
      fields: "id",
    });

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    return NextResponse.json({
      url: `https://drive.google.com/uc?id=${uploadResponse.data.id}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
