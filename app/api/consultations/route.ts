// app/api/consultations/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z.string().trim().min(6).max(20),
  email: z.string().trim().email().max(120).optional().or(z.literal('')),
  city: z.string().trim().min(1).max(60),
  designerId: z.string().trim().min(1).optional(),
  roomType: z.string().trim().max(40).optional().or(z.literal('')),
  budgetBand: z.string().trim().max(40).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please check the form and try again.' },
      { status: 400 },
    );
  }

  const { name, phone, email, city, designerId, roomType, budgetBand, notes } =
    parsed.data;

  // Verify the designer exists if one was specified.
  let validDesignerId: string | null = null;
  if (designerId) {
    const designer = await prisma.designer.findUnique({
      where: { id: designerId },
      select: { id: true },
    });
    if (!designer) {
      return NextResponse.json(
        { error: 'That designer is no longer available. Please try another.' },
        { status: 404 },
      );
    }
    validDesignerId = designer.id;
  }

  try {
    const request = await prisma.consultationRequest.create({
      data: {
        name,
        phone,
        email: email && email.length > 0 ? email : null,
        city,
        designerId: validDesignerId,
        roomType: roomType && roomType.length > 0 ? roomType : null,
        budgetBand: budgetBand && budgetBand.length > 0 ? budgetBand : null,
        notes: notes && notes.length > 0 ? notes : null,
      },
      select: { id: true, reference: true },
    });

    return NextResponse.json(
      {
        ok: true,
        reference: request.reference,
        message:
          'Your consultation request is with the Nestora team. We will contact you within one business day.',
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Consultation request failed', error);
    return NextResponse.json(
      { error: 'Could not submit your request. Please try again.' },
      { status: 500 },
    );
  }
}
