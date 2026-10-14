import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ status: z.nativeEnum(BookingStatus), note: z.string().trim().max(1000).optional() });
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const admin = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
  if (admin?.role !== 'ADMIN') return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid booking status.' }, { status: 400 });
  try {
    const existing = await prisma.booking.findUnique({ where: { id: id }, select: { id: true, status: true } });
    if (!existing) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
    const updated = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({ where: { id: existing.id }, data: { status: parsed.data.status, ...(parsed.data.status === 'COMPLETED' ? { completedAt: new Date() } : {}) } });
      if (existing.status !== parsed.data.status) await tx.bookingEvent.create({ data: { bookingId: existing.id, fromStatus: existing.status, toStatus: parsed.data.status, note: parsed.data.note || 'Updated by admin' } });
      return booking;
    });
    return NextResponse.json({ ok: true, status: updated.status });
  } catch (error) {
    console.error('Booking update failed', error);
    return NextResponse.json({ error: 'Could not update booking.' }, { status: 500 });
  }
}
