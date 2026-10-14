// lib/designs.ts
import { prisma } from '@/lib/prisma';
import { PropertyType, ProjectKind, DesignStatus } from '@prisma/client';

export type PublicDesign = {
  id: string;
  slug: string;
  title: string;
  category: string;
  style: string;
  propertyType: PropertyType;
  projectKind: ProjectKind;
  propertyLabel: string;
  areaLabel: string;
  basePrice: number;
  imageUrl: string;
  designer: string;
  designerVerified: boolean;
  city: string;
  description: string;
  colors: string[];
};

const PROPERTY_LABEL: Record<PropertyType, string> = {
  BHK_1: '1BHK',
  BHK_2: '2BHK',
  BHK_3: '3BHK',
  VILLA: 'Villa',
};

function toPublicDesign(d: {
  id: string;
  slug: string;
  title: string;
  category: string;
  style: string;
  propertyType: PropertyType;
  projectKind: ProjectKind;
  areaSqftMin: number;
  areaSqftMax: number;
  basePrice: number;
  imageUrl: string | null;
  description: string;
  colors: string[];
  designer: { studioName: string; city: string; verified: boolean };
}): PublicDesign {
  return {
    id: d.id,
    slug: d.slug,
    title: d.title,
    category: d.category,
    style: d.style,
    propertyType: d.propertyType,
    projectKind: d.projectKind,
    propertyLabel: PROPERTY_LABEL[d.propertyType],
    areaLabel: `${d.areaSqftMin}-${d.areaSqftMax} sq.ft`,
    basePrice: d.basePrice,
    imageUrl:
      d.imageUrl ??
      '/images/hero-living.jpg',
    designer: d.designer.studioName,
    designerVerified: d.designer.verified,
    city: d.designer.city,
    description: d.description,
    colors: d.colors,
  };
}

const include = {
  designer: { select: { studioName: true, city: true, verified: true } },
} as const;

export async function getApprovedDesigns(): Promise<PublicDesign[]> {
  const rows = await prisma.design.findMany({
    where: { status: DesignStatus.APPROVED },
    include,
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(toPublicDesign);
}

export async function getDesignBySlug(slug: string): Promise<PublicDesign | null> {
  const row = await prisma.design.findUnique({
    where: { slug },
    include,
  });
  if (!row || row.status !== DesignStatus.APPROVED) return null;
  return toPublicDesign(row);
}

export async function getDesignsByIds(ids: string[]): Promise<PublicDesign[]> {
  if (ids.length === 0) return [];
  const rows = await prisma.design.findMany({
    where: { id: { in: ids }, status: DesignStatus.APPROVED },
    include,
  });
  return rows.map(toPublicDesign);
}
