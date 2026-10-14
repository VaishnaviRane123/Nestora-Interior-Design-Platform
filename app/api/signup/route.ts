// app/api/signup/route.ts
import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const signupSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production' && (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32 || process.env.AUTH_SECRET === 'replace-with-a-long-random-secret')) {
    return NextResponse.json({ error: 'Authentication is not configured securely.' }, { status: 503 });
  }
  const body = await req.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input." },
      { status: 400 }
    );
  }

  const { name, email, password, phone, city } = parsed.data;
  if (phone && phone.length > 20) return NextResponse.json({ error: "Phone number is too long." }, { status: 400 });
  const normalizedEmail = email.toLowerCase().trim();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Email already registered." },
      { status: 409 }
    );
  }

  const passwordHash = await hash(password, 10);

  await prisma.user.create({
    data: {
      email: normalizedEmail,
      name,
      phone: phone || null,
      passwordHash,
      role: "CUSTOMER",
      customer: {
        create: {
          city: city || null,
        },
      },
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
