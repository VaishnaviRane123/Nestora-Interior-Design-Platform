// app/designs/page.tsx
import { getApprovedDesigns } from '@/lib/designs';
import DesignsClient from './designs-client';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Explore interior designs | Nestora',
  description:
    'Browse curated interior designs by room, style, property type, city and starting budget.',
};

export default async function DesignsPage() {
  const designs = await getApprovedDesigns();
  return <DesignsClient designs={designs} />;
}
