// app/designers/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import DesignerAvatar from '@/components/DesignerAvatar';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Meet interior designers | Nestora',
  description:
    'Browse verified interior designers in Pune, Mumbai and Bengaluru. View portfolios and request a consultation.',
};

function safeName(studioName: string | null | undefined, userName: string | null | undefined): string {
  const s = (studioName ?? '').trim();
  if (s.length > 0) return s;
  const u = (userName ?? '').trim();
  if (u.length > 0) return u;
  return 'Nestora Designer';
}

export default async function DesignersPage() {
  const designers = await prisma.designer.findMany({
    where: { verified: true },
    include: {
      user: { select: { name: true } },
      designs: {
        where: { status: 'APPROVED' },
        select: { id: true },
      },
    },
    orderBy: [{ ratingAvg: 'desc' }, { createdAt: 'desc' }],
  });

  return (
    <main className="page">
      <div className="container">
        <div className="eyebrow">Professionals</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 48 }}>
          Meet interior designers
        </h1>
        <p className="lead">
          Browse verified professional profiles and their approved design
          portfolios.
        </p>

        {designers.length === 0 ? (
          <div className="panel empty-state" style={{ marginTop: 32 }}>
            <h2>No designers published yet</h2>
            <p className="muted">
              Run <code>npm run db:seed</code> to add demo designers.
            </p>
          </div>
        ) : (
          <div className="grid-3" style={{ marginTop: 35 }}>
            {designers.map((d) => {
              const name = safeName(d.studioName, d.user.name);
              return (
                <article className="card designer-card" key={d.id}>
                  <div className="designer-cover">
                    {d.coverUrl && d.coverUrl.trim().length > 0 ? (
                      <Image
                        src={d.coverUrl}
                        alt={`${name} studio cover`}
                        fill
                        sizes="(max-width: 800px) 100vw, 33vw"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="designer-cover-fallback" aria-hidden="true" />
                    )}
                    <DesignerAvatar
                      name={name}
                      src={d.avatarUrl}
                      size={88}
                      className="designer-avatar"
                    />
                  </div>

                  <div className="card-body">
                    <h2
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 24,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        margin: '0 0 8px',
                      }}
                    >
                      {name}
                      {d.verified && (
                        <span
                          title="Verified by Nestora — GST, address, and past work checked"
                          aria-label="Verified"
                          style={{
                            display: 'inline-flex',
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            background: 'var(--olive)',
                            color: '#fff',
                            fontSize: 11,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          ✓
                        </span>
                      )}
                    </h2>
                    <p className="muted" style={{ margin: '0 0 6px' }}>
                      {d.city}
                      {d.specialty ? ` · ${d.specialty}` : ''}
                    </p>
                    <p className="muted" style={{ fontSize: 13, margin: '0 0 14px' }}>
                      {d.designs.length} approved{' '}
                      {d.designs.length === 1 ? 'project' : 'projects'}
                      {typeof d.ratingAvg === 'number' && d.ratingCount
                        ? ` · ★ ${d.ratingAvg.toFixed(1)} (${d.ratingCount})`
                        : ''}
                    </p>
                    <Link
                      href={`/designers/${d.id}`}
                      className="btn btn-dark"
                    >
                      View profile
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
