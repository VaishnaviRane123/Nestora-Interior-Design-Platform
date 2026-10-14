import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import LeadActions from './lead-actions';

export const dynamic = 'force-dynamic';

export default async function DesignerDashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login?callbackUrl=/designer/dashboard');
  const profile = await prisma.designer.findUnique({ where: { userId: session.user.id } });
  if (!profile) redirect('/designer/register');
  const bookings = await prisma.booking.findMany({ where: { designerId: profile.id }, include: { design: true, customer: { include: { user: true } } }, orderBy: { createdAt: 'desc' } });
  return <main className="page"><div className="container"><div className="eyebrow">Studio workspace</div><h1>{profile.studioName}</h1><p className="muted">Incoming consultation requests and project leads.</p><div className="panel" style={{ marginTop: 24 }}><div className="row"><h2 style={{ fontSize: 26 }}>Incoming leads</h2><span className="badge">{bookings.length} total</span></div>{bookings.length ? <table><thead><tr><th>Reference</th><th>Customer</th><th>Design</th><th>Status</th><th>Requested</th></tr></thead><tbody>{bookings.map((booking) => <tr key={booking.id}><td>{booking.reference}</td><td>{booking.customer.user.name || booking.customer.user.email}</td><td>{booking.design.title}</td><td><span className="badge">{booking.status.replaceAll('_', ' ')}</span></td><td>{booking.createdAt.toLocaleDateString('en-IN')}<LeadActions bookingId={booking.id} status={booking.status} /></td></tr>)}</tbody></table> : <p>No leads yet. Your profile is listed in the <Link href="/designers" className="text-link">designer directory</Link> when published.</p>}</div></div></main>;
}
