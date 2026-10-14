// app/designs/designs-client.tsx
'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { PublicDesign } from '@/lib/designs';
import FavoriteButton from '@/components/FavoriteButton';
import DesignImage from '@/components/DesignImage';

type Props = { designs: PublicDesign[] };

// Normalise a string for search: lowercase, strip trailing "s" per word,
// collapse whitespace. Handles plurals without a full stemmer.
function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => (word.length > 3 ? word.replace(/s$/, '') : word))
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default function DesignsClient({ designs }: Props) {
  const [q, setQ] = useState('');
  const [style, setStyle] = useState('All');
  const [category, setCategory] = useState('All');
  const [property, setProperty] = useState('All');
  const [projectType, setProjectType] = useState('All');
  const [city, setCity] = useState('All');
  const [budget, setBudget] = useState('All');

  // Read initial filters from the URL (?search=..., ?city=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialSearch = params.get('search');
    const initialCity = params.get('city');
    if (initialSearch) setQ(initialSearch);
    if (initialCity) {
      const matchingCity = designs.find(
        (design) => design.city.toLowerCase() === initialCity.toLowerCase(),
      )?.city;
      if (matchingCity) setCity(matchingCity);
    }
  }, [designs]);

  const categories = useMemo(
    () => Array.from(new Set(designs.map((d) => d.category))),
    [designs],
  );
  const cities = useMemo(
    () => Array.from(new Set(designs.map((d) => d.city))),
    [designs],
  );
  const styles = useMemo(
    () => Array.from(new Set(designs.map((d) => d.style))),
    [designs],
  );

  const filtered = useMemo(() => {
    const normalisedQ = normalise(q);
    const words = normalisedQ.split(' ').filter((w) => w.length > 1);

    return designs.filter((d) => {
      const haystack = normalise(
        `${d.title} ${d.category} ${d.style} ${d.propertyLabel} ${d.city} ${d.description}`,
      );

      // Empty query → everything passes.
      // Otherwise: every word in the query must appear somewhere in the haystack.
      const matchesSearch =
        words.length === 0 || words.every((word) => haystack.includes(word));

      const matchesBudget =
        budget === 'All' ||
        (budget === 'under-150000' && d.basePrice < 150000) ||
        (budget === '150000-250000' && d.basePrice >= 150000 && d.basePrice <= 250000) ||
        (budget === '250000-500000' && d.basePrice > 250000 && d.basePrice <= 500000) ||
        (budget === 'over-500000' && d.basePrice > 500000);

      return (
        matchesSearch &&
        (style === 'All' || d.style === style) &&
        (category === 'All' || d.category === category) &&
        (property === 'All' || d.propertyLabel === property) &&
        (projectType === 'All' ||
          (projectType === 'New home' && d.projectKind === 'NEW') ||
          (projectType === 'Renovation' && d.projectKind === 'RENOVATION')) &&
        (city === 'All' || d.city === city) &&
        matchesBudget
      );
    });
  }, [designs, q, style, category, property, projectType, city, budget]);

  const clearFilters = () => {
    setQ('');
    setStyle('All');
    setCategory('All');
    setProperty('All');
    setProjectType('All');
    setCity('All');
    setBudget('All');
  };

  return (
    <main className="page">
      <div className="container">
        <div className="eyebrow">Design library</div>
        <h1 style={{ fontSize: 48 }}>Explore interior designs</h1>
        <p className="lead">
          Find ideas for your home by room, property type, project, location, style and
          starting budget. Save your favourites as you go.
        </p>

        <div className="design-page-actions">
          <Link href="/saved" className="text-link">
            ♡ View saved inspiration
          </Link>
          <Link href="/makeover" className="text-link">
            Try the room makeover planner ↗
          </Link>
        </div>

        <div className="design-filters" aria-label="Filter designs">
          <div className="filter-search">
            <label htmlFor="design-search">Search</label>
            <input
              id="design-search"
              placeholder="Search designs, rooms, styles..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="design-category">Room / scope</label>
            <select
              id="design-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="All">All rooms</option>
              {categories.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="design-property">Home type</label>
            <select
              id="design-property"
              value={property}
              onChange={(e) => setProperty(e.target.value)}
            >
              <option value="All">Any home type</option>
              {['1BHK', '2BHK', '3BHK', 'Villa'].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="design-project-type">Project</label>
            <select
              id="design-project-type"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            >
              <option value="All">New or renovation</option>
              <option value="New home">New home</option>
              <option value="Renovation">Renovation</option>
            </select>
          </div>

          <div>
            <label htmlFor="design-city">Location</label>
            <select
              id="design-city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="All">All locations</option>
              {cities.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="design-style">Style</label>
            <select
              id="design-style"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            >
              <option value="All">All styles</option>
              {styles.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="design-budget">Starting budget</label>
            <select
              id="design-budget"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
            >
              <option value="All">Any budget</option>
              <option value="under-150000">Under ₹1.5 lakh</option>
              <option value="150000-250000">₹1.5–2.5 lakh</option>
              <option value="250000-500000">₹2.5–5 lakh</option>
              <option value="over-500000">Over ₹5 lakh</option>
            </select>
          </div>
        </div>

        <div className="results-summary">
          <p className="muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? 'design' : 'designs'} found
          </p>
          {filtered.length !== designs.length && (
            <button className="text-button" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="masonry">
            {filtered.map((d) => (
              <div className="masonry-item" key={d.id}>
                <div className="masonry-card">
                  <div className="masonry-media">
                    <Link href={`/designs/${d.slug}`} aria-label={`View ${d.title}`}>
                      <DesignImage src={d.imageUrl} alt={d.title} />
                    </Link>
                    <FavoriteButton
                      slug={d.slug}
                      title={d.title}
                      imageUrl={d.imageUrl}
                    />
                  </div>
                  <div className="masonry-body">
                    <div className="row">
                      <Link href={`/designs/${d.slug}`} className="masonry-title">
                        {d.title}
                      </Link>
                      <span className="masonry-price">
                        ₹{Math.round(d.basePrice / 1000)}K+
                      </span>
                    </div>
                    <p className="masonry-meta">
                      {d.propertyLabel} · {d.areaLabel} · {d.city}
                    </p>
                    <div className="masonry-tags">
                      <span className="tag">{d.category}</span>
                      <span className="tag">{d.style}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="panel empty-state">
            <h2>No designs match those filters</h2>
            <p className="muted">
              Try broadening your search or clearing some filters.
            </p>
            <button className="btn btn-dark" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
