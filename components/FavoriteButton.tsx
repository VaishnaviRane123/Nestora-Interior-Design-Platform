'use client';

import { useEffect, useState, type MouseEvent } from 'react';

type SavedDesign = { slug: string; title: string; imageUrl: string };
const STORAGE_KEY = 'nestora:saved-designs:v1';

function readSaved(): SavedDesign[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) as SavedDesign[] : [];
  } catch { return []; }
}

export default function FavoriteButton({ slug, title, imageUrl }: SavedDesign) {
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSaved(readSaved().some((item) => item.slug === slug));
    setReady(true);
  }, [slug]);

  function toggleSaved(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    const current = readSaved();
    const exists = current.some((item) => item.slug === slug);
    const next = exists ? current.filter((item) => item.slug !== slug) : [...current, { slug, title, imageUrl }];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setSaved(!exists);
    window.dispatchEvent(new CustomEvent('nestora:saved-designs-changed'));
  }

  return <button className={`favorite-button${saved ? ' is-saved' : ''}`} type="button" onClick={toggleSaved} aria-label={saved ? `Remove ${title} from saved designs` : `Save ${title}`} aria-pressed={saved} title={saved ? 'Saved' : 'Save design'}>{saved ? '♥' : '♡'}<span>{ready ? (saved ? 'Saved' : 'Save') : 'Save'}</span></button>;
}
