// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

// POST /api/users - Save user data after Clerk signup
export async function POST(req: NextRequest) {
  try {
    const { email, password, firstName, lastName, clerkUserId } =
      await req.json();

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        id: clerkUserId, // Use Clerk's user ID
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: user.id,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}

