import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).toLowerCase().trim();

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let role: Role = Role.USER;
    try {
      const totalUsers = await prisma.user.count();
      if (totalUsers === 0) {
        role = Role.ADMIN;
      }
    } catch (e) {
      console.warn("Could not check user count for default admin, falling back to USER", e);
    }

    const user = await prisma.user.create({
      data: {
        name: name ? String(name).trim() : null,
        email: trimmedEmail,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "User registered successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    const detail = error?.message || String(error);
    return NextResponse.json(
      {
        error: "Registration failed. Database error: " + (error?.code ? `[${error.code}] ` : "") + detail,
      },
      { status: 500 }
    );
  }
}
