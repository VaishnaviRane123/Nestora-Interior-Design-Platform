// app/book/book-form.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

type FormState = {
  name: string;
  phone: string;
  propertyType: 'BHK_1' | 'BHK_2' | 'BHK_3' | 'VILLA';
  city: string;
  preferredDate: string;
  budgetBand: string;
  notes: string;
};

export default function BookForm({
  designSlug,
  designTitle,
  designerName,
  designCity,
  basePrice,
}: {
  designSlug: string;
  designTitle: string;
  designerName: string;
  designCity: string;
  basePrice: number;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    propertyType: 'BHK_2',
    city: designCity,
    preferredDate: '',
    budgetBand: '₹10-15 lakh',
    notes: '',
  });
  const [done, setDone] = useState<{ reference: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (status !== 'authenticated') {
      router.push(`/login?callbackUrl=/book?design=${designSlug}`);
      return;
    }

    setLoading(true);
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ designSlug, ...form }),
    });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Could not submit booking.');
      return;
    }

    const data = await res.json();
    setDone({ reference: data.reference });
  }

  if (done) {
    return (
      <main className="page">
        <div className="container center">
          <div className="eyebrow">Booking received</div>
          <h1 style={{ fontSize: 48 }}>Your request is in.</h1>
          <p className="lead" style={{ margin: 'auto' }}>
            Reference <b>{done.reference}</b> for <b>{designTitle}</b>. The
            designer can confirm the site visit after reviewing your request.
          </p>
          <div style={{ marginTop: 25, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link className="btn btn-dark" href="/dashboard">Open dashboard</Link>
            <Link className="btn btn-light" href="/designs">Keep exploring</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="container">
        <div className="eyebrow">Book a design</div>
        <h1 style={{ fontSize: 46 }}>Tell us about your project</h1>

        <div className="detail-grid">
          <div className="panel">
            <h2 style={{ fontSize: 28 }}>{designTitle}</h2>
            <p className="muted">{designerName} · {designCity}</p>
            <hr style={{ border: 0, borderTop: '1px solid #eee' }} />
            <p>
              Starting estimate <b>₹{basePrice.toLocaleString('en-IN')}</b>
            </p>
            <p className="muted">
              The designer will confirm the final quotation after site
              measurement and scope discussion.
            </p>
          </div>

          <form className="panel" onSubmit={onSubmit}>
            <div className="form-grid">
              <div>
                <label>Full name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
              <div>
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label>Property type</label>
                <select
                  value={form.propertyType}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      propertyType: e.target.value as FormState['propertyType'],
                    })
                  }
                >
                  <option value="BHK_1">1BHK</option>
                  <option value="BHK_2">2BHK</option>
                  <option value="BHK_3">3BHK</option>
                  <option value="VILLA">Villa</option>
                </select>
              </div>
              <div>
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                />
              </div>
              <div>
                <label>Preferred date</label>
                <input
                  type="date"
                  value={form.preferredDate}
                  onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                />
              </div>
              <div>
                <label>Approx. budget</label>
                <select
                  value={form.budgetBand}
                  onChange={(e) => setForm({ ...form, budgetBand: e.target.value })}
                >
                  <option>₹5-10 lakh</option>
                  <option>₹10-15 lakh</option>
                  <option>₹15-25 lakh</option>
                  <option>₹25 lakh+</option>
                </select>
              </div>
              <div className="form-full">
                <label>Project notes</label>
                <textarea
                  rows={5}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Tell the designer about your home, requirements and preferences."
                />
              </div>
            </div>

            {error && (
              <p style={{ color: '#b00', marginTop: 12, fontSize: 14 }}>{error}</p>
            )}

            <button
              type="submit"
              className="btn btn-accent"
              disabled={loading}
              style={{ marginTop: 18, width: '100%' }}
            >
              {loading ? 'Submitting…' : 'Request site visit'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
