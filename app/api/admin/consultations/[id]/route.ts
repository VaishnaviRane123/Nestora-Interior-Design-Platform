// app/api/admin/consultations/[id]/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { BookingStatus } from '@prisma/client';

const schema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('assign'),
    designerId: z.string().min(1),
    designId: z.string().min(1).optional(),
    note: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal('decline'),
    note: z.string().trim().max(500).optional(),
  }),
  z.object({
    action: z.literal('spam'),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }
  const actor = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (actor?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Admin access required.' }, { status: 403 });
  }

  const input = schema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 });
  }

  const consultation = await prisma.consultationRequest.findUnique({
    where: { id: id },
  });
  if (!consultation) {
    return NextResponse.json({ error: 'Consultation not found.' }, { status: 404 });
  }
  if (consultation.status !== 'NEW') {
    return NextResponse.json(
      { error: 'This consultation has already been reviewed.' },
      { status: 409 },
    );
  }

  try {
    if (input.data.action === 'spam') {
      const updated = await prisma.consultationRequest.update({
        where: { id: consultation.id },
        data: {
          status: 'SPAM',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
        },
      });
      return NextResponse.json({ ok: true, status: updated.status });
    }

    if (input.data.action === 'decline') {
      const updated = await prisma.consultationRequest.update({
        where: { id: consultation.id },
        data: {
          status: 'DECLINED',
          reviewedBy: session.user.id,
          reviewedAt: new Date(),
          reviewNote: input.data.note ?? null,
        },
      });
      return NextResponse.json({ ok: true, status: updated.status });
    }

    // action === 'assign'
    const designer = await prisma.designer.findUnique({
      where: { id: input.data.designerId },
      select: { id: true },
    });
    if (!designer) {
      return NextResponse.json({ error: 'Designer not found.' }, { status: 404 });
    }

    // Need a design to attach the booking to. Prefer the one passed in,
    // otherwise use the first approved design by this designer.
    let designId = input.data.designId ?? null;
    if (designId) {
      const d = await prisma.design.findFirst({
        where: { id: designId, designerId: designer.id, status: 'APPROVED' },
        select: { id: true },
      });
      if (!d) designId = null;
    }
    if (!designId) {
      const fallback = await prisma.design.findFirst({
        where: { designerId: designer.id, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      });
      if (!fallback) {
        return NextResponse.json(
          {
            error:
              'This designer has no approved designs yet. Assign after they publish a design.',
          },
          { status: 409 },
        );
      }
      designId = fallback.id;
    }

    // Find or create a Customer for this lead.
    // We try to match by phone first, then by email, then create a minimal row
    // tied to a placeholder user is not viable — instead we require a signed-in
    // customer, OR we create an anonymous Customer via a synthetic User.
    //
    // Simpler MVP rule: create the Booking under an existing Customer if we can
    // find one by phone/email; otherwise create a fresh Customer + User shell.
    let customerId: string | null = null;

    if (consultation.email) {
      const existing = await prisma.customer.findFirst({
        where: { user: { email: consultation.email } },
        select: { id: true },
      });
      if (existing) customerId = existing.id;
    }

    if (!customerId) {
      // Create a lightweight User + Customer shell for the lead. The user
      // cannot sign in because passwordHash is null.
      const email =
        consultation.email ??
        `lead+${consultation.reference.slice(0, 8)}@consult.nestora.demo`;

      const user = await prisma.user.create({
        data: {
          email,
          name: consultation.name,
          phone: consultation.phone,
          role: 'CUSTOMER',
          passwordHash: null,
          customer: {
            create: { city: consultation.city },
          },
        },
        include: { customer: true },
      });
      customerId = user.customer!.id;
    }

    const booking = await prisma.booking.create({
      data: {
        customerId,
        designerId: designer.id,
        designId,
        status: BookingStatus.REQUESTED,
        propertyType: consultation.propertyType ?? null,
        city: consultation.city,
        budgetBand: consultation.budgetBand ?? null,
        notes: consultation.notes ?? null,
      },
      select: { id: true, reference: true },
    });

    const updated = await prisma.consultationRequest.update({
      where: { id: consultation.id },
      data: {
        status: 'ASSIGNED',
        designerId: designer.id,
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        reviewNote: input.data.note ?? null,
        assignedTo: booking.id,
      },
    });

    return NextResponse.json({
      ok: true,
      status: updated.status,
      bookingId: booking.id,
      bookingReference: booking.reference,
    });
  } catch (error) {
    console.error('Admin consultation action failed', error);
    return NextResponse.json(
      { error: 'Could not update the consultation.' },
      { status: 500 },
    );
  }
}
