// app/estimate/page.tsx
import Link from 'next/link';
import { listCities } from '@/lib/estimates';
import EstimateForm from './estimate-form';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Budget estimator | Nestora',
  description:
    'Get a transparent cost estimate for your interior project in your city — furniture, materials, labour and installation.',
};

export default async function EstimatePage() {
  const cities = await listCities();

  if (cities.length === 0) {
    return (
      <main className="page">
        <div className="container" style={{ maxWidth: 620 }}>
          <div className="eyebrow">Budget estimator</div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 46 }}>
            Estimator not loaded yet
          </h1>
          <p className="lead">
            We need city-level cost data before we can show an estimate. Run the
            command below, then refresh this page.
          </p>
          <pre
            style={{
              background: '#f7f6f2',
              padding: 16,
              borderRadius: 12,
              overflowX: 'auto',
              fontSize: 13,
            }}
          >
            npm run db:seed
          </pre>
          <Link className="btn btn-dark" href="/" style={{ marginTop: 16 }}>
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <EstimateForm
      cities={cities.map((c) => ({ slug: c.slug, name: c.name }))}
    />
  );
}
