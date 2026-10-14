// app/book/page.tsx
import { notFound } from 'next/navigation';
import BookForm from './book-form';
import { getApprovedDesigns, getDesignBySlug } from '@/lib/designs';

export const dynamic = 'force-dynamic';

export default async function Book({
  searchParams,
}: {
  searchParams: { design?: string };
}) {
  const slug = searchParams.design;
  if (!slug) {
    // Fall back to the first design so /book always works
    const all = await getApprovedDesigns();
    if (all.length === 0) notFound();
    return <BookForm
      designSlug={all[0].slug}
      designTitle={all[0].title}
      designerName={all[0].designer}
      designCity={all[0].city}
      basePrice={all[0].basePrice}
    />;
  }

  const design = await getDesignBySlug(slug);
  if (!design) notFound();

  return <BookForm
    designSlug={design.slug}
    designTitle={design.title}
    designerName={design.designer}
    designCity={design.city}
    basePrice={design.basePrice}
  />;
}
