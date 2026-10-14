import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createBoardSchema = z.object({ name: z.string().trim().min(2).max(80) });
const itemSchema = z.object({ boardId: z.string().min(1), designId: z.string().min(1), note: z.string().max(500).optional() });

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const boards = await prisma.board.findMany({ where: { userId: session.user.id }, include: { items: { include: { design: true } } }, orderBy: { updatedAt: 'desc' } });
  return NextResponse.json({ boards });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const body: unknown = await request.json().catch(() => null);
  const boardInput = createBoardSchema.safeParse(body);
  if (boardInput.success) {
    const board = await prisma.board.create({ data: { userId: session.user.id, name: boardInput.data.name } });
    return NextResponse.json({ board }, { status: 201 });
  }
  const itemInput = itemSchema.safeParse(body);
  if (!itemInput.success) return NextResponse.json({ error: 'Provide a board name or a valid board/design pair.' }, { status: 400 });
  const board = await prisma.board.findFirst({ where: { id: itemInput.data.boardId, userId: session.user.id } });
  const design = await prisma.design.findUnique({ where: { id: itemInput.data.designId }, select: { id: true } });
  if (!board || !design) return NextResponse.json({ error: 'Board or design not found.' }, { status: 404 });
  const item = await prisma.boardItem.upsert({ where: { boardId_designId: { boardId: board.id, designId: design.id } }, create: { boardId: board.id, designId: design.id, note: itemInput.data.note }, update: { note: itemInput.data.note } });
  return NextResponse.json({ item }, { status: 201 });
}

const deleteSchema = z.object({ boardId: z.string().min(1), designId: z.string().min(1).optional() });
export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid board request.' }, { status: 400 });
  const board = await prisma.board.findFirst({ where: { id: parsed.data.boardId, userId: session.user.id }, select: { id: true } });
  if (!board) return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
  if (parsed.data.designId) {
    await prisma.boardItem.deleteMany({ where: { boardId: board.id, designId: parsed.data.designId } });
  } else {
    await prisma.board.delete({ where: { id: board.id } });
  }
  return NextResponse.json({ ok: true });
}

const shareSchema = z.object({ boardId: z.string().min(1), isPublic: z.boolean() });
export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  const parsed = shareSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid sharing request.' }, { status: 400 });
  const result = await prisma.board.updateMany({ where: { id: parsed.data.boardId, userId: session.user.id }, data: { isPublic: parsed.data.isPublic } });
  if (!result.count) return NextResponse.json({ error: 'Board not found.' }, { status: 404 });
  return NextResponse.json({ ok: true, isPublic: parsed.data.isPublic });
}
