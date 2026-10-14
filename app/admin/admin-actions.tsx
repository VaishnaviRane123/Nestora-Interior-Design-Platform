// app/admin/admin-actions.tsx
'use client';

import { useState } from 'react';

type DesignerOption = { id: string; studioName: string; city: string };

type Consultation = {
  id: string;
  reference: string;
  name: string;
  phone: string;
  email: string | null;
  city: string;
  roomType: string | null;
  budgetBand: string | null;
  notes: string | null;
  designer: { studioName: string; city: string } | null;
  createdAt: string;
};

export default function AdminActions({
  applications,
  bookings,
  pendingDesigns,
  consultations,
  designers,
}: {
  applications: Array<{
    id: string;
    studioName: string;
    city: string;
    specialty: string | null;
    experienceYr: number | null;
    bio: string | null;
    applicant: { name: string | null; email: string };
  }>;
  bookings: Array<{
    id: string;
    reference: string;
    status: string;
    design: { title: string };
    customer: { user: { name: string | null; email: string } };
  }>;
  pendingDesigns: Array<{
    id: string;
    title: string;
    category: string;
    style: string;
    basePrice: number;
    designer: { studioName: string; city: string };
  }>;
  consultations: Consultation[];
  designers: DesignerOption[];
}) {
  const [busy, setBusy] = useState('');
  const [message, setMessage] = useState('');
  const [openAssign, setOpenAssign] = useState<string | null>(null);

  async function action(url: string, body: Record<string, unknown>, key: string) {
    setBusy(key);
    setMessage('');
    const res = await fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy('');
    if (!res.ok) {
      setMessage(data.error || 'Action failed.');
      return;
    }
    window.location.reload();
  }

  return (
    <div className="grid-2" style={{ marginTop: 24 }}>
      {/* ── Consultation requests ───────────────────────────── */}
      <section className="panel" style={{ gridColumn: '1 / -1' }}>
        <h2>Consultation requests</h2>
        <p className="muted" style={{ fontSize: 13, marginTop: -4 }}>
          Every request from a designer profile lands here. Assign to a
          designer to create a real booking, or decline / mark as spam.
        </p>

        {consultations.length === 0 ? (
          <p className="muted">No consultation requests waiting.</p>
        ) : (
          consultations.map((c) => (
            <article
              key={c.id}
              style={{ borderBottom: '1px solid #eee', padding: '16px 0' }}
            >
              <div className="row" style={{ alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px' }}>
                    {c.name} · {c.city}
                  </h3>
                  <p className="muted" style={{ fontSize: 13, margin: '0 0 4px' }}>
                    {c.phone}
                    {c.email ? ` · ${c.email}` : ''}
                  </p>
                  <p className="muted" style={{ fontSize: 13, margin: '0 0 4px' }}>
                    {c.roomType ?? 'Scope not specified'} ·{' '}
                    {c.budgetBand ?? 'Budget not specified'}
                  </p>
                  {c.designer && (
                    <p className="muted" style={{ fontSize: 13, margin: '0 0 4px' }}>
                      Requested designer: <b>{c.designer.studioName}</b> ({c.designer.city})
                    </p>
                  )}
                  {c.notes && (
                    <p style={{ fontSize: 13, margin: '8px 0' }}>{c.notes}</p>
                  )}
                  <p className="muted" style={{ fontSize: 12, margin: 0 }}>
                    Ref {c.reference.slice(0, 8).toUpperCase()} ·{' '}
                    {new Date(c.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                <button
                  className="btn btn-dark"
                  onClick={() =>
                    setOpenAssign(openAssign === c.id ? null : c.id)
                  }
                >
                  {openAssign === c.id ? 'Cancel assign' : 'Assign to designer'}
                </button>
                <button
                  className="btn btn-light"
                  disabled={!!busy}
                  onClick={() =>
                    action(
                      `/api/admin/consultations/${c.id}`,
                      { action: 'decline', note: 'Declined by admin' },
                      c.id + 'decline',
                    )
                  }
                >
                  Decline
                </button>
                <button
                  className="btn btn-light"
                  disabled={!!busy}
                  onClick={() =>
                    action(
                      `/api/admin/consultations/${c.id}`,
                      { action: 'spam' },
                      c.id + 'spam',
                    )
                  }
                >
                  Mark as spam
                </button>
              </div>

              {openAssign === c.id && (
                <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                  {designers.length === 0 && (
                    <p className="muted" style={{ fontSize: 13 }}>
                      No verified designers yet. Approve a designer first.
                    </p>
                  )}
                  {designers.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        display: 'flex',
                        gap: 12,
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        border: '1px solid var(--line)',
                        borderRadius: 10,
                        background: '#fafaf8',
                      }}
                    >
                      <div>
                        <b>{d.studioName}</b>
                        <div className="muted" style={{ fontSize: 12 }}>
                          {d.city}
                        </div>
                      </div>
                      <button
                        className="btn btn-accent"
                        disabled={!!busy}
                        onClick={() =>
                          action(
                            `/api/admin/consultations/${c.id}`,
                            {
                              action: 'assign',
                              designerId: d.id,
                              note: 'Assigned by admin',
                            },
                            c.id + d.id,
                          )
                        }
                      >
                        {busy === c.id + d.id ? 'Assigning…' : 'Assign'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </article>
          ))
        )}
      </section>

      {/* ── Designer applications ─────────────────────────── */}
      <section className="panel">
        <h2>Designer applications</h2>
        {applications.length === 0 ? (
          <p className="muted">No pending applications.</p>
        ) : (
          applications.map((a) => (
            <article key={a.id} style={{ borderBottom: '1px solid #eee', padding: '14px 0' }}>
              <h3>{a.studioName}</h3>
              <p className="muted">
                {a.applicant.name || a.applicant.email} · {a.city}
                {a.specialty ? ` · ${a.specialty}` : ''}
              </p>
              <p>{a.experienceYr ?? 0} years experience</p>
              {a.bio && <p>{a.bio}</p>}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-dark"
                  disabled={!!busy}
                  onClick={() =>
                    action(
                      `/api/admin/designer-applications/${a.id}`,
                      { action: 'approve' },
                      a.id,
                    )
                  }
                >
                  {busy === a.id ? 'Saving…' : 'Approve & verify'}
                </button>
                <button
                  className="btn btn-light"
                  disabled={!!busy}
                  onClick={() =>
                    action(
                      `/api/admin/designer-applications/${a.id}`,
                      { action: 'reject' },
                      a.id + 'reject',
                    )
                  }
                >
                  Reject
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* ── Pending designs ──────────────────────────────── */}
      <section className="panel">
        <h2>Pending design listings</h2>
        {pendingDesigns.length === 0 ? (
          <p className="muted">No listings awaiting review.</p>
        ) : (
          pendingDesigns.map((d) => (
            <article key={d.id} style={{ borderBottom: '1px solid #eee', padding: '14px 0' }}>
              <h3>{d.title}</h3>
              <p className="muted">
                {d.category} · {d.style} · {d.designer.studioName}, {d.designer.city}
              </p>
              <p>₹{d.basePrice.toLocaleString('en-IN')}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="btn btn-dark"
                  disabled={!!busy}
                  onClick={() =>
                    action(
                      `/api/admin/designs/${d.id}`,
                      { action: 'approve' },
                      d.id + 'approve',
                    )
                  }
                >
                  Approve listing
                </button>
                <button
                  className="btn btn-light"
                  disabled={!!busy}
                  onClick={() =>
                    action(
                      `/api/admin/designs/${d.id}`,
                      { action: 'reject', note: 'Rejected by admin' },
                      d.id + 'reject',
                    )
                  }
                >
                  Reject listing
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      {/* ── Manage bookings ──────────────────────────────── */}
      <section className="panel" style={{ gridColumn: '1 / -1' }}>
        <h2>Manage bookings</h2>
        {bookings.length === 0 ? (
          <p className="muted">No bookings yet.</p>
        ) : (
          bookings.map((b) => (
            <article
              key={b.id}
              style={{
                borderBottom: '1px solid #eee',
                padding: '14px 0',
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px' }}>{b.design.title}</h3>
                <p className="muted" style={{ fontSize: 13, margin: 0 }}>
                  {b.reference} · {b.customer.user.name || b.customer.user.email}
                </p>
              </div>
              <select
                defaultValue={b.status}
                onChange={(e) =>
                  action(
                    `/api/admin/bookings/${b.id}`,
                    { status: e.target.value },
                    b.id,
                  )
                }
                disabled={!!busy}
                style={{ maxWidth: 240 }}
              >
                {[
                  'REQUESTED',
                  'DESIGNER_ACCEPTED',
                  'SITE_VISIT_SCHEDULED',
                  'SITE_VISIT_DONE',
                  'QUOTED',
                  'QUOTATION_SENT',
                  'QUOTATION_ACCEPTED',
                  'CONFIRMED',
                  'IN_PROGRESS',
                  'COMPLETED',
                  'CANCELLED',
                ].map((s) => (
                  <option key={s} value={s}>
                    {s.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </article>
          ))
        )}
      </section>

      {message && (
        <p role="alert" style={{ color: '#b00', gridColumn: '1 / -1' }}>
          {message}
        </p>
      )}
    </div>
  );
}
