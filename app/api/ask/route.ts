// app/api/ask/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  message: z.string().trim().min(2).max(500),
});

// Very small keyword matcher — no external LLM. Deterministic, grounded, fast.
function detectIntent(message: string) {
  const text = message.toLowerCase();
  const cityMap: Record<string, string> = {
    pune: 'pune', mumbai: 'mumbai', bengaluru: 'bengaluru',
    bangalore: 'bengaluru', nashik: 'nashik', nagpur: 'nagpur',
  };
  const propertyMap: Record<string, string> = {
    '1bhk': 'BHK_1', '1 bhk': 'BHK_1',
    '2bhk': 'BHK_2', '2 bhk': 'BHK_2',
    '3bhk': 'BHK_3', '3 bhk': 'BHK_3',
    villa: 'VILLA',
  };
  const scopeMap: Record<string, string> = {
    kitchen: 'kitchen',
    'living room': 'living-room',
    'full home': 'full-home',
    'full house': 'full-home',
  };
  const tierMap: Record<string, string> = {
    essential: 'essential',
    budget: 'essential',
    premium: 'premium',
    luxury: 'luxury',
  };

  const citySlug = Object.keys(cityMap).find((k) => text.includes(k));
  const propertyType = Object.entries(propertyMap).find(([k]) => text.includes(k))?.[1];
  const scope = Object.entries(scopeMap).find(([k]) => text.includes(k))?.[1];
  const styleTier = Object.entries(tierMap).find(([k]) => text.includes(k))?.[1];

  return {
    citySlug: citySlug ? cityMap[citySlug] : undefined,
    propertyType,
    scope,
    styleTier,
  };
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Please type a short question.' }, { status: 400 });
  }

  const intent = detectIntent(parsed.data.message);

  // 1. If we have a full estimate intent, answer with real numbers.
  if (intent.citySlug && intent.propertyType && intent.scope && intent.styleTier) {
    const city = await prisma.city.findUnique({ where: { slug: intent.citySlug } });
    if (!city) {
      return NextResponse.json({
        kind: 'no-data',
        reply: 'I do not have estimates for that city yet.',
        suggestions: [
          'Try Pune, Mumbai, Bengaluru, Nashik or Nagpur.',
          'Or open the budget estimator to pick your exact combination.',
        ],
      });
    }
    const estimate = await prisma.estimate.findUnique({
      where: {
        cityId_propertyType_scope_styleTier: {
          cityId: city.id,
          propertyType: intent.propertyType as never,
          scope: intent.scope,
          styleTier: intent.styleTier,
        },
      },
    });
    if (!estimate) {
      return NextResponse.json({
        kind: 'no-data',
        reply: `I do not have a stored estimate for that exact combination in ${city.name}.`,
        suggestions: ['Open the budget estimator to see the closest match.'],
        estimateUrl: '/estimate',
      });
    }
    const totalMin =
      estimate.furnitureMin + estimate.materialsMin + estimate.labourMin + estimate.installationMin;
    const totalMax =
      estimate.furnitureMax + estimate.materialsMax + estimate.labourMax + estimate.installationMax;
    const inr = (n: number) => '₹' + n.toLocaleString('en-IN');
    return NextResponse.json({
      kind: 'estimate',
      reply:
        `Based on Nestora's catalogue, a ${intent.propertyType.replace('BHK_', 'BHK ')} ` +
        `${intent.scope.replace('-', ' ')} in ${city.name} at ${intent.styleTier} finish ` +
        `typically ranges from ${inr(totalMin)} to ${inr(totalMax)}. ` +
        `This is an estimate, not a quotation.`,
      breakdown: {
        furniture: [estimate.furnitureMin, estimate.furnitureMax],
        materials: [estimate.materialsMin, estimate.materialsMax],
        labour: [estimate.labourMin, estimate.labourMax],
        installation: [estimate.installationMin, estimate.installationMax],
        total: [totalMin, totalMax],
      },
      estimateUrl: '/estimate',
      designsUrl: `/designs?city=${encodeURIComponent(city.name)}`,
    });
  }

  // 2. Otherwise, recommend approved designs by keyword.
  const designs = await prisma.design.findMany({
    where: { status: 'APPROVED' },
    include: { designer: { select: { studioName: true, city: true } } },
    take: 30,
  });
  const text = parsed.data.message.toLowerCase();
  const matched = designs
    .map((d) => {
      const hay = `${d.title} ${d.category} ${d.style} ${d.description}`.toLowerCase();
      const score =
        (text.includes(d.category.toLowerCase()) ? 3 : 0) +
        (text.includes(d.style.toLowerCase()) ? 2 : 0) +
        (text.includes(d.propertyType.replace('BHK_', 'bhk').toLowerCase()) ? 2 : 0) +
        hay.split(/\s+/).filter((w) => w.length > 3 && text.includes(w)).length;
      return { d, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ d }) => ({
      slug: d.slug,
      title: d.title,
      category: d.category,
      style: d.style,
      basePrice: d.basePrice,
      imageUrl: d.imageUrl,
      designer: d.designer.studioName,
      city: d.designer.city,
    }));

  return NextResponse.json({
    kind: matched.length ? 'designs' : 'no-data',
    reply: matched.length
      ? `Here are a few designs from our catalogue that match your idea.`
      : `I couldn't find a matching design in the catalogue. Try a broader question or browse the gallery.`,
    designs: matched,
    designsUrl: '/designs',
    estimateUrl: '/estimate',
  });
}
