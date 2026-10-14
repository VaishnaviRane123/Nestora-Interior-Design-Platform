// app/designers/[id]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import DesignImage from '@/components/DesignImage';
import DesignerAvatar from '@/components/DesignerAvatar';
import RequestConsultationButton from './request-consultation-button';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ id: string }>;
};

function safeName(
  studioName: string | null | undefined,
  userName: string | null | undefined,
): string {
  const s = (studioName ?? '').trim();
  if (s.length > 0) return s;
  const u = (userName ?? '').trim();
  if (u.length > 0) return u;
  return 'Nestora Designer';
}

function hasImage(url: string | null | undefined): url is string {
  return typeof url === 'string' && url.trim().length > 0;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const designer = await prisma.designer.findUnique({
    where: { id },
    include: { user: { select: { name: true } } },
  });
  if (!designer) return { title: 'Designer not found | Nestora' };

  const name = safeName(designer.studioName, designer.user.name);
  const specialty = designer.specialty ?? 'Interior Designer';
  const city = designer.city ?? 'India';
  return {
    title: `${name} — ${specialty} in ${city} | Nestora`,
    description: `View ${name}'s portfolio on Nestora. Verified interior designer based in ${city}.`,
  };
}

export default async function DesignerProfilePage({ params }: PageProps) {
  const { id } = await params;

  const designer = await prisma.designer.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true } },
      designs: {
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          slug: true,
          title: true,
          category: true,
          style: true,
          basePrice: true,
          imageUrl: true,
          areaSqftMin: true,
          areaSqftMax: true,
        },
      },
      reviews: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { user: { select: { name: true } } },
      },
    },
  });

  if (!designer) notFound();

  const name = safeName(designer.studioName, designer.user.name);
  const designs = designer.designs;
  const reviewCount = designer.ratingCount ?? designer.reviews.length;
  const ratingAvg =
    typeof designer.ratingAvg === 'number' ? designer.ratingAvg : null;
  const totalProjects = designs.length;
  const categories = Array.from(new Set(designs.map((d) => d.category)));
  const styles = Array.from(new Set(designs.map((d) => d.style)));
  const minPrice = designs.length
    ? Math.min(...designs.map((d) => d.basePrice))
    : null;

  return (
    <main className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/designers">Designers</Link> / {name}
        </div>

        <section className="designer-header">
          <div className="designer-header-cover">
            {hasImage(designer.coverUrl) ? (
              <Image
                src={designer.coverUrl}
                alt={`${name} studio cover`}
                fill
                sizes="(max-width: 1180px) 100vw, 1180px"
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div className="designer-cover-fallback" aria-hidden="true" />
            )}
          </div>

          <div className="designer-header-body">
            <DesignerAvatar
              name={name}
              src={designer.avatarUrl}
              size={140}
              className="designer-avatar-large"
            />

            <div className="designer-header-copy">
              <div className="eyebrow">
                {designer.specialty ?? 'Interior Designer'}
              </div>

              <h1
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 44,
                  margin: '8px 0 10px',
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                {name}
                {designer.verified && (
                  <span
                    title="Verified by Nestora — GST, address, and past work checked"
                    aria-label="Verified designer"
                    style={{
                      display: 'inline-flex',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: 'var(--olive)',
                      color: '#fff',
                      fontSize: 14,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    ✓
                  </span>
                )}
              </h1>

              <p className="muted" style={{ margin: '0 0 12px' }}>
                {designer.city}
                {designer.experienceYr
                  ? ` · ${designer.experienceYr} years experience`
                  : ''}
                {ratingAvg
                  ? ` · ★ ${ratingAvg.toFixed(1)} (${reviewCount} ${
                      reviewCount === 1 ? 'review' : 'reviews'
                    })`
                  : ''}
              </p>

              {designer.bio && (
                <p style={{ margin: '0 0 16px', maxWidth: 640 }}>{designer.bio}</p>
              )}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <RequestConsultationButton
                  designerId={designer.id}
                  designerName={name}
                  designerCity={designer.city}
                />
                <Link className="btn btn-light" href="/designs">
                  Browse designs
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="kpis" style={{ marginTop: 26 }}>
          <div className="kpi">
            Approved projects
            <strong>{totalProjects}</strong>
          </div>
          <div className="kpi">
            Starting from
            <strong>{minPrice ? `₹${Math.round(minPrice / 1000)}K+` : '—'}</strong>
          </div>
          <div className="kpi">
            Specialties
            <strong style={{ fontSize: 16, marginTop: 12 }}>
              {styles.slice(0, 3).join(' · ') || '—'}
            </strong>
          </div>
        </div>

        <section style={{ marginTop: 40 }}>
          <div className="section-head">
            <div>
              <div className="eyebrow">Portfolio</div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 32,
                  margin: '6px 0 0',
                }}
              >
                Selected work
              </h2>
              {categories.length > 0 && (
                <p className="muted" style={{ marginTop: 6, fontSize: 14 }}>
                  {categories.join(' · ')}
                </p>
              )}
            </div>
            <Link href="/designs" className="text-link">
              See all Nestora designs ↗
            </Link>
          </div>

          {designs.length === 0 ? (
            <div className="panel empty-state">
              <h2>No approved projects yet</h2>
              <p className="muted">
                {name} has not published any designs on Nestora yet.
              </p>
            </div>
          ) : (
            <div className="masonry">
              {designs.map((d) => (
                <div className="masonry-item" key={d.id}>
                  <Link href={`/designs/${d.slug}`} className="masonry-card">
                    <div className="masonry-media">
                      <DesignImage src={d.imageUrl} alt={d.title} />
                    </div>
                    <div className="masonry-body">
                      <div className="row">
                        <span className="masonry-title">{d.title}</span>
                        <span className="masonry-price">
                          ₹{Math.round(d.basePrice / 1000)}K+
                        </span>
                      </div>
                      <p className="masonry-meta">
                        {d.category} · {d.style}
                      </p>
                      <div className="masonry-tags">
                        <span className="tag">
                          {d.areaSqftMin}-{d.areaSqftMax} sq.ft
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={{ marginTop: 50 }}>
          <div className="section-head">
            <div>
              <div className="eyebrow">Reviews</div>
              <h2
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 32,
                  margin: '6px 0 0',
                }}
              >
                What clients say
              </h2>
            </div>
          </div>

          {designer.reviews.length === 0 ? (
            <div className="panel" style={{ padding: 24 }}>
              <p className="muted" style={{ margin: 0 }}>
                No published reviews yet. Reviews are shown here only after a
                completed project and a signed-off submission.
              </p>
            </div>
          ) : (
            <div className="grid-2">
              {designer.reviews.map((r) => (
                <article className="panel" key={r.id}>
                  <div className="row" style={{ marginBottom: 8 }}>
                    <b>{r.title ?? 'Verified project'}</b>
                    <span style={{ color: 'var(--accent)' }}>
                      {'★'.repeat(r.rating)}
                      <span className="muted">{'★'.repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  <p className="muted" style={{ fontSize: 13, margin: '0 0 8px' }}>
                    {r.user.name ?? 'A Nestora customer'}
                  </p>
                  {r.body && (
                    <p style={{ margin: 0, lineHeight: 1.6 }}>{r.body}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          className="panel"
          style={{
            marginTop: 50,
            display: 'flex',
            justifyContent: 'space-between',
            gap: 20,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div className="eyebrow">Work with {name}</div>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 28,
                margin: '8px 0 6px',
              }}
            >
              Share your room, get a site visit
            </h2>
            <p className="muted" style={{ margin: 0, maxWidth: 520 }}>
              Send us your room photos and budget band. Our team reviews every
              request and connects you with {name.split(' ')[0]} within one
              business day.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <RequestConsultationButton
              designerId={designer.id}
              designerName={name}
              designerCity={designer.city}
            />
            <Link className="btn btn-light" href="/designs">
              Browse designs
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
