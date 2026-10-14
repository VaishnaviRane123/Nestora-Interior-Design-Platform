import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const schema = z.object({ action: z.enum(['approve', 'reject']), note: z.string().trim().max(1000).optional() });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const actor = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (actor?.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: 'Invalid listing action.' }, { status: 400 });
  const design = await prisma.design.findUnique({ where: { id: id }, select: { id: true, status: true } });
  if (!design) return NextResponse.json({ error: 'Design not found.' }, { status: 404 });
  if (!['PENDING', 'PENDING_REVIEW'].includes(design.status)) return NextResponse.json({ error: 'Only pending listings can be reviewed.' }, { status: 409 });
  const updated = await prisma.design.update({ where: { id: design.id }, data: { status: input.data.action === 'approve' ? 'APPROVED' : 'REJECTED' } });
  return NextResponse.json({ ok: true, status: updated.status, note: input.data.note ?? null });
}
