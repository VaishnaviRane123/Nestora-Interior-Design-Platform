// app/admin/page.tsx
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminActions from './admin-actions';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });
  if (currentUser?.role !== 'ADMIN') redirect('/login');

  const [
    customerCount,
    designerCount,
    bookingCount,
    designCount,
    consultationCount,
    pendingApplicationCount,
    reviewCount,
    cityCount,
    applications,
    bookings,
    pendingDesigns,
    consultations,
    designers,
  ] = await Promise.all([
    prisma.customer.count(),
    prisma.designer.count(),
    prisma.booking.count(),
    prisma.design.count({ where: { status: 'APPROVED' } }),
    prisma.consultationRequest.count({ where: { status: 'NEW' } }),
    prisma.designerApplication.count({ where: { status: 'PENDING' } }),
    prisma.review.count(),
    prisma.city.count(),
    prisma.designerApplication.findMany({
      where: { status: 'PENDING' },
      include: { applicant: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.booking.findMany({
      include: {
        design: { select: { title: true } },
        customer: { select: { user: { select: { name: true, email: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
    prisma.design.findMany({
      where: { status: { in: ['PENDING', 'PENDING_REVIEW'] } },
      include: { designer: { select: { studioName: true, city: true } } },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.consultationRequest.findMany({
      where: { status: 'NEW' },
      include: {
        designer: { select: { studioName: true, city: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.designer.findMany({
      where: { verified: true },
      select: { id: true, studioName: true, city: true },
      orderBy: { studioName: 'asc' },
    }),
  ]);

  return (
    <main className="page admin-page">
      <div className="container">
        <div className="eyebrow">Nestora · Administration</div>
        <div className="admin-heading">
          <div>
            <h1>Platform overview</h1>
            <p className="admin-subtitle">Manage customer enquiries, consultations, designer verification, design listings, bookings and the catalogue from one place.</p>
          </div>
          <a className="btn btn-dark" href="/">View public website ↗</a>
        </div>

        <div className="admin-kpis">
          <div className="admin-kpi"><span>Customers</span><strong>{customerCount}</strong></div>
          <div className="admin-kpi"><span>Designers</span><strong>{designerCount}</strong></div>
          <div className="admin-kpi"><span>Approved designs</span><strong>{designCount}</strong></div>
          <div className="admin-kpi"><span>Total bookings</span><strong>{bookingCount}</strong></div>
          <div className="admin-kpi"><span>New consultations</span><strong>{consultationCount}</strong></div>
          <div className="admin-kpi"><span>Pending applications</span><strong>{pendingApplicationCount}</strong></div>
          <div className="admin-kpi"><span>Customer reviews</span><strong>{reviewCount}</strong></div>
          <div className="admin-kpi"><span>Service cities</span><strong>{cityCount}</strong></div>
        </div>

        <AdminActions
          applications={applications}
          bookings={bookings}
          pendingDesigns={pendingDesigns}
          consultations={consultations.map((c) => ({
            id: c.id,
            reference: c.reference,
            name: c.name,
            phone: c.phone,
            email: c.email,
            city: c.city,
            roomType: c.roomType,
            budgetBand: c.budgetBand,
            notes: c.notes,
            designer: c.designer
              ? { studioName: c.designer.studioName, city: c.designer.city }
              : null,
            createdAt: c.createdAt.toISOString(),
          }))}
          designers={designers}
        />
      </div>
    </main>
  );
}
