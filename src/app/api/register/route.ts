import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, saveUser } from "@/lib/db";

function generateId() {
  return crypto.randomUUID();
}

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }
  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const existing = getUserByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "Email already in use" },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  saveUser({
    id: generateId(),
    email,
    name,
    passwordHash,
    createdAt: new Date().toISOString(),
    points: 0,
    correctPredictions: 0,
    totalPredictions: 0,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
