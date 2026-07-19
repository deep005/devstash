import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { Prisma } from "@/generated/prisma/client";
import { registerSchema } from "@/lib/auth-schemas";
import { isEmailVerificationEnabled } from "@/lib/flags";
import { prisma } from "@/lib/prisma";
import { issueVerificationEmail } from "@/lib/verification";

const BCRYPT_ROUNDS = 12;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const verificationEnabled = isEmailVerificationEnabled();

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
        // With verification off, mark the account verified on creation so it is
        // usable immediately and stays valid if the flag is later turned on.
        ...(verificationEnabled ? {} : { emailVerified: new Date() }),
      },
      select: { id: true, name: true, email: true },
    });

    // Send the verification email (only when the feature is on). A send failure
    // does not fail registration — the user can request a fresh link at sign-in.
    if (verificationEnabled) {
      await issueVerificationEmail({ email: user.email, name: user.name });
    }

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    // Unique-constraint race: the email was registered between the check and the insert.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Registration failed. Please try again." },
      { status: 500 },
    );
  }
}
