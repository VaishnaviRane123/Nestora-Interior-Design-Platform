import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  studioName: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(60),
  experienceYr: z.coerce.number().int().min(0).max(60),
  specialty: z.string().trim().max(100).optional().or(z.literal('')),
  bio: z.string().trim().min(20).max(2000),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in before applying to become a designer.' }, { status: 401 });
  if (session.user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Only customer accounts can submit a designer application.' }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid application.' }, { status: 400 });
  try {
    const existingDesigner = await prisma.designer.findUnique({ where: { userId: session.user.id }, select: { id: true } });
    if (existingDesigner) return NextResponse.json({ error: 'Your account already has a designer profile.' }, { status: 409 });
    const application = await prisma.designerApplication.upsert({
      where: { applicantId: session.user.id },
      update: { ...parsed.data, specialty: parsed.data.specialty || null, status: 'PENDING', reviewedAt: null, reviewNote: null },
      create: { applicantId: session.user.id, ...parsed.data, specialty: parsed.data.specialty || null },
      select: { id: true, status: true },
    });
    return NextResponse.json({ ok: true, application }, { status: 201 });
  } catch (error) {
    console.error('Designer application failed', error);
    return NextResponse.json({ error: 'Could not save application. Please try again.' }, { status: 500 });
  }
}
