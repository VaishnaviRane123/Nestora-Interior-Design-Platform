import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { BookingStatus, PropertyType } from '@prisma/client';

const bookingSchema = z.object({
  designSlug: z.string().trim().min(1).max(120),
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().regex(/^[+0-9() .-]{6,20}$/, 'Enter a valid phone number.'),
  propertyType: z.enum(['BHK_1', 'BHK_2', 'BHK_3', 'VILLA']),
  city: z.string().trim().min(1).max(60),
  preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable().or(z.literal('')),
  budgetBand: z.string().trim().max(40).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to request a site visit.' }, { status: 401 });
  if (session.user.role !== 'CUSTOMER') return NextResponse.json({ error: 'Only customer accounts can create bookings.' }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = bookingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input.' }, { status: 400 });

  const data = parsed.data;
  let preferredAt: Date | null = null;
  if (data.preferredDate) {
    preferredAt = new Date(`${data.preferredDate}T12:00:00.000Z`);
    if (Number.isNaN(preferredAt.getTime()) || preferredAt.toISOString().slice(0, 10) !== data.preferredDate) {
      return NextResponse.json({ error: 'Choose a valid preferred date.' }, { status: 400 });
    }
    const today = new Date(); today.setUTCHours(0, 0, 0, 0);
    if (preferredAt < today) return NextResponse.json({ error: 'Preferred date cannot be in the past.' }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, role: true } });
    if (!user || user.role !== 'CUSTOMER') return NextResponse.json({ error: 'A customer account is required.' }, { status: 403 });
    const design = await prisma.design.findUnique({ where: { slug: data.designSlug }, select: { id: true, designerId: true, status: true } });
    if (!design || design.status !== 'APPROVED') return NextResponse.json({ error: 'Design not found.' }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: user.id }, data: { name: data.name, phone: data.phone } });
      const customer = await tx.customer.upsert({
        where: { userId: user.id },
        update: { city: data.city, propertyType: data.propertyType as PropertyType },
        create: { userId: user.id, city: data.city, propertyType: data.propertyType as PropertyType },
      });
      const booking = await tx.booking.create({ data: {
        customerId: customer.id, designerId: design.designerId, designId: design.id,
        status: BookingStatus.REQUESTED, propertyType: data.propertyType as PropertyType,
        city: data.city, preferredAt, budgetBand: data.budgetBand || null, notes: data.notes || null,
      } });
      return booking;
    });
    return NextResponse.json({ ok: true, bookingId: result.id, reference: result.reference }, { status: 201 });
  } catch (error) {
    console.error('Booking creation failed', error);
    return NextResponse.json({ error: 'We could not save your booking. Please try again.' }, { status: 500 });
  }
}
