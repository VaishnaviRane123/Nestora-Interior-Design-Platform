// app/dashboard/page.tsx
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/dashboard');

  // Lazy-create the Customer profile so every signed-in customer has one.
  const customer = await prisma.customer.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
    include: {
      bookings: {
        include: { design: true, designer: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  const bookings = customer.bookings;

  return (
    <main className="page">
      <div className="container">
        <div className="dashboard">
          <aside className="side">
            <div className="eyebrow">Customer</div>
            <h3 style={{ margin: '10px 12px' }}>{session.user.name ?? 'Your account'}</h3>
            <Link href="/dashboard">Overview</Link>
            <Link href="/boards">Saved designs</Link>
            <Link href="/designers">Designers</Link>
            <Link href="/book">New booking</Link>
          </aside>

          <section>
            <div className="section-head">
              <div>
                <div className="eyebrow">My projects</div>
                <h1 style={{ fontSize: 42 }}>Dashboard</h1>
              </div>
              <Link className="btn btn-dark" href="/designs">
                Explore designs
              </Link>
            </div>

            <div className="kpis">
              <div className="kpi">
                Active projects
                <strong>
                  {bookings.filter((b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED').length}
                </strong>
              </div>
              <div className="kpi">
                Upcoming visits
                <strong>
                  {bookings.filter((b) => b.status === 'SITE_VISIT_SCHEDULED').length}
                </strong>
              </div>
              <div className="kpi">
                Total bookings
                <strong>{bookings.length}</strong>
              </div>
            </div>

            <div className="panel">
              <h3>Bookings</h3>
              {bookings.length === 0 ? (
                <p className="muted">
                  No bookings yet. <Link href="/designs">Explore designs</Link> to get started.
                </p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Reference</th>
                      <th>Design</th>
                      <th>Designer</th>
                      <th>Status</th>
                      <th>Quoted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td><b>{b.reference.slice(0, 8).toUpperCase()}</b></td>
                        <td>{b.design.title}</td>
                        <td>{b.designer.studioName}</td>
                        <td>
                          <span className="badge">{b.status.replaceAll('_', ' ')}</span>
                        </td>
                        <td>
                          {b.quotedPrice
                            ? `₹${b.quotedPrice.toLocaleString('en-IN')}`
                            : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
