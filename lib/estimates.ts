// lib/estimates.ts
import { prisma } from '@/lib/prisma';
import { PropertyType } from '@prisma/client';

export const SCOPE_LABELS: Record<string, string> = {
  'full-home':   'Full Home',
  'kitchen':     'Kitchen',
  'living-room': 'Living Room',
};

export const TIER_LABELS: Record<string, string> = {
  essential: 'Essential',
  premium:   'Premium',
  luxury:    'Luxury',
};

export const PROPERTY_LABELS: Record<PropertyType, string> = {
  BHK_1: '1BHK',
  BHK_2: '2BHK',
  BHK_3: '3BHK',
  VILLA: 'Villa',
};

const VALID_SCOPES = ['full-home', 'kitchen', 'living-room'] as const;
const VALID_TIERS = ['essential', 'premium', 'luxury'] as const;

export type EstimateResult = {
  city: { slug: string; name: string; tier: number };
  propertyType: PropertyType;
  propertyLabel: string;
  scope: string;
  scopeLabel: string;
  styleTier: string;
  styleTierLabel: string;
  furniture:    { min: number; max: number };
  materials:    { min: number; max: number };
  labour:       { min: number; max: number };
  installation: { min: number; max: number };
  total:        { min: number; max: number };
  inclusions: string[];
  exclusions: string[];
  notes: string | null;
  slug: string;
};

const PROPERTY_FROM_STRING: Record<string, PropertyType> = {
  bhk_1: PropertyType.BHK_1,
  bhk_2: PropertyType.BHK_2,
  bhk_3: PropertyType.BHK_3,
  villa: PropertyType.VILLA,
};

// Canonical slug uses `--` as separator so components that themselves contain
// single dashes (`full-home`, `living-room`, `navi-mumbai`) remain parseable.
export function makeEstimateSlug(
  citySlug: string,
  propertyType: PropertyType,
  scope: string,
  styleTier: string,
): string {
  return [citySlug, propertyType.toLowerCase(), scope, styleTier].join('--');
}

/**
 * Parse an estimate slug.
 *
 * Accepts BOTH formats:
 *   - new: `pune--bhk_2--full-home--premium`   (double dash)
 *   - old: `pune-bhk_2-full-home-premium`      (single dash)
 *
 * This keeps old bookmarks working while everything new uses double dashes.
 */
export function parseEstimateSlug(slug: string): {
  citySlug: string;
  propertyType: PropertyType;
  scope: string;
  styleTier: string;
} | null {
  if (!slug || slug.length === 0) return null;

  // 1. Try the double-dash format first (canonical).
  if (slug.includes('--')) {
    const parts = slug.split('--');
    if (parts.length === 4) {
      const [citySlug, propertyRaw, scope, styleTier] = parts;
      const propertyType = PROPERTY_FROM_STRING[propertyRaw.toLowerCase()];
      if (
        propertyType &&
        VALID_SCOPES.includes(scope as (typeof VALID_SCOPES)[number]) &&
        VALID_TIERS.includes(styleTier as (typeof VALID_TIERS)[number]) &&
        citySlug.length > 0
      ) {
        return { citySlug, propertyType, scope, styleTier };
      }
    }
  }

  // 2. Fall back to the single-dash format.
  // We know the scope and tier are always the last two components.
  // The property type is a fixed vocabulary word.
  // The city slug is everything before the property type.
  const parts = slug.split('-');
  if (parts.length < 4) return null;

  const styleTier = parts[parts.length - 1];
  const scope = parts[parts.length - 2];

  if (!VALID_SCOPES.includes(scope as (typeof VALID_SCOPES)[number])) return null;
  if (!VALID_TIERS.includes(styleTier as (typeof VALID_TIERS)[number])) return null;

  // Look for the property type token anywhere before the scope.
  // Property tokens are: bhk_1, bhk_2, bhk_3, villa
  let propertyIndex = -1;
  for (let i = parts.length - 3; i >= 0; i--) {
    if (PROPERTY_FROM_STRING[parts[i].toLowerCase()]) {
      propertyIndex = i;
      break;
    }
  }
  if (propertyIndex < 0) return null;

  const propertyRaw = parts[propertyIndex];
  const propertyType = PROPERTY_FROM_STRING[propertyRaw.toLowerCase()];
  const citySlug = parts.slice(0, propertyIndex).join('-');
  if (citySlug.length === 0) return null;

  return { citySlug, propertyType, scope, styleTier };
}

export async function getEstimate(
  citySlug: string,
  propertyType: PropertyType,
  scope: string,
  styleTier: string,
): Promise<EstimateResult | null> {
  const row = await prisma.estimate.findFirst({
    where: {
      city: { slug: citySlug },
      propertyType,
      scope,
      styleTier,
    },
    include: { city: true },
  });
  if (!row) return null;

  const totalMin =
    row.furnitureMin + row.materialsMin + row.labourMin + row.installationMin;
  const totalMax =
    row.furnitureMax + row.materialsMax + row.labourMax + row.installationMax;

  return {
    city: { slug: row.city.slug, name: row.city.name, tier: row.city.tier },
    propertyType: row.propertyType,
    propertyLabel: PROPERTY_LABELS[row.propertyType],
    scope: row.scope,
    scopeLabel: SCOPE_LABELS[row.scope] ?? row.scope,
    styleTier: row.styleTier,
    styleTierLabel: TIER_LABELS[row.styleTier] ?? row.styleTier,
    furniture:    { min: row.furnitureMin,    max: row.furnitureMax },
    materials:    { min: row.materialsMin,    max: row.materialsMax },
    labour:       { min: row.labourMin,       max: row.labourMax },
    installation: { min: row.installationMin, max: row.installationMax },
    total:        { min: totalMin,            max: totalMax },
    inclusions: row.inclusions,
    exclusions: row.exclusions,
    notes: row.notes,
    slug: makeEstimateSlug(citySlug, propertyType, scope, styleTier),
  };
}

export async function getEstimateBySlug(
  slug: string,
): Promise<EstimateResult | null> {
  const parsed = parseEstimateSlug(slug);
  if (!parsed) return null;
  return getEstimate(
    parsed.citySlug,
    parsed.propertyType,
    parsed.scope,
    parsed.styleTier,
  );
}

export async function listCities() {
  return prisma.city.findMany({
    orderBy: [{ tier: 'asc' }, { name: 'asc' }],
  });
}

export function formatINR(n: number): string {
  return '₹' + n.toLocaleString('en-IN');
}

export function formatLakh(n: number): string {
  return '₹' + (n / 100000).toFixed(2) + 'L';
}
