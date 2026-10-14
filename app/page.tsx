// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { getApprovedDesigns } from '@/lib/designs';
import FavoriteButton from '@/components/FavoriteButton';
import DesignImage from '@/components/DesignImage';

export const dynamic = 'force-dynamic';

const inspiration = [
  {
    title: 'Warm minimalism',
    category: 'Living Room',
    search: 'Living Room',
    image: '/images/living-room.jpg',
    tone: 'Warm neutrals, natural wood and soft light',
  },
  {
    title: 'Calm bedrooms',
    category: 'Bedroom',
    search: 'Bedroom',
    image: '/images/bedroom.jpg',
    tone: 'Restful layers and thoughtful storage',
  },
  {
    title: 'Everyday kitchens',
    category: 'Kitchen',
    search: 'Kitchen',
    image: '/images/kitchen.jpg',
    tone: 'Practical layouts with a refined finish',
  },
  {
    title: 'Small-space ideas',
    category: 'Full Home',
    search: 'Full Home',
    image: '/images/minimal-living.jpg',
    tone: 'Make every square foot work harder',
  },
];

export default async function Home() {
  const designs = await getApprovedDesigns();
  const featured = designs.slice(0, 8);

  return (
    <main>
      {/* ── Hero ───────────────────────────────────────── */}
      <section className="hero hero-modern">
        <div className="container hero-grid">
          <div className="hero-copy">
            <div className="eyebrow">A more personal kind of home design</div>
            <h1>
              Collect ideas.
              <br />
              <em>Create your place.</em>
            </h1>
            <p className="lead">
              Discover interiors that feel like you, explore realistic budget
              ranges, and find designers who can bring your ideas to life.
            </p>
            <div className="hero-actions">
              <Link className="btn btn-dark" href="/designs">
                Explore inspiration <span aria-hidden="true">↗</span>
              </Link>
              <Link className="btn btn-light" href="/makeover">
                Try room makeover
              </Link>
            </div>
            <div className="hero-proof">
              <span className="proof-dot" />
              Design inspiration for real Indian homes <span>·</span> Budgets in ₹
            </div>
          </div>

          <div className="hero-collage" aria-label="Interior design inspiration collage">
            <div className="hero-photo hero-photo-main">
              <Image
                src="/images/hero-living.jpg"
                alt="Warm modern living room with neutral furniture"
                fill
                priority
                sizes="(max-width: 800px) 100vw, 50vw"
                quality={90}
              />
            </div>
            <div className="hero-photo hero-photo-small">
              <Image
                src="/images/cream-living.jpg"
                alt="Elegant home interior details"
                fill
                sizes="(max-width: 800px) 45vw, 20vw"
                quality={90}
              />
            </div>
            <div className="floating-note">
              <span aria-hidden="true">✦</span>
              <div>
                <b>Your next idea</b>
                <small>Save it. Shape it. Make it yours.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Quick discover ─────────────────────────────── */}
      <section className="quick-discover">
        <div className="container quick-discover-inner">
          <div>
            <span className="eyebrow">Start with a room</span>
            <h2>What are you dreaming up?</h2>
          </div>
          <div className="room-links">
            {[
              ['Living Room', 'Living Room'],
              ['Bedroom', 'Bedroom'],
              ['Kitchen', 'Kitchen'],
              ['Full Home', 'Full Home'],
            ].map(([label, term]) => (
              <Link
                key={term}
                href={`/designs?search=${encodeURIComponent(term)}`}
                className="room-chip"
              >
                {label}
                <span>↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Inspiration grid ───────────────────────────── */}
      <section className="section inspiration-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Ideas worth saving</div>
              <h2>Find your kind of beautiful</h2>
              <p className="muted section-subtitle">
                Browse by mood, not just by room.
              </p>
            </div>
            <Link href="/designs" className="text-link">
              Explore all designs ↗
            </Link>
          </div>

          <div className="inspiration-grid">
            {inspiration.map((item, i) => (
              <Link
                href={`/designs?search=${encodeURIComponent(item.search)}`}
                className={`inspiration-card inspiration-card-${i + 1}`}
                key={item.title}
              >
                <Image
                  src={item.image}
                  alt={`${item.title} interior inspiration`}
                  fill
                  sizes="(max-width: 700px) 100vw, 25vw"
                  quality={85}
                />
                <span className="inspiration-shade" />
                <span className="inspiration-copy">
                  <small>{item.category}</small>
                  <b>{item.title}</b>
                  <span>{item.tone}</span>
                </span>
                <span className="inspiration-arrow">↗</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured masonry ──────────────────────────── */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">From the design library</div>
              <h2>Spaces to fall for</h2>
              <p className="muted section-subtitle">
                Save a look now, plan your project when you’re ready.
              </p>
            </div>
            <Link href="/designs" className="btn btn-light">
              View all designs
            </Link>
          </div>

          {featured.length === 0 ? (
            <div className="panel empty-state">
              <h2>New inspiration is on its way</h2>
              <p className="muted">
                Run <code>npm run db:seed</code> to add demo designs.
              </p>
            </div>
          ) : (
            <div className="masonry home-masonry">
              {featured.map((d, index) => (
                <article className="masonry-item" key={d.id}>
                  <div className="masonry-card">
                    <div className="masonry-media">
                      <Link href={`/designs/${d.slug}`} aria-label={`View ${d.title}`}>
                        <DesignImage
                          src={d.imageUrl}
                          alt={d.title}
                          priority={index < 3}
                        />
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
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Makeover band ──────────────────────────────── */}
      <section className="makeover-band">
        <div className="container makeover-band-inner">
          <div>
            <div className="eyebrow">Your room, reimagined</div>
            <h2>
              Have a room photo?
              <br />
              <em>Start with what you have.</em>
            </h2>
            <p>
              Choose a style, explore a colour direction and discover designs
              that match your vision.
            </p>
            <Link className="btn btn-light" href="/makeover">
              Open makeover planner ↗
            </Link>
          </div>
          <div className="makeover-swatch-row" aria-hidden="true">
            <span className="swatch swatch-1" />
            <span className="swatch swatch-2" />
            <span className="swatch swatch-3" />
            <span className="swatch swatch-4" />
            <span className="swatch swatch-5" />
          </div>
        </div>
      </section>

      {/* ── Steps ──────────────────────────────────────── */}
      <section className="section steps-section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">From idea to reality</div>
              <h2>Good design. Clear next steps.</h2>
            </div>
          </div>
          <div className="steps-grid">
            <article>
              <span>01</span>
              <h3>Discover</h3>
              <p>
                Browse real design ideas and save the looks you want to
                remember.
              </p>
            </article>
            <article>
              <span>02</span>
              <h3>Plan your budget</h3>
              <p>
                Explore an indicative cost range before you commit to a
                project.
              </p>
              <Link href="/estimate" className="text-link">
                Estimate my budget ↗
              </Link>
            </article>
            <article>
              <span>03</span>
              <h3>Meet a designer</h3>
              <p>
                Compare portfolios and request a consultation or site visit.
              </p>
              <Link href="/designers" className="text-link">
                Meet designers ↗
              </Link>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
