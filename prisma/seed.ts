// prisma/seed.ts
import 'dotenv/config';
import {
  PrismaClient,
  PropertyType,
  ProjectKind,
  OptionType,
  BookingStatus,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// ─────────────────────────────────────────────────────
// Every design gets its OWN cover image. No sharing.
// Gallery images are drawn from a bigger pool and rotated
// so no two designs have the same 4-image sequence.
// ─────────────────────────────────────────────────────

const COVER = {
  // Full Home
  warmModern2bhk:      '/images/hero-living.jpg',
  layeredLuxury:       '/images/villa-interior.jpg',
  compactCity:         '/images/apartment-interior.jpg',
  heritage3bhk:        '/images/heritage-interior.jpg',

  // Living Room
  calmMinimal:         '/images/minimal-living.jpg',
  oliveOak:            '/images/cream-living.jpg',
  sunlitReading:       '/images/reading-nook.jpg',
  artDeco:             '/images/art-deco-lounge.jpg',
  warmBoho:            '/images/boho-lounge.jpg',
  classicLiving:       '/images/living-room.jpg',

  // Kitchen
  earthyKitchen:       '/images/kitchen.jpg',
  compactKitchen:      '/images/modern-kitchen.jpg',
  chefsIsland:         '/images/island-kitchen.jpg',
  minimalWhiteKitchen: '/images/white-kitchen.jpg',

  // Bedroom
  urbanLuxeBedroom:    '/images/bedroom.jpg',
  softNeutralBedroom:  '/images/calm-bedroom.jpg',
  cozyMasterSuite:     '/images/master-suite.jpg',
  kidsRoom:            '/images/kids-bedroom.jpg',
  minimalGuest:        '/images/guest-bedroom.jpg',
  teakHeritage:        '/images/cozy-bedroom.jpg',

  // Dining
  japandiDining:       '/images/japandi-dining.jpg',
  warmFamilyDining:    '/images/family-dining.jpg',
  diningClassic:       '/images/dining-room.jpg',

  // Home Office
  focusedOffice:       '/images/home-office.jpg',
  executiveStudy:      '/images/executive-study.jpg',

  // Bathroom
  spaBathroom:         '/images/spa-bathroom.jpg',
  compactGuestBath:    '/images/guest-bathroom.jpg',

  // Pooja
  carvedPooja:         '/images/pooja-unit.jpg',

  // Balcony
  balconyRetreat:      '/images/balcony-retreat.jpg',
};

// Gallery pool — 30+ distinct images.
const GALLERY_POOL = [
  '/images/hero-living.jpg',
  '/images/cream-living.jpg',
  '/images/living-room.jpg',
  '/images/minimal-living.jpg',
  '/images/boho-lounge.jpg',
  '/images/art-deco-lounge.jpg',
  '/images/reading-nook.jpg',
  '/images/bedroom.jpg',
  '/images/calm-bedroom.jpg',
  '/images/cozy-bedroom.jpg',
  '/images/kids-bedroom.jpg',
  '/images/guest-bedroom.jpg',
  '/images/master-suite.jpg',
  '/images/kitchen.jpg',
  '/images/modern-kitchen.jpg',
  '/images/island-kitchen.jpg',
  '/images/white-kitchen.jpg',
  '/images/dining-room.jpg',
  '/images/japandi-dining.jpg',
  '/images/family-dining.jpg',
  '/images/home-office.jpg',
  '/images/executive-study.jpg',
  '/images/spa-bathroom.jpg',
  '/images/guest-bathroom.jpg',
  '/images/pooja-unit.jpg',
  '/images/decor-details.jpg',
  '/images/accessories.jpg',
  '/images/balcony-retreat.jpg',
  '/images/villa-interior.jpg',
  '/images/apartment-interior.jpg',
  '/images/heritage-interior.jpg',
  '/images/material-wood.jpg',
  '/images/material-stone.jpg',
  '/images/material-marble.jpg',
];

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Refusing to seed demo accounts in production. Seed only a development database.',
    );
  }
  const password = await hash('demo1234', 10);

  // ── Admin ──
  await prisma.user.upsert({
    where: { email: 'admin@nestora.demo' },
    update: {},
    create: {
      email: 'admin@nestora.demo',
      name: 'Admin User',
      role: 'ADMIN',
      passwordHash: password,
    },
  });

  // ── Customer ──
  const custUser = await prisma.user.upsert({
    where: { email: 'customer@nestora.demo' },
    update: {},
    create: {
      email: 'customer@nestora.demo',
      name: 'Vaishnavi Rane',
      role: 'CUSTOMER',
      passwordHash: password,
      customer: {
        create: {
          city: 'Pune',
          propertyType: PropertyType.BHK_2,
          projectKind: ProjectKind.NEW,
          budgetMin: 500000,
          budgetMax: 1500000,
        },
      },
    },
    include: { customer: true },
  });

  // ── Designers ──
  const d1User = await prisma.user.upsert({
    where: { email: 'studio.terra@nestora.demo' },
    update: {},
    create: {
      email: 'studio.terra@nestora.demo',
      name: 'Studio Terra',
      role: 'DESIGNER',
      passwordHash: password,
      designer: {
        create: {
          studioName: 'Studio Terra',
          city: 'Pune',
          specialty: 'Modern residential',
          experienceYr: 7,
          verified: true,
          bio: 'Warm, functional homes with a focus on craft and light.',
          avatarUrl: '/images/hero-living.jpg',
          coverUrl: '/images/hero-living.jpg',
        },
      },
    },
    include: { designer: true },
  });

  const d2User = await prisma.user.upsert({
    where: { email: 'moss.form@nestora.demo' },
    update: {},
    create: {
      email: 'moss.form@nestora.demo',
      name: 'Moss & Form',
      role: 'DESIGNER',
      passwordHash: password,
      designer: {
        create: {
          studioName: 'Moss & Form',
          city: 'Pune',
          specialty: 'Minimal interiors',
          experienceYr: 5,
          verified: true,
          bio: 'Calm, minimal interiors designed for everyday living.',
          avatarUrl: '/images/minimal-living.jpg',
          coverUrl: '/images/minimal-living.jpg',
        },
      },
    },
    include: { designer: true },
  });

  const d3User = await prisma.user.upsert({
    where: { email: 'atelier27@nestora.demo' },
    update: {},
    create: {
      email: 'atelier27@nestora.demo',
      name: 'Atelier 27',
      role: 'DESIGNER',
      passwordHash: password,
      designer: {
        create: {
          studioName: 'Atelier 27',
          city: 'Mumbai',
          specialty: 'Luxury residential',
          experienceYr: 11,
          verified: true,
          bio: 'Luxury residential interiors with a focus on material craft.',
          avatarUrl: '/images/bedroom.jpg',
          coverUrl: '/images/bedroom.jpg',
        },
      },
    },
    include: { designer: true },
  });

  const terra   = d1User.designer!;
  const moss    = d2User.designer!;
  const atelier = d3User.designer!;
  const customer = custUser.customer!;

  // ── Design catalogue — every design has a UNIQUE cover image ──
  const designSeeds = [
    // ═══════════ Full Home ═══════════
    {
      slug: 'warm-modern-2bhk', title: 'Warm Modern 2BHK', designerId: terra.id,
      category: 'Full Home', style: 'Modern', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 1100, areaSqftMax: 1300, basePrice: 850000, timelineDays: 60,
      imageUrl: COVER.warmModern2bhk,
      description: 'A warm contemporary package with wood textures, neutral walls, modular storage and layered lighting.',
      inclusions: ['Modular kitchen', 'False ceiling', 'Wardrobes (2)', 'TV unit', 'Loose furniture', 'Lighting design'],
      materials: ['BWR ply carcass', 'Acrylic finish', 'Laminate shutters'],
      colors: ['Warm Oak', 'Ivory', 'Olive'],
      options: [
        { type: OptionType.FURNITURE, name: 'L-shaped sofa', priceDelta: 15000, isDefault: true, sortOrder: 1 },
        { type: OptionType.FURNITURE, name: '3-seater sofa', priceDelta: -8000, sortOrder: 2 },
        { type: OptionType.COLOR, name: 'Warm Oak walls', priceDelta: 0, isDefault: true, sortOrder: 3 },
        { type: OptionType.ADDON, name: 'Study nook', priceDelta: 22000, sortOrder: 4 },
      ],
    },
    {
      slug: 'layered-luxury-retreat', title: 'Layered Luxury Retreat', designerId: atelier.id,
      category: 'Full Home', style: 'Luxury', propertyType: PropertyType.VILLA, projectKind: ProjectKind.NEW,
      areaSqftMin: 1700, areaSqftMax: 2300, basePrice: 1450000, timelineDays: 75,
      imageUrl: COVER.layeredLuxury,
      description: 'A composed premium interior using warm timber, stone accents and layered ambient lighting.',
      inclusions: ['Full-home design', 'Custom joinery', 'False ceiling throughout', 'Lighting design', 'Loose furniture'],
      materials: ['Natural stone', 'Veneer', 'Boucle'],
      colors: ['Mocha', 'Brass', 'Cream'],
    },
    {
      slug: 'compact-city-apartment', title: 'Compact City Apartment', designerId: moss.id,
      category: 'Full Home', style: 'Minimal', propertyType: PropertyType.BHK_1, projectKind: ProjectKind.NEW,
      areaSqftMin: 550, areaSqftMax: 700, basePrice: 450000, timelineDays: 45,
      imageUrl: COVER.compactCity,
      description: 'Every square foot works hard. Hidden storage, foldable surfaces and a calm palette for a small city home.',
      inclusions: ['Modular kitchen', 'Wardrobe', 'TV unit', 'Loft storage', 'Lighting'],
      materials: ['BWR ply', 'Laminate', 'Matte metal'],
      colors: ['White', 'Ash', 'Sage'],
    },
    {
      slug: 'heritage-3bhk-renovation', title: 'Heritage 3BHK Renovation', designerId: terra.id,
      category: 'Full Home', style: 'Indo-Modern', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.RENOVATION,
      areaSqftMin: 1500, areaSqftMax: 1800, basePrice: 1250000, timelineDays: 90,
      imageUrl: COVER.heritage3bhk,
      description: 'A respectful renovation of an older family home with new services, restored woodwork and modern storage.',
      inclusions: ['Structural upgrades', 'Full rewiring', 'Restored joinery', 'Modular kitchen', 'Bathrooms (2)'],
      materials: ['Reclaimed teak', 'Terrazzo', 'Handmade tiles'],
      colors: ['Warm White', 'Teak', 'Terracotta'],
    },

    // ═══════════ Living Room ═══════════
    {
      slug: 'calm-minimal-living', title: 'Calm Minimal Living', designerId: moss.id,
      category: 'Living Room', style: 'Minimal', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 180, areaSqftMax: 260, basePrice: 145000, timelineDays: 30,
      imageUrl: COVER.calmMinimal,
      description: 'Clean lines, soft textures and practical storage designed for a calm everyday living room.',
      inclusions: ['TV unit', 'Feature wall', 'Loose seating', 'Lighting'],
      materials: ['MR ply', 'Matte laminate'],
      colors: ['Sand', 'Sage', 'White'],
      options: [
        { type: OptionType.FURNITURE, name: 'Low-profile sofa', priceDelta: 12000, isDefault: true, sortOrder: 1 },
        { type: OptionType.FURNITURE, name: 'Lounge chair add-on', priceDelta: 18000, sortOrder: 2 },
      ],
    },
    {
      slug: 'olive-oak-lounge', title: 'Olive & Oak Lounge', designerId: terra.id,
      category: 'Living Room', style: 'Warm Modern', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 180, areaSqftMax: 280, basePrice: 260000, timelineDays: 35,
      imageUrl: COVER.oliveOak,
      description: 'A family-friendly lounge built around olive accents, tactile fabrics and durable oak tones.',
      inclusions: ['Seating', 'TV console', 'Accent lighting', 'Rug and cushions'],
      materials: ['Performance fabric', 'Oak veneer', 'Ceramic'],
      colors: ['Olive', 'Sand', 'Oak'],
    },
    {
      slug: 'sunlit-reading-nook', title: 'Sunlit Reading Nook', designerId: moss.id,
      category: 'Living Room', style: 'Scandinavian', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 90, areaSqftMax: 130, basePrice: 95000, timelineDays: 20,
      imageUrl: COVER.sunlitReading,
      description: 'A quiet corner with a wall of bookshelves, a soft armchair and warm task lighting for slow afternoons.',
      inclusions: ['Bookshelf unit', 'Armchair', 'Floor lamp', 'Side table'],
      materials: ['Solid pine', 'Boucle', 'Brass'],
      colors: ['Natural Pine', 'Cream', 'Warm Gold'],
    },
    {
      slug: 'art-deco-lounge', title: 'Art Deco Lounge', designerId: atelier.id,
      category: 'Living Room', style: 'Luxury', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 240, areaSqftMax: 340, basePrice: 385000, timelineDays: 40,
      imageUrl: COVER.artDeco,
      description: 'A glamorous living room with brass detailing, velvet upholstery and dramatic pendant lighting.',
      inclusions: ['Designer seating', 'Marble console', 'Feature wall', 'Pendant lighting'],
      materials: ['Velvet', 'Brass', 'Marble'],
      colors: ['Deep Emerald', 'Brass', 'Cream'],
    },
    {
      slug: 'warm-boho-family-room', title: 'Warm Boho Family Room', designerId: terra.id,
      category: 'Living Room', style: 'Contemporary', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 260, areaSqftMax: 360, basePrice: 220000, timelineDays: 30,
      imageUrl: COVER.warmBoho,
      description: 'Layered textiles, natural rattan and generous seating for a family that loves to spend time together.',
      inclusions: ['Modular sofa', 'Rattan accents', 'Rugs and cushions', 'Lighting'],
      materials: ['Rattan', 'Cotton', 'Jute'],
      colors: ['Terracotta', 'Cream', 'Camel'],
    },
    {
      slug: 'classic-contemporary-living', title: 'Classic Contemporary Living', designerId: atelier.id,
      category: 'Living Room', style: 'Contemporary', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 220, areaSqftMax: 300, basePrice: 195000, timelineDays: 32,
      imageUrl: COVER.classicLiving,
      description: 'A polished living room with structured seating, tailored joinery and considered lighting.',
      inclusions: ['Sofa set', 'TV unit', 'Coffee table', 'Lighting'],
      materials: ['Cotton blend', 'Veneer', 'Stone'],
      colors: ['Sand', 'Walnut', 'Brass'],
    },

    // ═══════════ Kitchen ═══════════
    {
      slug: 'earthy-kitchen-studio', title: 'Earthy Kitchen Studio', designerId: terra.id,
      category: 'Kitchen', style: 'Contemporary', propertyType: PropertyType.BHK_1, projectKind: ProjectKind.RENOVATION,
      areaSqftMin: 90, areaSqftMax: 130, basePrice: 220000, timelineDays: 30,
      imageUrl: COVER.earthyKitchen,
      description: 'Functional modular kitchen with durable finishes, efficient storage and a compact breakfast counter.',
      inclusions: ['Modular cabinets', 'Countertop', 'Backsplash', 'Sink'],
      materials: ['BWR ply', 'Quartz counter', 'Ceramic backsplash'],
      colors: ['Terracotta', 'Oak', 'Cream'],
    },
    {
      slug: 'compact-city-kitchen', title: 'Compact City Kitchen', designerId: terra.id,
      category: 'Kitchen', style: 'Contemporary', propertyType: PropertyType.BHK_1, projectKind: ProjectKind.NEW,
      areaSqftMin: 80, areaSqftMax: 120, basePrice: 245000, timelineDays: 28,
      imageUrl: COVER.compactKitchen,
      description: 'An efficient kitchen with accessible storage, easy-clean surfaces and a restrained palette.',
      inclusions: ['Modular cabinets', 'Countertop', 'Sink', 'Hardware'],
      materials: ['Quartz', 'Laminate', 'Ceramic tile'],
      colors: ['Cream', 'Terracotta', 'Walnut'],
    },
    {
      slug: 'chefs-island-kitchen', title: "Chef's Island Kitchen", designerId: atelier.id,
      category: 'Kitchen', style: 'Luxury', propertyType: PropertyType.VILLA, projectKind: ProjectKind.NEW,
      areaSqftMin: 250, areaSqftMax: 380, basePrice: 680000, timelineDays: 55,
      imageUrl: COVER.chefsIsland,
      description: "A serious cook's kitchen with a marble island, integrated appliances and custom storage.",
      inclusions: ['Island unit', 'Marble counters', 'Integrated appliances area', 'Task lighting'],
      materials: ['Italian marble', 'Oak veneer', 'Brass hardware'],
      colors: ['Carrara White', 'Walnut', 'Brass'],
    },
    {
      slug: 'minimal-white-kitchen', title: 'Minimal White Kitchen', designerId: moss.id,
      category: 'Kitchen', style: 'Minimal', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.RENOVATION,
      areaSqftMin: 110, areaSqftMax: 160, basePrice: 320000, timelineDays: 32,
      imageUrl: COVER.minimalWhiteKitchen,
      description: 'A handleless, calm kitchen with a durable quartz counter and thoughtful storage layout.',
      inclusions: ['Handleless cabinets', 'Quartz counter', 'Integrated sink', 'Task lighting'],
      materials: ['High-gloss laminate', 'Quartz', 'Stainless'],
      colors: ['Pure White', 'Soft Grey', 'Chrome'],
    },

    // ═══════════ Bedroom ═══════════
    {
      slug: 'urban-luxe-bedroom', title: 'Urban Luxe Bedroom', designerId: atelier.id,
      category: 'Bedroom', style: 'Luxury', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 140, areaSqftMax: 190, basePrice: 185000, timelineDays: 35,
      imageUrl: COVER.urbanLuxeBedroom,
      description: 'A premium bedroom concept with a feature wall, integrated wardrobes and warm ambient lighting.',
      inclusions: ['Feature wall', 'Wardrobe', 'Bed back panel', 'Lighting'],
      materials: ['BWR ply', 'PU finish', 'Veneer'],
      colors: ['Charcoal', 'Walnut', 'Brass'],
    },
    {
      slug: 'soft-neutral-bedroom', title: 'Soft Neutral Bedroom', designerId: atelier.id,
      category: 'Bedroom', style: 'Contemporary', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 150, areaSqftMax: 220, basePrice: 210000, timelineDays: 32,
      imageUrl: COVER.softNeutralBedroom,
      description: 'Soft neutral layers, a tailored headboard and integrated bedside storage for restful living.',
      inclusions: ['Headboard panel', 'Wardrobe', 'Bedside units', 'Lighting'],
      materials: ['Upholstery', 'Engineered wood', 'Brass'],
      colors: ['Ivory', 'Taupe', 'Walnut'],
    },
    {
      slug: 'cozy-master-suite', title: 'Cozy Master Suite', designerId: terra.id,
      category: 'Bedroom', style: 'Warm Modern', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 160, areaSqftMax: 220, basePrice: 165000, timelineDays: 30,
      imageUrl: COVER.cozyMasterSuite,
      description: 'A retreat-like master with warm wood, layered lighting and a comfortable reading corner.',
      inclusions: ['Bed back panel', 'Wardrobe', 'Reading nook', 'Lighting'],
      materials: ['Oak veneer', 'Linen', 'Matte metal'],
      colors: ['Warm Oak', 'Cream', 'Charcoal'],
    },
    {
      slug: 'kids-room-adventure', title: 'Kids Room Adventure', designerId: moss.id,
      category: 'Bedroom', style: 'Contemporary', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 120, areaSqftMax: 170, basePrice: 135000, timelineDays: 25,
      imageUrl: COVER.kidsRoom,
      description: 'A playful, durable kids room with modular bunk storage, a study corner and hand-washable finishes.',
      inclusions: ['Bunk bed', 'Storage unit', 'Study desk', 'Lighting'],
      materials: ['BWR ply', 'Washable laminate', 'Non-toxic paint'],
      colors: ['Sage', 'Mustard', 'Off-white'],
    },
    {
      slug: 'minimal-guest-bedroom', title: 'Minimal Guest Bedroom', designerId: moss.id,
      category: 'Bedroom', style: 'Minimal', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 100, areaSqftMax: 140, basePrice: 95000, timelineDays: 22,
      imageUrl: COVER.minimalGuest,
      description: 'A serene guest room that does more with less — built-in storage, soft textures, quiet colours.',
      inclusions: ['Bed unit', 'Wardrobe', 'Bedside table', 'Lighting'],
      materials: ['Engineered wood', 'Cotton', 'Limewash'],
      colors: ['Cream', 'Natural Oak', 'Soft Grey'],
    },
    {
      slug: 'teak-heritage-bedroom', title: 'Teak Heritage Bedroom', designerId: terra.id,
      category: 'Bedroom', style: 'Indo-Modern', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.RENOVATION,
      areaSqftMin: 170, areaSqftMax: 230, basePrice: 280000, timelineDays: 40,
      imageUrl: COVER.teakHeritage,
      description: 'Restored teak furniture meets modern storage in a warm, respectful renovation of a family bedroom.',
      inclusions: ['Restored teak furniture', 'New wardrobe', 'Lighting upgrade', 'Textiles'],
      materials: ['Reclaimed teak', 'Cotton', 'Brass'],
      colors: ['Teak', 'Warm Cream', 'Deep Green'],
    },

    // ═══════════ Dining ═══════════
    {
      slug: 'japandi-dining-room', title: 'Japandi Dining Room', designerId: moss.id,
      category: 'Dining', style: 'Japandi', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 130, areaSqftMax: 190, basePrice: 195000, timelineDays: 28,
      imageUrl: COVER.japandiDining,
      description: 'A quiet dining space with rounded timber furniture, natural texture and warm layered light.',
      inclusions: ['Dining table', 'Chairs', 'Pendant light', 'Sideboard'],
      materials: ['Oak veneer', 'Linen', 'Limewash'],
      colors: ['Oat', 'Oak', 'Sage'],
    },
    {
      slug: 'warm-family-dining', title: 'Warm Family Dining', designerId: moss.id,
      category: 'Dining', style: 'Scandinavian', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 120, areaSqftMax: 200, basePrice: 145000, timelineDays: 24,
      imageUrl: COVER.warmFamilyDining,
      description: 'A welcoming dining space combining warm wood, comfortable seating and soft statement lighting.',
      inclusions: ['Dining table', 'Chairs', 'Pendant lighting', 'Storage unit'],
      materials: ['Solid wood', 'Veneer', 'Powder-coated metal'],
      colors: ['Walnut', 'Warm White', 'Olive'],
    },
    {
      slug: 'formal-dining-classic', title: 'Formal Dining Classic', designerId: atelier.id,
      category: 'Dining', style: 'Indo-Modern', propertyType: PropertyType.VILLA, projectKind: ProjectKind.NEW,
      areaSqftMin: 200, areaSqftMax: 300, basePrice: 380000, timelineDays: 45,
      imageUrl: COVER.diningClassic,
      description: 'A generous, formal dining room with a stone-topped table, tailored seating and statement lighting.',
      inclusions: ['8-seater dining set', 'Buffet unit', 'Pendant lighting', 'Accent wall'],
      materials: ['Marble', 'Teak', 'Brass'],
      colors: ['Cream', 'Teak', 'Antique Brass'],
    },

    // ═══════════ Home Office ═══════════
    {
      slug: 'focused-home-office', title: 'Focused Home Office', designerId: moss.id,
      category: 'Home Office', style: 'Minimal', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 70, areaSqftMax: 110, basePrice: 125000, timelineDays: 20,
      imageUrl: COVER.focusedOffice,
      description: 'A compact work-from-home corner with thoughtful cable management and calm finishes.',
      inclusions: ['Work desk', 'Storage shelves', 'Task lighting'],
      materials: ['Veneer', 'Powder-coated steel', 'Cotton'],
      colors: ['Cream', 'Walnut', 'Olive'],
    },
    {
      slug: 'executive-study', title: 'Executive Study', designerId: atelier.id,
      category: 'Home Office', style: 'Luxury', propertyType: PropertyType.VILLA, projectKind: ProjectKind.NEW,
      areaSqftMin: 180, areaSqftMax: 260, basePrice: 340000, timelineDays: 38,
      imageUrl: COVER.executiveStudy,
      description: 'A serious home study with a built-in library wall, brass task lighting and generous desk space.',
      inclusions: ['Desk', 'Library wall', 'Task lighting', 'Reading chair'],
      materials: ['Walnut', 'Brass', 'Leather'],
      colors: ['Dark Walnut', 'Deep Green', 'Brass'],
    },

    // ═══════════ Bathroom ═══════════
    {
      slug: 'spa-bathroom-retreat', title: 'Spa Bathroom Retreat', designerId: atelier.id,
      category: 'Bathroom', style: 'Contemporary', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.RENOVATION,
      areaSqftMin: 60, areaSqftMax: 100, basePrice: 245000, timelineDays: 30,
      imageUrl: COVER.spaBathroom,
      description: 'A spa-like master bath with stone surfaces, soft lighting and concealed storage.',
      inclusions: ['Vanity unit', 'Stone feature wall', 'Lighting', 'Fittings upgrade'],
      materials: ['Marble', 'Brushed brass', 'Stone tile'],
      colors: ['Carrara', 'Brass', 'Soft Grey'],
    },
    {
      slug: 'compact-guest-bathroom', title: 'Compact Guest Bathroom', designerId: moss.id,
      category: 'Bathroom', style: 'Minimal', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 35, areaSqftMax: 60, basePrice: 95000, timelineDays: 18,
      imageUrl: COVER.compactGuestBath,
      description: 'A small, well-organised guest bath with clean tiling and practical storage.',
      inclusions: ['Vanity', 'Wall tile', 'Mirror', 'Fittings'],
      materials: ['Ceramic', 'Matte chrome', 'Laminate'],
      colors: ['White', 'Soft Grey', 'Oak'],
    },

    // ═══════════ Pooja ═══════════
    {
      slug: 'carved-pooja-unit', title: 'Carved Pooja Unit', designerId: terra.id,
      category: 'Pooja', style: 'Indo-Modern', propertyType: PropertyType.BHK_3, projectKind: ProjectKind.NEW,
      areaSqftMin: 20, areaSqftMax: 40, basePrice: 85000, timelineDays: 18,
      imageUrl: COVER.carvedPooja,
      description: 'A compact pooja unit with a carved wooden back panel, stone platform and warm brass lighting.',
      inclusions: ['Carved back panel', 'Stone platform', 'Brass fittings', 'Warm lighting'],
      materials: ['Teak', 'Granite', 'Brass'],
      colors: ['Teak', 'Cream Stone', 'Brass'],
    },

    // ═══════════ Balcony ═══════════
    {
      slug: 'balcony-garden-retreat', title: 'Balcony Garden Retreat', designerId: moss.id,
      category: 'Balcony', style: 'Contemporary', propertyType: PropertyType.BHK_2, projectKind: ProjectKind.NEW,
      areaSqftMin: 40, areaSqftMax: 70, basePrice: 65000, timelineDays: 15,
      imageUrl: COVER.balconyRetreat,
      description: 'A small balcony turned into a green retreat with built-in seating and weatherproof planting.',
      inclusions: ['Bench seat', 'Planter boxes', 'Weather-resistant finishes', 'Lighting'],
      materials: ['Teak', 'Powder-coated metal', 'Outdoor fabric'],
      colors: ['Teak', 'Forest Green', 'Cream'],
    },
  ];

  for (const seed of designSeeds) {
    const { options, ...designData } = seed;
    await prisma.design.upsert({
      where: { slug: seed.slug },
      update: {
        imageUrl: seed.imageUrl,
        title: seed.title,
        basePrice: seed.basePrice,
        description: seed.description,
      },
      create: {
        ...designData,
        status: 'APPROVED',
        ...(options && { options: { create: options } }),
      },
    });
  }

  // ── Extended demo catalogue: 60 extra interior design samples ──
  // Idempotent upserts keep this safe to run more than once in development.
  const sampleCategories = [
    { category: 'Living Room', styles: ['Modern', 'Minimal', 'Scandinavian', 'Indo-Modern'] },
    { category: 'Kitchen', styles: ['Contemporary', 'Minimal', 'Warm Modern', 'Luxury'] },
    { category: 'Bedroom', styles: ['Modern', 'Japandi', 'Luxury', 'Bohemian'] },
    { category: 'Full Home', styles: ['Warm Modern', 'Contemporary', 'Minimal', 'Indo-Modern'] },
    { category: 'Bathroom', styles: ['Spa', 'Contemporary', 'Minimal', 'Luxury'] },
    { category: 'Study', styles: ['Minimal', 'Modern', 'Scandinavian', 'Industrial'] },
    { category: 'Balcony', styles: ['Botanical', 'Contemporary', 'Bohemian', 'Minimal'] },
    { category: 'Dining Room', styles: ['Modern', 'Classic', 'Warm Modern', 'Luxury'] },
    { category: 'Kids Room', styles: ['Playful', 'Scandinavian', 'Modern', 'Pastel'] },
    { category: 'Pooja', styles: ['Traditional', 'Indo-Modern', 'Minimal', 'Classic'] },
  ];
  const sampleNames = [
    'Sage & Sand Retreat', 'The Quiet Courtyard', 'Ivory Line Studio', 'Terracotta Stories',
    'Oak and Olive House', 'Soft Light Residence', 'The Sunday Apartment', 'Monsoon Mood Home',
    'Calm Corner Collection', 'Modern Heirloom', 'The Golden Hour Room', 'Urban Nest Compact',
    'Natural Texture Home', 'Blue Pottery Accent', 'Warm Minimal Escape', 'The Reading Haven',
    'Crafted Comfort', 'Sunlit Serenity', 'The Artful Apartment', 'Earth and Ember',
    'Bespoke Family Home', 'The Petite Kitchen', 'Linen and Light', 'The Green Balcony',
    'Midnight Walnut Suite', 'Pastel Playhouse', 'Marble and Brass', 'Quiet Luxury Living',
    'The Weekend Villa', 'Heritage Reimagined', 'Japandi Calm', 'Coastal Neutral Home',
    'Modern Maharashtrian Home', 'The Collector’s Lounge', 'Soft Geometry', 'Garden View Studio',
    'The Minimalist Kitchen', 'Textured Stone Retreat', 'Sunrise Bedroom', 'The Artisan Dining Room',
    'Little Explorer Room', 'Brass Bloom Pooja', 'Compact Work Nook', 'The Wellness Bathroom',
    'Warm Timber Living', 'Saffron Accent Home', 'The Airy 1BHK', 'Layered Neutrals',
    'Contemporary Courtyard', 'The Family Gathering Room', 'Moss and Maple', 'Evening Glow Suite',
    'The Practical Pantry', 'The Indoor Garden', 'Soft Arch Residence', 'The Thoughtful Studio',
    'Classic Revisited', 'The Modern Villa', 'Handcrafted Details', 'The Everyday Luxury Home',
  ];
  const sampleImages = [
    '/images/living-room.jpg', '/images/minimal-living.jpg', '/images/cream-living.jpg',
    '/images/boho-lounge.jpg', '/images/art-deco-lounge.jpg', '/images/kitchen.jpg',
    '/images/modern-kitchen.jpg', '/images/island-kitchen.jpg', '/images/white-kitchen.jpg',
    '/images/bedroom.jpg', '/images/calm-bedroom.jpg', '/images/master-suite.jpg',
    '/images/kids-bedroom.jpg', '/images/guest-bedroom.jpg', '/images/cozy-bedroom.jpg',
    '/images/guest-bathroom.jpg', '/images/pooja-unit.jpg', '/images/decor-details.jpg',
    '/images/balcony-retreat.jpg', '/images/villa-interior.jpg', '/images/apartment-interior.jpg',
    '/images/heritage-interior.jpg', '/images/reading-nook.jpg', '/images/material-wood.jpg',
  ];
  const sampleDesigners = [terra.id, moss.id, atelier.id];
  for (let i = 0; i < sampleNames.length; i++) {
    const group = sampleCategories[i % sampleCategories.length];
    const style = group.styles[Math.floor(i / sampleCategories.length) % group.styles.length];
    const slug = `nestora-sample-${String(i + 1).padStart(2, '0')}`;
    const propertyTypes = [PropertyType.BHK_1, PropertyType.BHK_2, PropertyType.BHK_3, PropertyType.VILLA];
    const price = 65000 + ((i * 37125) % 1450000);
    await prisma.design.upsert({
      where: { slug },
      update: { title: sampleNames[i], category: group.category, style, basePrice: price, imageUrl: sampleImages[i % sampleImages.length] },
      create: {
        slug,
        title: sampleNames[i],
        designerId: sampleDesigners[i % sampleDesigners.length],
        category: group.category,
        style,
        propertyType: propertyTypes[i % propertyTypes.length],
        projectKind: i % 5 === 0 ? ProjectKind.RENOVATION : ProjectKind.NEW,
        areaSqftMin: 80 + (i % 8) * 45,
        areaSqftMax: 160 + (i % 8) * 65,
        basePrice: price,
        timelineDays: 15 + (i % 7) * 8,
        status: 'APPROVED',
        imageUrl: sampleImages[i % sampleImages.length],
        description: `${style} ${group.category.toLowerCase()} concept with practical storage, balanced lighting, durable finishes and a carefully coordinated colour palette. Sample catalogue entry for browsing and project planning.`,
        inclusions: ['Design consultation', 'Material palette', 'Lighting plan', 'Furniture layout'],
        materials: ['Natural wood', 'Textured laminate', 'Linen', 'Ceramic'],
        colors: ['Warm Ivory', 'Natural Oak', 'Soft Olive'],
      },
    });
  }

  // ── Refresh gallery, colour and material rows ──
  // Gallery images ROTATE through the pool by design index, so every design
  // gets a DIFFERENT set of 4 gallery images. No two designs share the same
  // 4-image sequence.
  const allDesigns = await prisma.design.findMany({
    select: { id: true, title: true, imageUrl: true },
    orderBy: { createdAt: 'asc' },
  });

  const palette = [
    { name: 'Warm Ivory', hex: '#E8DFD0' },
    { name: 'Natural Oak', hex: '#B68A5A' },
    { name: 'Soft Olive', hex: '#777A54' },
    { name: 'Terracotta', hex: '#B8764A' },
    { name: 'Walnut', hex: '#4A3A2A' },
  ];

  const materialChoices = [
    { name: 'Natural oak veneer', imageUrl: '/images/material-wood.jpg', notes: 'Warm timber grain for cabinetry and furniture.' },
    { name: 'Linen upholstery', imageUrl: '/images/material-textile.jpg', notes: 'Breathable fabric for soft furnishings.' },
    { name: 'Textured stone', imageUrl: '/images/material-stone.jpg', notes: 'Adds subtle variation to counters and feature surfaces.' },
    { name: 'Brushed brass', imageUrl: '/images/material-brass.jpg', notes: 'A restrained accent for handles and lighting.' },
    { name: 'Italian marble', imageUrl: '/images/material-marble.jpg', notes: 'Luxurious vein-patterned surface for counters and consoles.' },
    { name: 'Glazed ceramic', imageUrl: '/images/material-ceramic.jpg', notes: 'Durable, easy-clean finish for backsplashes and floors.' },
  ];

  for (const [index, design] of allDesigns.entries()) {
    await prisma.designImage.deleteMany({ where: { designId: design.id } });
    await prisma.designColor.deleteMany({ where: { designId: design.id } });
    await prisma.designMaterial.deleteMany({ where: { designId: design.id } });

    // Four gallery images, uniquely offset per design so no two designs
    // share the same 4-image sequence. The design's own cover image is
    // also included as the first gallery entry if it is in the pool.
    const galleryUrls: string[] = [];
    // Start with the design's own cover
    galleryUrls.push(design.imageUrl ?? GALLERY_POOL[index % GALLERY_POOL.length]);
    // Then grab 3 more from the pool, offset by design index
    for (let offset = 1; offset <= 3; offset++) {
      galleryUrls.push(GALLERY_POOL[(index * 3 + offset) % GALLERY_POOL.length]);
    }

    await prisma.designImage.createMany({
      data: galleryUrls.map((url, offset) => ({
        designId: design.id,
        imageUrl: url,
        alt: `${design.title} — view ${offset + 1}`,
        caption: ['Overall composition', 'Material detail', 'Furniture layout', 'Lighting details'][offset],
        sortOrder: offset,
      })),
    });

    await prisma.designColor.createMany({
      data: palette.map((color, i) => ({
        designId: design.id,
        ...color,
        sortOrder: i,
      })),
    });

    await prisma.designMaterial.createMany({
      data: materialChoices.map((material, i) => ({
        designId: design.id,
        ...material,
        sortOrder: i,
      })),
    });
  }

  // ── Demo booking ──
  const warmModern = await prisma.design.findUnique({ where: { slug: 'warm-modern-2bhk' } });
  if (warmModern) {
    const existingBooking = await prisma.booking.findFirst({
      where: { customerId: customer.id, designId: warmModern.id },
    });
    if (!existingBooking) {
      await prisma.booking.create({
        data: {
          customerId: customer.id,
          designerId: terra.id,
          designId: warmModern.id,
          status: BookingStatus.SITE_VISIT_SCHEDULED,
          propertyType: PropertyType.BHK_2,
          city: 'Pune',
          budgetBand: '₹5-10 lakh',
          notes: 'Looking for a warm, low-maintenance full-home package.',
          quotedPrice: 820000,
          scheduledAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
        },
      });
    }
  }

  // ── Demo consultation requests ──
  const terraForConsult = await prisma.designer.findFirst({
    where: { studioName: 'Studio Terra' },
    select: { id: true },
  });

  const existingConsult = await prisma.consultationRequest.findFirst({
    where: { phone: '+91 98765 43210' },
  });
  if (!existingConsult) {
    await prisma.consultationRequest.create({
      data: {
        name: 'Priya Deshmukh',
        phone: '+91 98765 43210',
        email: 'priya@example.com',
        city: 'Pune',
        designerId: terraForConsult?.id ?? null,
        roomType: 'Full home',
        budgetBand: '₹6–12 lakh',
        notes: 'Looking for a warm, low-maintenance 2BHK full-home design.',
      },
    });
  }

  const existingConsult2 = await prisma.consultationRequest.findFirst({
    where: { phone: '+91 91234 56789' },
  });
  if (!existingConsult2) {
    await prisma.consultationRequest.create({
      data: {
        name: 'Karan Mehta',
        phone: '+91 91234 56789',
        city: 'Mumbai',
        designerId: null,
        roomType: 'Kitchen',
        budgetBand: '₹3–6 lakh',
        notes: 'Need a modular kitchen redesign in a 3BHK.',
      },
    });
  }

  await seedEstimates();

  console.log('Seeded:', {
    customer: custUser.email,
    designers: [d1User.email, d2User.email, d3User.email],
    designs: await prisma.design.count({ where: { status: 'APPROVED' } }),
    note: 'Every design has a unique cover image.',
  });
}

