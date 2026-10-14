// app/designs/[id]/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getApprovedDesigns, getDesignBySlug } from '@/lib/designs';

export const dynamic = 'force-dynamic';

export default async function DesignDetail({
  params,
}: {
  params: { id: string };
}) {
  let design = await getDesignBySlug(params.id);

  // Backwards-compat: if someone hits /designs/1, redirect to slug
  if (!design && /^\d+$/.test(params.id)) {
    const all = await getApprovedDesigns();
    const match = all[Number(params.id) - 1];
    if (match) design = match;
  }

  if (!design) return notFound();

  return (
    <main className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/designs">Designs</Link> / {design.title}
        </div>

        <div className="detail-grid">
          <div
            className="detail-visual"
            style={{
              position: 'relative',
              overflow: 'hidden',
              background: '#eee',
            }}
          >
            <Image
              src={design.imageUrl}
              alt={design.title}
              fill
              sizes="(max-width: 800px) calc(100vw - 40px), (max-width: 1180px) calc((100vw - 48px) / 2), 560px"
              quality={90}
              style={{ objectFit: 'cover' }}
              priority
            />
          </div>

          <div>
            <div className="eyebrow">
              {design.category} · {design.style}
            </div>
            <h1 style={{ fontSize: 48 }}>{design.title}</h1>
            <p className="lead">{design.description}</p>

            <div className="stat-grid">
              <div className="stat">
                Property<b>{design.propertyLabel}</b>
              </div>
              <div className="stat">
                Area<b>{design.areaLabel}</b>
              </div>
              <div className="stat">
                Starting budget
                <b>₹{(design.basePrice / 100000).toFixed(2)}L</b>
              </div>
            </div>

            <div className="panel">
              <h3>Designer</h3>
              <p>
                <b>{design.designer}</b>
                <br />
                <span className="muted">{design.city}{design.designerVerified ? ' · Verified profile' : ' · Not verified'}</span>
              </p>
              <Link href="/designers" className="btn btn-light">View designer</Link>
            </div>

            <div style={{ height: 14 }} />

            <div className="notice">
              Final pricing depends on measurements, materials, scope and site
              conditions. The displayed amount is a starting estimate.
            </div>

            <div style={{ marginTop: 20 }}>
              <Link
                className="btn btn-accent"
                href={`/book?design=${design.slug}`}
              >
                Book this design
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
