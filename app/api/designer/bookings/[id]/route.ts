import { NextResponse } from 'next/server';
import { z } from 'zod';
import { BookingStatus } from '@prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('accept') }),
  z.object({ action: z.literal('reject'), note: z.string().trim().max(500).optional() }),
  z.object({ action: z.literal('quote'), quotedPrice: z.number().int().positive().max(100000000) }),
  z.object({ action: z.literal('status'), status: z.nativeEnum(BookingStatus), note: z.string().trim().max(500).optional() }),
]);
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in required.' }, { status: 401 });
  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: 'Invalid booking action.' }, { status: 400 });
  const profile = await prisma.designer.findUnique({ where: { userId: session.user.id }, select: { id: true } });
  if (!profile) return NextResponse.json({ error: 'Designer profile required.' }, { status: 403 });
  const booking = await prisma.booking.findFirst({ where: { id: id, designerId: profile.id }, select: { id: true, status: true } });
  if (!booking) return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  let nextStatus: BookingStatus = booking.status; let note: string | undefined;
  if (input.data.action === 'accept') { if (booking.status !== 'REQUESTED') return NextResponse.json({ error: 'Only requested bookings can be accepted.' }, { status: 409 }); nextStatus = 'DESIGNER_ACCEPTED'; }
  if (input.data.action === 'reject') { if (['COMPLETED', 'CANCELLED'].includes(booking.status)) return NextResponse.json({ error: 'This booking is already closed.' }, { status: 409 }); nextStatus = 'CANCELLED'; note = input.data.note || 'Declined by designer'; }
  if (input.data.action === 'quote') { if (!['DESIGNER_ACCEPTED', 'SITE_VISIT_DONE', 'QUOTED'].includes(booking.status)) return NextResponse.json({ error: 'Accept the booking and complete a site visit before quoting.' }, { status: 409 }); nextStatus = 'QUOTATION_SENT'; }
  if (input.data.action === 'status') { nextStatus = input.data.status; note = input.data.note; }
  try {
    await prisma.$transaction(async tx => {
      await tx.booking.update({ where: { id: booking.id }, data: { status: nextStatus, ...(input.data.action === 'quote' ? { quotedPrice: input.data.quotedPrice } : {}), ...(nextStatus === 'COMPLETED' ? { completedAt: new Date() } : {}) } });
      if (nextStatus !== booking.status) await tx.bookingEvent.create({ data: { bookingId: booking.id, fromStatus: booking.status, toStatus: nextStatus, note: note || (input.data.action === 'quote' ? `Quotation sent: ₹${input.data.quotedPrice.toLocaleString('en-IN')}` : `Updated by designer ${session.user.id}`) } });
    });
    return NextResponse.json({ ok: true, status: nextStatus });
  } catch (error) { console.error('Designer booking action failed', error); return NextResponse.json({ error: 'Could not update booking.' }, { status: 500 }); }
}
