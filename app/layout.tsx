// app/layout.tsx
import './globals.css';
import Link from 'next/link';
import { Providers } from './providers';
import { auth } from '@/lib/auth';
import { SignOutButton } from '@/components/SignOutButton';

export const metadata = {
  title: 'Nestora | Find your kind of home',
  description:
    'Discover interior designs, estimate your budget in ₹, and book verified designers in your city.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <html lang="en">
      <body>
        <Providers>
          <header className="site-header">
            <div className="container nav">
              <Link href="/" className="brand nestora-logo">
                <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
                  <path
                    d="M3 20 C 8 22, 18 22, 23 20 M 4 16 C 9 18, 17 18, 22 16 M 6 12 C 10 14, 16 14, 20 12"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="13" cy="6" r="2.4" fill="#b47753" />
                </svg>
                <span>Nestora</span>
                <span className="logo-period">.</span>
              </Link>

              <nav>
                <Link href="/designs">Explore</Link>
                <Link href="/makeover">Room makeover</Link>
                <Link href="/designers">Designers</Link>
                <Link href="/boards">Boards</Link>
                <Link href="/ask">Ask Nestora</Link>
                <Link href="/estimate">Estimate</Link>
                {session?.user && <Link href="/dashboard">Dashboard</Link>}
                {isAdmin && <Link href="/admin">Admin</Link>}
              </nav>

              {session?.user ? (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: '#555' }}>
                    {session.user.name ?? session.user.email} · {session.user.role}
                  </span>
                  <SignOutButton />
                </div>
              ) : (
                <Link href="/login" className="btn btn-dark">Login</Link>
              )}
            </div>
          </header>

          {children}

          <footer>
            <div className="container footer-grid">
              <div>
                <div className="brand">Nestora<span>.</span></div>
                <p>Interior design discovery, budgeting and booking — made simple.</p>
              </div>
              <div>
                <strong>Explore</strong>
                <Link href="/designs">Designs</Link>
                <Link href="/designers">Designers</Link>
                <Link href="/estimate">Estimate</Link>
                <Link href="/ask">Ask Nestora</Link>
              </div>
              <div>
                <strong>For professionals</strong>
                <Link href="/designer/register">Join as designer</Link>
                <Link href="/admin">Admin</Link>
              </div>
            </div>
            <div className="container footer-bottom">
              © 2026 Nestora. Demo project.
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
