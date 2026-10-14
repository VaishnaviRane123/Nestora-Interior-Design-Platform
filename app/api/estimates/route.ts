// app/api/estimates/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PropertyType } from '@prisma/client';
import { getEstimate } from '@/lib/estimates';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  citySlug: z.string().trim().min(1).max(80).regex(/^[a-z0-9-]+$/i),
  propertyType: z.enum(['BHK_1', 'BHK_2', 'BHK_3', 'VILLA']),
  scope: z.enum(['full-home', 'kitchen', 'living-room']),
  styleTier: z.enum(['essential', 'premium', 'luxury']),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input.' }, { status: 400 });
  }

  const { citySlug, propertyType, scope, styleTier } = parsed.data;

  try {
    const total = await prisma.estimate.count();
    if (total === 0) {
      return NextResponse.json(
        { error: 'Estimator data is not loaded. Run `npm run db:seed`.' },
        { status: 503 },
      );
    }

    const city = await prisma.city.findUnique({ where: { slug: citySlug } });
    if (!city) {
      return NextResponse.json(
        { error: 'Unknown city. Try Pune, Mumbai, Bengaluru, Nashik or Nagpur.' },
        { status: 404 },
      );
    }

    const result = await getEstimate(
      citySlug,
      propertyType as PropertyType,
      scope,
      styleTier,
    );
    if (!result) {
      return NextResponse.json(
        { error: 'No estimate available for that combination yet.' },
        { status: 404 },
      );
    }
    return NextResponse.json({ ok: true, slug: result.slug });
  } catch (error) {
    console.error('Estimate lookup failed', error);
    return NextResponse.json(
      { error: 'Could not calculate an estimate right now.' },
      { status: 500 },
    );
  }
}
