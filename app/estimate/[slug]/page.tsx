// app/estimate/[slug]/page.tsx
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getEstimateBySlug,
  parseEstimateSlug,
  formatINR,
  formatLakh,
} from '@/lib/estimates';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const est = await getEstimateBySlug(slug);
  if (!est) {
    return { title: 'Estimate not found | Nestora' };
  }
  return {
    title: `${est.propertyLabel} ${est.scopeLabel} interior cost in ${est.city.name} | Nestora`,
    description: `Estimated budget for a ${est.propertyLabel} ${est.scopeLabel.toLowerCase()} in ${est.city.name}, ${est.styleTierLabel} finish: ${formatLakh(est.total.min)} – ${formatLakh(est.total.max)}.`,
  };
}

function Row({
  label,
  min,
  max,
}: {
  label: string;
  min: number;
  max: number;
}) {
  return (
    <tr>
      <td>{label}</td>
      <td style={{ textAlign: 'right' }}>{formatINR(min)}</td>
      <td style={{ textAlign: 'right' }}>{formatINR(max)}</td>
    </tr>
  );
}

export default async function EstimateResult({ params }: PageProps) {
  const { slug } = await params;
  const parsed = parseEstimateSlug(slug);

  // Only show diagnostics if the slug itself is genuinely malformed.
  if (!parsed) {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="eyebrow">Estimate</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 40 }}>
            We couldn&apos;t read that estimate link
          </h1>
          <p className="lead">
            The URL has an unexpected format. Try running the estimate again.
          </p>
          <div className="panel" style={{ marginTop: 20 }}>
            <p style={{ margin: 0, fontSize: 13 }}>
              <b>Received slug:</b> <code>{slug}</code>
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 13 }}>
              <b>Expected format:</b>{' '}
              <code>city--propertyType--scope--tier</code>
            </p>
            <p style={{ margin: '8px 0 0', fontSize: 13 }}>
              <b>Example:</b>{' '}
              <code>bengaluru--bhk_2--full-home--premium</code>
            </p>
          </div>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link className="btn btn-accent" href="/estimate">
              Start a new estimate
            </Link>
            <Link className="btn btn-light" href="/">
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const est = await getEstimateBySlug(slug);

  // Slug was valid but the DB has no matching row. If this happens and you've
  // already run `npm run db:seed`, the issue is a city slug mismatch — check
  // the seed for `bengaluru` vs `bangalore` etc.
  if (!est) {
    notFound();
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 900 }}>
        <div className="breadcrumb">
          <Link href="/estimate">Budget estimator</Link> / {est.city.name} ·{' '}
          {est.propertyLabel} · {est.scopeLabel} · {est.styleTierLabel}
        </div>

        <div className="eyebrow">Estimated budget</div>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(34px, 5vw, 46px)',
            margin: '12px 0 10px',
          }}
        >
          {est.propertyLabel} {est.scopeLabel.toLowerCase()} in {est.city.name}
        </h1>
        <p className="lead" style={{ marginBottom: 22 }}>
          {est.styleTierLabel} finish. Estimated cost band:{' '}
          <b>
            {formatLakh(est.total.min)} – {formatLakh(est.total.max)}
          </b>
          .
        </p>

        <div className="kpis" style={{ marginBottom: 22 }}>
          <div className="kpi">
            Total estimate
            <strong style={{ fontSize: 22, marginTop: 10 }}>
              {formatLakh(est.total.min)}
            </strong>
            <span className="muted" style={{ fontSize: 12 }}>
              to {formatLakh(est.total.max)}
            </span>
          </div>
          <div className="kpi">
            Scope
            <strong style={{ fontSize: 22, marginTop: 10 }}>
              {est.scopeLabel}
            </strong>
            <span className="muted" style={{ fontSize: 12 }}>
              {est.propertyLabel} · {est.styleTierLabel}
            </span>
          </div>
          <div className="kpi">
            City tier
            <strong style={{ fontSize: 22, marginTop: 10 }}>
              Tier {est.city.tier}
            </strong>
            <span className="muted" style={{ fontSize: 12 }}>
              {est.city.name}
            </span>
          </div>
        </div>

        <div className="panel">
          <h3>Cost breakdown</h3>
          <p className="muted" style={{ marginTop: -4, fontSize: 13 }}>
            Min / max for a typical project at this scope and finish level.
          </p>
          <table className="estimate-breakdown" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>Component</th>
                <th style={{ textAlign: 'right' }}>Low</th>
                <th style={{ textAlign: 'right' }}>High</th>
              </tr>
            </thead>
            <tbody>
              <Row
                label="Furniture & fittings"
                min={est.furniture.min}
                max={est.furniture.max}
              />
              <Row
                label="Materials"
                min={est.materials.min}
                max={est.materials.max}
              />
              <Row label="Labour" min={est.labour.min} max={est.labour.max} />
              <Row
                label="Installation"
                min={est.installation.min}
                max={est.installation.max}
              />
              <tr>
                <td><b>Total</b></td>
                <td style={{ textAlign: 'right' }}>
                  <b>{formatINR(est.total.min)}</b>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <b>{formatINR(est.total.max)}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid-2" style={{ marginTop: 22 }}>
          <div className="panel">
            <h3>What&apos;s included</h3>
            {est.inclusions.length === 0 ? (
              <p className="muted">No inclusions listed for this scope yet.</p>
            ) : (
              <ul style={{ paddingLeft: 18, margin: '8px 0 0' }}>
                {est.inclusions.map((x) => (
                  <li key={x} style={{ marginBottom: 6 }}>{x}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="panel">
            <h3>What&apos;s not included</h3>
            {est.exclusions.length === 0 ? (
              <p className="muted">No exclusions listed for this scope yet.</p>
            ) : (
              <ul style={{ paddingLeft: 18, margin: '8px 0 0' }}>
                {est.exclusions.map((x) => (
                  <li key={x} style={{ marginBottom: 6 }}>{x}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="notice" style={{ marginTop: 22 }}>
          This is an estimate based on typical projects. Final pricing depends
          on site measurements, material selections, scope and city
          conditions.
        </div>

        <div style={{ marginTop: 22, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link className="btn btn-accent" href="/designers">
            Browse {est.city.name} designers
          </Link>
          <Link
            className="btn btn-dark"
            href={`/designs?search=${encodeURIComponent(est.scopeLabel)}`}
          >
            See {est.scopeLabel.toLowerCase()} designs ↗
          </Link>
          <Link className="btn btn-light" href="/estimate">
            Try another estimate
          </Link>
        </div>
      </div>
    </main>
  );
}
