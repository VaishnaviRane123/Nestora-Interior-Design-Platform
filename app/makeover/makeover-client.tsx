// app/makeover/makeover-client.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type StyleKey = 'warm-modern' | 'calm-minimal' | 'earthy-natural' | 'contemporary';

type StyleDefinition = {
  key: StyleKey;
  label: string;
  short: string;
  swatches: string[];
  designDirection: (budget: string) => string;
  recommendedSearch: string;
};

const STYLES: StyleDefinition[] = [
  {
    key: 'warm-modern',
    label: 'Warm modern',
    short: 'Natural wood, soft curves and cosy neutral layers.',
    swatches: ['#EADFCE', '#C99A6B', '#F1E9DD', '#5A6552'],
    designDirection: (budget) =>
      `Natural wood, soft curves and cosy neutral layers. For a ${budget} project, start with one hero element, reuse finishes where practical, and confirm measurements before buying.`,
    recommendedSearch: 'Modern',
  },
  {
    key: 'calm-minimal',
    label: 'Calm minimal',
    short: 'Clean lines, uncluttered surfaces and quiet colours.',
    swatches: ['#F2EFE7', '#C9C5B8', '#EAE5DA', '#3A3D38'],
    designDirection: (budget) =>
      `Clean lines, uncluttered surfaces and quiet colours. For a ${budget} project, invest in built-in storage and matte finishes; keep decoration minimal and let negative space work.`,
    recommendedSearch: 'Minimal',
  },
  {
    key: 'earthy-natural',
    label: 'Earthy & natural',
    short: 'Terracotta, tactile fabrics and grounded materials.',
    swatches: ['#D9B48F', '#B5714A', '#E8DAC6', '#5E6B4E'],
    designDirection: (budget) =>
      `Terracotta, tactile fabrics and grounded materials. For a ${budget} project, prioritise handcrafted textures and natural stone; layer lighting for warmth.`,
    recommendedSearch: 'Contemporary',
  },
  {
    key: 'contemporary',
    label: 'Contemporary',
    short: 'Crisp contrast, statement lighting and considered accents.',
    swatches: ['#E8E4DD', '#9EA39A', '#F5F1E8', '#2B2B2B'],
    designDirection: (budget) =>
      `Crisp contrast, statement lighting and considered accents. For a ${budget} project, focus on one sculptural light, tailored joinery and restrained colour.`,
    recommendedSearch: 'Luxury',
  },
];

const BUDGETS = [
  { value: 'under-1.5', label: 'Under ₹1.5 lakh' },
  { value: '1.5-3', label: '₹1.5–3 lakh' },
  { value: '3-6', label: '₹3–6 lakh' },
  { value: '6-12', label: '₹6–12 lakh' },
  { value: '12-plus', label: '₹12 lakh+' },
] as const;

const ROOM_TYPES = [
  'Living room',
  'Bedroom',
  'Kitchen',
  'Dining room',
  'Home office',
  'Bathroom',
  'Kids room',
] as const;

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];

