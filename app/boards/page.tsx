import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import BoardsClient from './boards-client';
import BoardActions from './board-actions';

export const dynamic = 'force-dynamic';

export default async function BoardsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/boards');
  const boards = await prisma.board.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { design: true }, take: 4 } },
    orderBy: { updatedAt: 'desc' },
  });
  return <main className="page"><div className="container"><div className="eyebrow">Your inspiration library</div><h1>Design boards</h1><p className="muted">Collect rooms, finishes and ideas in one place, then share your shortlist with family or your designer.</p><BoardsClient /><div className="grid-3" style={{ marginTop: 28 }}>{boards.map((board) => <article className="panel" key={board.id}><h2 style={{ fontSize: 25 }}>{board.name}</h2><p className="muted">{board.items.length} saved ideas</p><Link className="btn btn-light" href={`/boards/${board.shareSlug}`}>Open board ↗</Link><BoardActions boardId={board.id} isPublic={board.isPublic} />{board.isPublic && <p className="muted">Share link: {`/boards/${board.shareSlug}`}</p>}</article>)}</div>{boards.length === 0 && <div className="panel" style={{ marginTop: 24 }}><h2 style={{ fontSize: 26 }}>Start a mood board</h2><p>Save a few designs from the gallery, then create a board to organise your ideas.</p><Link href="/designs" className="btn btn-dark">Explore designs</Link></div>}</div></main>;
}
