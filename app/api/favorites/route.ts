import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const favoriteSchema = z.object({ designId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Sign in to save designs.' }, { status: 401 });
  const parsed = favoriteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid design.' }, { status: 400 });
  const design = await prisma.design.findUnique({ where: { id: parsed.data.designId }, select: { id: true } });
  if (!design) return NextResponse.json({ error: 'Design not found.' }, { status: 404 });
  try {
    const saved = await prisma.$transaction(async (tx) => {
      const existing = await tx.favorite.findUnique({
        where: { userId_designId: { userId: session.user.id, designId: design.id } },
        select: { id: true },
      });
      if (existing) {
        await tx.favorite.delete({ where: { id: existing.id } });
        return false;
      }
      await tx.favorite.create({ data: { userId: session.user.id, designId: design.id } });
      return true;
    });
    return NextResponse.json({ saved });
  } catch (error) {
    console.error('Favorite toggle failed', error);
    return NextResponse.json({ error: 'Could not update saved designs. Please try again.' }, { status: 500 });
  }
}