export default function MakeoverClient() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoName, setPhotoName] = useState<string>('');
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [roomType, setRoomType] = useState<string>(ROOM_TYPES[0]);
  const [budget, setBudget] = useState<string>('1.5-3');
  const [styleKey, setStyleKey] = useState<StyleKey>('warm-modern');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = STYLES.find((s) => s.key === styleKey)!;
  const budgetLabel = BUDGETS.find((b) => b.value === budget)?.label ?? '';

  useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  function handleFile(file: File | null) {
    setPhotoError(null);
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setPhotoError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setPhotoError('That image is larger than 8 MB. Please resize it first.');
      return;
    }
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    const url = URL.createObjectURL(file);
    setPhotoUrl(url);
    setPhotoName(file.name);
  }

  function clearPhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    setPhotoUrl(null);
    setPhotoName('');
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function copySummary() {
    const summary = [
      `Nestora room direction`,
      `Room: ${roomType}`,
      `Style: ${style.label}`,
      `Budget: ${budgetLabel}`,
      `Palette: ${style.swatches.join(', ')}`,
      `Direction: ${style.designDirection(budgetLabel)}`,
    ].join('\n');
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="page makeover-page">
      <div className="container">
        <div className="eyebrow">A little help imagining your space</div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 46 }}>
          Your room, your style.
        </h1>
        <p className="lead">
          Upload a room photo, choose the feeling you want, and build a simple
          design direction to explore on Nestora.
        </p>

        <div className="makeover-workspace">
          {/* ── Left: Controls ──────────────────────── */}
          <section className="panel makeover-controls">
            <h2>Tell us about your room</h2>
            <p className="muted">
              Your photo stays in this browser. Nothing is uploaded to a server.
            </p>

            <div
              className="upload-drop"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0] ?? null;
                handleFile(file);
              }}
            >
              <div className="upload-icon" aria-hidden="true">↑</div>
              <b>Choose a room photo</b>
              <small>JPG, PNG or WebP · up to 8 MB</small>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
              {photoName && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  <span className="muted">Selected: {photoName}</span>
                  <button
                    type="button"
                    className="text-button"
                    onClick={clearPhoto}
                    style={{ marginLeft: 8 }}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {photoError && (
              <p style={{ color: '#b00', fontSize: 13, marginTop: -8 }}>
                {photoError}
              </p>
            )}

            <div className="form-grid">
              <div>
                <label htmlFor="room-type">Room type</label>
                <select
                  id="room-type"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value)}
                >
                  {ROOM_TYPES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="budget">Budget range</label>
                <select
                  id="budget"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  {BUDGETS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <label>Choose a style</label>
              <div className="style-options">
                {STYLES.map((s) => (
                  <button
                    type="button"
                    key={s.key}
                    className={`style-option${s.key === styleKey ? ' active' : ''}`}
                    onClick={() => setStyleKey(s.key)}
                    aria-pressed={s.key === styleKey}
                  >
                    <div className="style-swatches" aria-hidden="true">
                      {s.swatches.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </div>
                    <b>{s.label}</b>
                    <small>{s.short}</small>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22, flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn btn-accent"
                style={{ flex: 1, minWidth: 200 }}
                onClick={copySummary}
              >
                {copied ? '✓ Copied to clipboard' : 'Copy my style direction'}
              </button>
              <Link
                className="btn btn-dark"
                href={`/designs?search=${encodeURIComponent(style.recommendedSearch)}`}
              >
                Explore matching designs ↗
              </Link>
            </div>
          </section>

          {/* ── Right: Preview ──────────────────────── */}
          <aside className="makeover-preview">
            <div className="preview-top">
              <div className="eyebrow">Your concept board</div>
              <span className="preview-status">
                {photoUrl ? 'Live preview' : 'Preview'}
              </span>
            </div>

            <div className={`room-preview room-preview-${styleKey}`}>
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt="Your uploaded room"
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="preview-placeholder">
                  <span aria-hidden="true">✦</span>
                  <b>Your room goes here</b>
                  <small>Upload a photo to preview it in your board</small>
                </div>
              )}
              <div className="preview-overlay">
                <span>{roomType.toUpperCase()}</span>
                <b>{style.label}</b>
              </div>
            </div>

            <div className="palette-panel">
              <div>
                <b>{style.label} palette</b>
                <p className="muted">A starting point for materials and finishes.</p>
              </div>
              <div className="palette-swatches" aria-hidden="true">
                {style.swatches.map((c) => (
                  <span key={c} style={{ background: c }} />
                ))}
              </div>
            </div>

            <div className="preview-note">
              <b>Design direction</b>
              <p>{style.designDirection(budgetLabel)}</p>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              <Link className="btn btn-dark" href="/estimate">
                Refine the budget ↗
              </Link>
              <Link className="btn btn-light" href="/designers">
                Meet a designer
              </Link>
            </div>

            <p className="tiny-note muted">
              This is a starting direction, not a rendered image or a quotation.
              Replace swatch colours and finishes after a site visit.
            </p>
          </aside>
        </div>

        <div className="notice" style={{ marginTop: 22 }}>
          Privacy tip: use a photo without people, personal documents or visible
          home-address details.
        </div>
      </div>
    </main>
  );
}
