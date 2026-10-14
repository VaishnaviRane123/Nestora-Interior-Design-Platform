import { getApprovedDesigns } from '@/lib/designs';
import SavedDesignsClient from './saved-client';

export const metadata = { title: 'Saved inspiration | Nestora', description: 'Your personal collection of saved interior design ideas.' };
export const dynamic = 'force-dynamic';

export default async function SavedPage() {
  const designs = await getApprovedDesigns();
  return <SavedDesignsClient designs={designs.map(({ id, slug, title, imageUrl, category, style, propertyLabel, areaLabel, city, basePrice }) => ({ id, slug, title, imageUrl, category, style, propertyLabel, areaLabel, city, basePrice }))} />;
}
