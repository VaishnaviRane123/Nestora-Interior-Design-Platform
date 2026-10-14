import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const actionSchema = z.object({ action: z.enum(['approve', 'reject']), reviewNote: z.string().trim().max(1000).optional() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (admin?.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const parsed = actionSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  try {
    const application = await prisma.designerApplication.findUnique({ where: { id: id } });
    if (!application) return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
    if (application.status !== 'PENDING') return NextResponse.json({ error: 'This application has already been reviewed.' }, { status: 409 });
    await prisma.$transaction(async (tx) => {
      if (parsed.data.action === 'approve') {
        await tx.designer.upsert({
          where: { userId: application.applicantId },
          update: { studioName: application.studioName, city: application.city, specialty: application.specialty, experienceYr: application.experienceYr, bio: application.bio, verified: true },
          create: { userId: application.applicantId, studioName: application.studioName, city: application.city, specialty: application.specialty, experienceYr: application.experienceYr, bio: application.bio, verified: true },
        });
        await tx.user.update({ where: { id: application.applicantId }, data: { role: 'DESIGNER' } });
      }
      await tx.designerApplication.update({ where: { id: application.id }, data: { status: parsed.data.action === 'approve' ? 'APPROVED' : 'REJECTED', reviewedAt: new Date(), reviewNote: parsed.data.reviewNote || null } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Designer application review failed', error);
    return NextResponse.json({ error: 'Could not review application.' }, { status: 500 });
  }
}
