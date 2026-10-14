import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import BoardItemActions from './board-item-actions';

export const dynamic = 'force-dynamic';

export default async function SharedBoardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  const board = await prisma.board.findUnique({ where: { shareSlug: slug }, include: { items: { include: { design: true } } } });
  if (!board || (!board.isPublic && board.userId !== session?.user?.id)) notFound();
  return <main className="page"><div className="container"><div className="eyebrow">Nestora mood board</div><h1>{board.name}</h1><p className="muted">A shared collection of interior ideas.</p><p className="muted">Ideas curated with Nestora · <Link className="text-link" href="/designs">Explore the catalogue</Link></p><div className="grid-3" style={{ marginTop: 28 }}>{board.items.map(({ design }) => <article className="card" key={design.id}><Image src={design.imageUrl && design.imageUrl.trim().length > 0 ? design.imageUrl : '/images/hero-living.jpg'} alt={design.title} width={800} height={620} style={{ width: '100%', height: 'auto' }} /><div className="card-body"><h2 style={{ fontSize: 24 }}>{design.title}</h2><p className="muted">{design.category} · {design.style}</p>{board.userId === session?.user?.id && <BoardItemActions boardId={board.id} designId={design.id} />}</div></article>)}</div></div></main>;
}
