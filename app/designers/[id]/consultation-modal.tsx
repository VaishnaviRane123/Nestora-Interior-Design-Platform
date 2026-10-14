// app/designers/[id]/consultation-modal.tsx
'use client';

import { useEffect, useState } from 'react';

type Props = {
  designerId: string;
  designerName: string;
  designerCity: string;
  onClose: () => void;
};

type FormState = {
  name: string;
  phone: string;
  email: string;
  city: string;
  roomType: string;
  budgetBand: string;
  notes: string;
};

const BUDGET_BANDS = [
  'Under ₹1.5 lakh',
  '₹1.5–3 lakh',
  '₹3–6 lakh',
  '₹6–12 lakh',
  '₹12 lakh+',
];

const ROOM_TYPES = [
  'Full home',
  'Living room',
  'Bedroom',
  'Kitchen',
  'Dining room',
  'Home office',
  'Bathroom',
  'Other',
];

export default function ConsultationModal({
  designerId,
  designerName,
  designerCity,
  onClose,
}: Props) {
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    city: designerCity,
    roomType: 'Full home',
    budgetBand: '₹3–6 lakh',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, designerId }),
      });
      const data: { reference?: string; error?: string } = await res
        .json()
        .catch(() => ({}));

      if (!res.ok) {
        setError(data.error ?? 'Could not submit your request.');
        return;
      }

      setReference(data.reference ?? 'sent');
    } catch {
      setError('Could not reach Nestora. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consult-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-panel">
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>

        {reference ? (
          <div>
            <div className="eyebrow">Request received</div>
            <h2
              id="consult-title"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 32, margin: '10px 0 14px' }}
            >
              We&apos;ll be in touch soon.
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Your reference is <b>{reference.slice(0, 8).toUpperCase()}</b>.
            </p>
            <p className="muted" style={{ margin: '0 0 20px' }}>
              A Nestora team member reviews every consultation request before
              connecting you with {designerName.split(' ')[0]}. We&apos;ll reach
              out within one business day.
            </p>
            <button className="btn btn-dark" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="eyebrow">Request a consultation</div>
            <h2
              id="consult-title"
              style={{ fontFamily: 'var(--font-serif)', fontSize: 30, margin: '10px 0 6px' }}
            >
              Work with {designerName}
            </h2>
            <p className="muted" style={{ margin: '0 0 20px', fontSize: 13 }}>
              Our team reviews every request so we can match you with the right
              designer. We&apos;ll be in touch within one business day.
            </p>

            <div className="form-grid">
              <div>
                <label htmlFor="c-name">Your name *</label>
                <input
                  id="c-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                  maxLength={80}
                />
              </div>
              <div>
                <label htmlFor="c-phone">Phone *</label>
                <input
                  id="c-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  required
                  minLength={6}
                  maxLength={20}
                  placeholder="+91…"
                />
              </div>
              <div>
                <label htmlFor="c-email">Email (optional)</label>
                <input
                  id="c-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={120}
                />
              </div>
              <div>
                <label htmlFor="c-city">City *</label>
                <input
                  id="c-city"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  required
                  maxLength={60}
                />
              </div>
              <div>
                <label htmlFor="c-room">Room / scope</label>
                <select
                  id="c-room"
                  value={form.roomType}
                  onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                >
                  {ROOM_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="c-budget">Approx. budget</label>
                <select
                  id="c-budget"
                  value={form.budgetBand}
                  onChange={(e) => setForm({ ...form, budgetBand: e.target.value })}
                >
                  {BUDGET_BANDS.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="form-full">
                <label htmlFor="c-notes">What would you like to do?</label>
                <textarea
                  id="c-notes"
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  maxLength={2000}
                  placeholder="Tell us about your home, rooms, style preferences and timeline."
                />
              </div>
            </div>

            {error && (
              <p style={{ color: '#b00', marginTop: 12, fontSize: 14 }}>{error}</p>
            )}

            <p className="tiny-note muted" style={{ marginTop: 14 }}>
              By submitting, you agree to be contacted by Nestora about your
              project. We never share your details with third parties.
            </p>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                type="submit"
                className="btn btn-accent"
                disabled={submitting}
                style={{ flex: 1 }}
              >
                {submitting ? 'Sending…' : 'Send request to Nestora'}
              </button>
              <button
                type="button"
                className="btn btn-light"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