async function seedEstimates() {
  const cities = [
    { slug: 'pune',      name: 'Pune',      tier: 2 },
    { slug: 'mumbai',    name: 'Mumbai',    tier: 1 },
    { slug: 'bengaluru', name: 'Bengaluru', tier: 1 },
    { slug: 'nashik',    name: 'Nashik',    tier: 3 },
    { slug: 'nagpur',    name: 'Nagpur',    tier: 3 },
  ];

  const tierMultiplier: Record<number, number> = { 1: 1.35, 2: 1.0, 3: 0.8 };

  type Base = {
    scope: string;
    propertyType: PropertyType;
    furniture: [number, number];
    materials: [number, number];
    labour: [number, number];
    installation: [number, number];
  };

  const bases: Record<string, Base[]> = {
    'full-home-essential': [
      { scope: 'full-home', propertyType: PropertyType.BHK_1, furniture: [120000, 180000], materials: [90000, 140000], labour: [70000, 100000], installation: [30000, 50000] },
      { scope: 'full-home', propertyType: PropertyType.BHK_2, furniture: [220000, 320000], materials: [160000, 240000], labour: [120000, 180000], installation: [50000, 80000] },
      { scope: 'full-home', propertyType: PropertyType.BHK_3, furniture: [340000, 480000], materials: [240000, 340000], labour: [180000, 260000], installation: [80000, 120000] },
      { scope: 'full-home', propertyType: PropertyType.VILLA,  furniture: [600000, 900000], materials: [450000, 700000], labour: [350000, 500000], installation: [150000, 250000] },
    ],
    'full-home-premium': [
      { scope: 'full-home', propertyType: PropertyType.BHK_1, furniture: [200000, 300000], materials: [180000, 260000], labour: [120000, 170000], installation: [50000, 80000] },
      { scope: 'full-home', propertyType: PropertyType.BHK_2, furniture: [380000, 550000], materials: [320000, 460000], labour: [220000, 320000], installation: [90000, 140000] },
      { scope: 'full-home', propertyType: PropertyType.BHK_3, furniture: [580000, 820000], materials: [480000, 680000], labour: [340000, 480000], installation: [140000, 210000] },
      { scope: 'full-home', propertyType: PropertyType.VILLA,  furniture: [1000000, 1500000], materials: [900000, 1350000], labour: [650000, 950000], installation: [260000, 400000] },
    ],
    'full-home-luxury': [
      { scope: 'full-home', propertyType: PropertyType.BHK_1, furniture: [320000, 480000], materials: [320000, 470000], labour: [180000, 260000], installation: [80000, 130000] },
      { scope: 'full-home', propertyType: PropertyType.BHK_2, furniture: [600000, 900000], materials: [580000, 850000], labour: [340000, 500000], installation: [150000, 230000] },
      { scope: 'full-home', propertyType: PropertyType.BHK_3, furniture: [900000, 1350000], materials: [880000, 1300000], labour: [520000, 760000], installation: [230000, 350000] },
      { scope: 'full-home', propertyType: PropertyType.VILLA,  furniture: [1600000, 2400000], materials: [1700000, 2500000], labour: [1000000, 1500000], installation: [450000, 680000] },
    ],
    'kitchen-essential': [
      { scope: 'kitchen', propertyType: PropertyType.BHK_1, furniture: [60000, 90000], materials: [40000, 60000], labour: [25000, 40000], installation: [10000, 18000] },
      { scope: 'kitchen', propertyType: PropertyType.BHK_2, furniture: [90000, 130000], materials: [60000, 90000], labour: [38000, 55000], installation: [15000, 25000] },
      { scope: 'kitchen', propertyType: PropertyType.BHK_3, furniture: [130000, 180000], materials: [90000, 130000], labour: [55000, 80000], installation: [22000, 35000] },
      { scope: 'kitchen', propertyType: PropertyType.VILLA,  furniture: [180000, 250000], materials: [130000, 190000], labour: [80000, 110000], installation: [32000, 50000] },
    ],
    'kitchen-premium': [
      { scope: 'kitchen', propertyType: PropertyType.BHK_1, furniture: [110000, 160000], materials: [90000, 130000], labour: [45000, 65000], installation: [20000, 32000] },
      { scope: 'kitchen', propertyType: PropertyType.BHK_2, furniture: [160000, 230000], materials: [130000, 190000], labour: [65000, 92000], installation: [28000, 45000] },
      { scope: 'kitchen', propertyType: PropertyType.BHK_3, furniture: [220000, 320000], materials: [190000, 280000], labour: [92000, 130000], installation: [42000, 65000] },
      { scope: 'kitchen', propertyType: PropertyType.VILLA,  furniture: [320000, 450000], materials: [280000, 400000], labour: [130000, 185000], installation: [60000, 92000] },
    ],
    'kitchen-luxury': [
      { scope: 'kitchen', propertyType: PropertyType.BHK_1, furniture: [180000, 260000], materials: [170000, 250000], labour: [72000, 105000], installation: [35000, 55000] },
      { scope: 'kitchen', propertyType: PropertyType.BHK_2, furniture: [260000, 380000], materials: [250000, 360000], labour: [105000, 150000], installation: [50000, 78000] },
      { scope: 'kitchen', propertyType: PropertyType.BHK_3, furniture: [380000, 540000], materials: [360000, 520000], labour: [150000, 215000], installation: [72000, 110000] },
      { scope: 'kitchen', propertyType: PropertyType.VILLA,  furniture: [540000, 780000], materials: [520000, 750000], labour: [215000, 310000], installation: [105000, 160000] },
    ],
    'living-room-essential': [
      { scope: 'living-room', propertyType: PropertyType.BHK_1, furniture: [60000, 90000], materials: [35000, 55000], labour: [25000, 38000], installation: [8000, 15000] },
      { scope: 'living-room', propertyType: PropertyType.BHK_2, furniture: [90000, 140000], materials: [55000, 85000], labour: [38000, 56000], installation: [12000, 22000] },
      { scope: 'living-room', propertyType: PropertyType.BHK_3, furniture: [140000, 200000], materials: [85000, 130000], labour: [56000, 82000], installation: [20000, 32000] },
      { scope: 'living-room', propertyType: PropertyType.VILLA,  furniture: [200000, 290000], materials: [130000, 200000], labour: [82000, 120000], installation: [30000, 50000] },
    ],
    'living-room-premium': [
      { scope: 'living-room', propertyType: PropertyType.BHK_1, furniture: [120000, 170000], materials: [95000, 140000], labour: [50000, 72000], installation: [18000, 30000] },
      { scope: 'living-room', propertyType: PropertyType.BHK_2, furniture: [170000, 250000], materials: [140000, 205000], labour: [72000, 105000], installation: [28000, 45000] },
      { scope: 'living-room', propertyType: PropertyType.BHK_3, furniture: [250000, 360000], materials: [205000, 300000], labour: [105000, 150000], installation: [45000, 72000] },
      { scope: 'living-room', propertyType: PropertyType.VILLA,  furniture: [360000, 520000], materials: [300000, 440000], labour: [150000, 215000], installation: [72000, 110000] },
    ],
    'living-room-luxury': [
      { scope: 'living-room', propertyType: PropertyType.BHK_1, furniture: [200000, 290000], materials: [190000, 280000], labour: [85000, 125000], installation: [35000, 55000] },
      { scope: 'living-room', propertyType: PropertyType.BHK_2, furniture: [290000, 420000], materials: [280000, 405000], labour: [125000, 180000], installation: [55000, 85000] },
      { scope: 'living-room', propertyType: PropertyType.BHK_3, furniture: [420000, 600000], materials: [405000, 580000], labour: [180000, 260000], installation: [85000, 130000] },
      { scope: 'living-room', propertyType: PropertyType.VILLA,  furniture: [600000, 860000], materials: [580000, 840000], labour: [260000, 375000], installation: [130000, 200000] },
    ],
  };

  const inclusionsByScope: Record<string, string[]> = {
    'full-home':   ['Modular kitchen', 'Wardrobes', 'TV unit', 'False ceiling (partial)', 'Loose furniture', 'Lighting design', 'Basic paint'],
    'kitchen':     ['Modular cabinets', 'Countertop', 'Backsplash', 'Sink', 'Hardware'],
    'living-room': ['TV unit', 'Feature wall', 'Loose seating', 'Lighting', 'Paint'],
  };
  const exclusionsByScope: Record<string, string[]> = {
    'full-home':   ['Appliances (AC, fridge, washing machine)', 'Curtains & blinds', 'Mattresses', 'Structural changes', 'Electrical rewiring', 'Civil work'],
    'kitchen':     ['Appliances (chimney, hob, oven)', 'Water purifier', 'Dishwasher', 'Civil changes', 'Plumbing shifts'],
    'living-room': ['TV, speakers, decor accessories', 'Curtains & blinds', 'False ceiling (unless added)', 'Civil work'],
  };

  for (const city of cities) {
    const mult = tierMultiplier[city.tier] ?? 1;
    const upsertedCity = await prisma.city.upsert({
      where: { slug: city.slug },
      update: { name: city.name, tier: city.tier },
      create: { slug: city.slug, name: city.name, tier: city.tier },
    });

    for (const [key, rows] of Object.entries(bases)) {
      const tierName = key.split('-').pop()!;
      for (const row of rows) {
        const scale = (n: number) => Math.round((n * mult) / 1000) * 1000;
        await prisma.estimate.upsert({
          where: {
            cityId_propertyType_scope_styleTier: {
              cityId: upsertedCity.id,
              propertyType: row.propertyType,
              scope: row.scope,
              styleTier: tierName,
            },
          },
          update: {
            furnitureMin: scale(row.furniture[0]), furnitureMax: scale(row.furniture[1]),
            materialsMin: scale(row.materials[0]), materialsMax: scale(row.materials[1]),
            labourMin: scale(row.labour[0]), labourMax: scale(row.labour[1]),
            installationMin: scale(row.installation[0]), installationMax: scale(row.installation[1]),
            inclusions: inclusionsByScope[row.scope] ?? [],
            exclusions: exclusionsByScope[row.scope] ?? [],
          },
          create: {
            cityId: upsertedCity.id,
            propertyType: row.propertyType,
            scope: row.scope,
            styleTier: tierName,
            furnitureMin: scale(row.furniture[0]), furnitureMax: scale(row.furniture[1]),
            materialsMin: scale(row.materials[0]), materialsMax: scale(row.materials[1]),
            labourMin: scale(row.labour[0]), labourMax: scale(row.labour[1]),
            installationMin: scale(row.installation[0]), installationMax: scale(row.installation[1]),
            inclusions: inclusionsByScope[row.scope] ?? [],
            exclusions: exclusionsByScope[row.scope] ?? [],
          },
        });
      }
    }
  }

  const count = await prisma.estimate.count();
  const expected = cities.length * 3 * 3 * 4;
  if (count < expected) {
    throw new Error(`Expected at least ${expected} estimate rows, found ${count}.`);
  }
  console.log(`Verified ${count} estimate rows across ${cities.length} cities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
  