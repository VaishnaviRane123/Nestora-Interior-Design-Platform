// app/ask/page.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

type ApiResponse = {
  kind: 'estimate' | 'designs' | 'no-data';
  reply: string;
  breakdown?: {
    furniture: [number, number];
    materials: [number, number];
    labour: [number, number];
    installation: [number, number];
    total: [number, number];
  };
  designs?: Array<{
    slug: string;
    title: string;
    category: string;
    style: string;
    basePrice: number;
    imageUrl: string | null;
    designer: string;
    city: string;
  }>;
  suggestions?: string[];
  estimateUrl?: string;
  designsUrl?: string;
};

const EXAMPLES = [
  'Modern 2BHK living room in Pune under ₹2 lakh',
  'Kitchen renovation in Mumbai, premium finish',
  '3BHK full home in Bengaluru, luxury',
  'Minimal bedroom ideas',
];

function inr(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function AskPage() {
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [answer, setAnswer] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function ask(message: string) {
    if (!message.trim()) return;
    setBusy(true);
    setError(null);
    setAnswer(null);
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data: ApiResponse & { error?: string } = await res.json().catch(() => ({} as ApiResponse));
      if (!res.ok) {
        setError(data.error ?? 'Could not answer that right now.');
        return;
      }
      setAnswer(data);
    } catch {
      setError('Could not connect to Nestora. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 820 }}>
        <div className="eyebrow">Catalogue-grounded guide</div>
        <h1 style={{ fontSize: 46 }}>Ask Nestora</h1>
        <p className="lead">
          A practical starting point for interior styles and budget planning.
          Every answer comes from Nestora&apos;s own catalogue — never invented.
        </p>

        <form
          className="panel"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
          style={{ marginTop: 22 }}
        >
          <label htmlFor="ask-input">Your question</label>
          <textarea
            id="ask-input"
            rows={3}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g. Suggest a modern 2BHK living room in Pune under ₹2 lakh"
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {EXAMPLES.map((ex) => (
              <button
                type="button"
                key={ex}
                className="tag"
                style={{ cursor: 'pointer', border: '1px solid var(--line)' }}
                onClick={() => {
                  setInput(ex);
                  void ask(ex);
                }}
              >
                {ex}
              </button>
            ))}
          </div>

          <button
            className="btn btn-accent"
            type="submit"
            disabled={busy || !input.trim()}
            style={{ marginTop: 18, width: '100%' }}
          >
            {busy ? 'Thinking…' : 'Ask Nestora'}
          </button>

          <p className="muted" style={{ fontSize: 12, marginTop: 12 }}>
            Answers are based on Nestora&apos;s catalogue and estimates. They are not quotations.
          </p>
        </form>

        {error && <p style={{ color: '#b00', marginTop: 16 }}>{error}</p>}

        {answer && (
          <div className="panel" style={{ marginTop: 22 }}>
            <p style={{ marginTop: 0 }}>{answer.reply}</p>

            {answer.breakdown && (
              <table className="estimate-breakdown" style={{ marginTop: 12 }}>
                <tbody>
                  <tr><td>Furniture &amp; fittings</td><td style={{ textAlign: 'right' }}>{inr(answer.breakdown.furniture[0])} – {inr(answer.breakdown.furniture[1])}</td></tr>
                  <tr><td>Materials</td><td style={{ textAlign: 'right' }}>{inr(answer.breakdown.materials[0])} – {inr(answer.breakdown.materials[1])}</td></tr>
                  <tr><td>Labour</td><td style={{ textAlign: 'right' }}>{inr(answer.breakdown.labour[0])} – {inr(answer.breakdown.labour[1])}</td></tr>
                  <tr><td>Installation</td><td style={{ textAlign: 'right' }}>{inr(answer.breakdown.installation[0])} – {inr(answer.breakdown.installation[1])}</td></tr>
                  <tr><td><b>Total</b></td><td style={{ textAlign: 'right' }}><b>{inr(answer.breakdown.total[0])} – {inr(answer.breakdown.total[1])}</b></td></tr>
                </tbody>
              </table>
            )}

            {answer.designs && answer.designs.length > 0 && (
              <div className="grid-3" style={{ marginTop: 18 }}>
                {answer.designs.map((d) => (
                  <Link href={`/designs/${d.slug}`} key={d.slug} className="card">
                    {d.imageUrl && (
                      <Image src={d.imageUrl} alt={d.title} width={600} height={400} style={{ width: '100%', height: 'auto' }} />
                    )}
                    <div className="card-body">
                      <h3 style={{ fontSize: 18 }}>{d.title}</h3>
                      <p className="muted" style={{ fontSize: 13 }}>{d.category} · {d.style}</p>
                      <p className="muted" style={{ fontSize: 12 }}>{d.designer} · {d.city}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {answer.suggestions && (
              <ul style={{ marginTop: 12 }}>
                {answer.suggestions.map((s) => <li key={s} className="muted">{s}</li>)}
              </ul>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 18, flexWrap: 'wrap' }}>
              {answer.estimateUrl && (
                <Link className="btn btn-dark" href={answer.estimateUrl}>Open budget estimator</Link>
              )}
              {answer.designsUrl && (
                <Link className="btn btn-light" href={answer.designsUrl}>Browse designs</Link>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
