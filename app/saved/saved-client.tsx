'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import FavoriteButton from '@/components/FavoriteButton';

type Design = { id: string; slug: string; title: string; imageUrl: string; category: string; style: string; propertyLabel: string; areaLabel: string; city: string; basePrice: number };
type Saved = { slug: string; title: string; imageUrl: string };
const STORAGE_KEY = 'nestora:saved-designs:v1';

export default function SavedDesignsClient({ designs }: { designs: Design[] }) {
  const [savedSlugs, setSavedSlugs] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const sync = () => {
      try {
        const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Saved[];
        setSavedSlugs(items.map((item) => item.slug));
      } catch { setSavedSlugs([]); }
      setReady(true);
    };
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('nestora:saved-designs-changed', sync);
    return () => { window.removeEventListener('storage', sync); window.removeEventListener('nestora:saved-designs-changed', sync); };
  }, []);
  const saved = designs.filter((design) => savedSlugs.includes(design.slug));
  return <main className="page saved-page"><div className="container"><div className="eyebrow">Your personal collection</div><h1 className="page-title">Ideas you love.</h1><p className="lead">Keep your favourite rooms together while you plan your space.</p>
    {!ready ? <p className="muted">Loading your saved designs…</p> : saved.length ? <div className="masonry saved-masonry">{saved.map((d) => <article className="masonry-item" key={d.id}><div className="masonry-card"><div className="masonry-media"><Link href={`/designs/${d.slug}`}><Image src={d.imageUrl} alt={d.title} width={800} height={1000} sizes="(max-width: 640px) 100vw, 33vw" style={{ width: '100%', height: 'auto' }} /></Link><FavoriteButton slug={d.slug} title={d.title} imageUrl={d.imageUrl} /></div><div className="masonry-body"><div className="row"><Link href={`/designs/${d.slug}`} className="masonry-title">{d.title}</Link><span className="masonry-price">₹{Math.round(d.basePrice / 1000)}K+</span></div><p className="masonry-meta">{d.propertyLabel} · {d.areaLabel} · {d.city}</p><div className="masonry-tags"><span className="tag">{d.category}</span><span className="tag">{d.style}</span></div></div></div></article>)}</div> : <div className="panel empty-state saved-empty"><div className="empty-heart">♡</div><h2>Your inspiration board starts here</h2><p className="muted">Tap the heart on any design to save it here. Saved items stay in this browser.</p><Link href="/designs" className="btn btn-dark">Discover designs</Link></div>}
  </div></main>;
}
