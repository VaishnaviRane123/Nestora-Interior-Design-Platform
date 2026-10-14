// app/estimate/estimate-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type City = { slug: string; name: string };

type FormState = {
  citySlug: string;
  propertyType: 'BHK_1' | 'BHK_2' | 'BHK_3' | 'VILLA';
  scope: 'full-home' | 'kitchen' | 'living-room';
  styleTier: 'essential' | 'premium' | 'luxury';
};

export default function EstimateForm({ cities }: { cities: City[] }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    citySlug: cities[0]?.slug ?? 'pune',
    propertyType: 'BHK_2',
    scope: 'full-home',
    styleTier: 'premium',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data: { slug?: string; error?: string } = await res.json().catch(() => ({}));

      if (!res.ok || !data.slug) {
        setError(data.error ?? 'Could not compute estimate. Please try again.');
        return;
      }

      router.push(`/estimate/${encodeURIComponent(data.slug)}`);
    } catch {
      setError('Could not connect to Nestora. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 760 }}>
        <div className="eyebrow">Budget estimator</div>
        <h1 style={{ fontSize: 46 }}>Know the cost before you commit</h1>
        <p className="lead">
          Pick your city, home type, scope and finish level. We&apos;ll show
          you a transparent cost band for furniture, materials, labour and
          installation — with what&apos;s included and what&apos;s not.
        </p>

        <form className="panel" onSubmit={onSubmit} style={{ marginTop: 26 }}>
          <div className="form-grid">
            <div>
              <label>City</label>
              <select
                value={form.citySlug}
                onChange={(e) => setForm({ ...form, citySlug: e.target.value })}
              >
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label>Home type</label>
              <select
                value={form.propertyType}
                onChange={(e) =>
                  setForm({ ...form, propertyType: e.target.value as FormState['propertyType'] })
                }
              >
                <option value="BHK_1">1BHK</option>
                <option value="BHK_2">2BHK</option>
                <option value="BHK_3">3BHK</option>
                <option value="VILLA">Villa</option>
              </select>
            </div>
            <div>
              <label>Scope</label>
              <select
                value={form.scope}
                onChange={(e) =>
                  setForm({ ...form, scope: e.target.value as FormState['scope'] })
                }
              >
                <option value="full-home">Full Home</option>
                <option value="kitchen">Kitchen</option>
                <option value="living-room">Living Room</option>
              </select>
            </div>
            <div>
              <label>Finish level</label>
              <select
                value={form.styleTier}
                onChange={(e) =>
                  setForm({ ...form, styleTier: e.target.value as FormState['styleTier'] })
                }
              >
                <option value="essential">Essential</option>
                <option value="premium">Premium</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          {error && (
            <p style={{ color: '#b00', marginTop: 12, fontSize: 14 }}>{error}</p>
          )}

          <button
            type="submit"
            className="btn btn-accent"
            disabled={loading}
            style={{ marginTop: 20, width: '100%' }}
          >
            {loading ? 'Computing…' : 'Show my estimate'}
          </button>

          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Estimates are based on typical project data. Final pricing depends
            on measurements, materials, scope and site conditions.
          </p>
        </form>
      </div>
    </main>
  );
}
