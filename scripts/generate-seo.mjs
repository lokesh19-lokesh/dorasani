/**
 * DORASANI — Production Sitemap & LLM Discovery Generator
 *
 * Generates:
 *   - public/sitemap.xml   (XML Sitemap + Image Sitemap for https://dorasanicollections.com)
 *   - public/llms.txt      (Concise LLM / AI Search navigation index per llmstxt.org)
 *   - public/llms-full.txt (Full catalog, pricing, policies & heritage dossier for LLMs)
 *
 * Usage:
 *   npm run seo:generate
 *   npm run build   (runs seo:generate automatically before tsc & vite build)
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

const SITE_ORIGIN = 'https://dorasanicollections.com';
const TODAY = new Date().toISOString().slice(0, 10);

const DEFAULT_SETTINGS = {
  storeName: 'Dorasani Sarees',
  supportEmail: 'dorasanisarees@gmail.com',
  conciergeEmail: 'dorasanisarees@gmail.com',
  supportPhone: '+91 7780673360',
  storeAddress:
    'Plot No 7-13/1/A, Bhagyalaxmi Colony, Shapur Road, Quthbullapur (M), Medchal Dist (Landmark: Opposite Maxx Cycle Shop and beside new KFC)',
  storeCityStatePin: 'Hyderabad, Telangana - 500067',
  studioHours: 'Monday – Sunday: 10:30 AM – 9:00 PM IST',
  freeShippingThreshold: 1999,
  standardShippingFee: 99,
  expressShippingFee: 199,
  codEnabled: false,
};

const COLLECTION_ROUTES = [
  {
    path: '/collections/sarees',
    title: 'Pure Silk & Handloom Sarees',
    description:
      'Kanchipuram bridal silk sarees, Banarasi kadwa sarees, Chanderi cotton sarees, Tussar silk sarees, linen silk sarees, and organza tissue drapes.',
    image: '/assets/categories/cat_sarees_arch.jpg',
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    path: '/collections/lehengas',
    title: 'Bridal & Festive Lehengas',
    description:
      'Hand-embellished bridal silk lehengas, zardozi wedding lehenga sets, pastel organza lehengas, and royal velvet lehenga ensembles.',
    image: '/assets/categories/cat_lehengas_arch.jpg',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/collections/ethnic-wear',
    title: 'Ethnic Wear — Anarkalis, Shararas & Salwar Suits',
    description:
      'Embroidered floor-length Anarkali sets, floral organza shararas, Chanderi kurta sets, and South silk salwar suits.',
    image: '/assets/categories/cat_ethnic_wear_arch.jpg',
    changefreq: 'weekly',
    priority: '0.9',
  },
  {
    path: '/collections/kurtis',
    title: 'Handcrafted Kurthis & Tunics',
    description:
      'Temple-zari silk kurthis and handcrafted celebratory tunics with coordinated woven dupattas.',
    image: '/assets/categories/cat_kurtis_arch.jpg',
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    path: '/collections/kids-wear',
    title: 'Kids Heritage Wear & Pattu Pavadai',
    description:
      'Authentic South Indian pure Kanchipuram silk Pattu Pavadai sets and ceremonial ethnic attire for children.',
    image: '/assets/categories/cat_kids_wear_arch.jpg',
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    path: '/collections/festive',
    title: 'Festive & Temple-Wear Edit',
    description:
      'Handloom drapes and celebratory silhouettes curated for Diwali, Sankranti, Ugadi, Navratri, and family pujas.',
    image: '/assets/categories/cat_festive_arch.jpg',
    changefreq: 'weekly',
    priority: '0.85',
  },
  {
    path: '/collections/new-arrivals',
    title: 'New Arrivals — Latest Loom Editions',
    description:
      'Freshly arrived Kanjivaram, Tussar, organza, and bridal weaves straight from partner master weaving clusters.',
    image: '/assets/categories/cat_new_arrivals_arch.jpg',
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    path: '/collections/bestsellers',
    title: 'Signature Bestsellers',
    description:
      'Most-loved Kanchipuram bridal sarees, Banarasi silk drapes, bridal lehengas, and festive sets chosen by DORASANI patrons.',
    image: '/assets/categories/cat_bestsellers_arch.jpg',
    changefreq: 'weekly',
    priority: '0.9',
  },
];

const EDITORIAL_AND_POLICY_ROUTES = [
  {
    path: '/heritage',
    title: 'Mythology & Temple Heritage Craft',
    description:
      'The Dravidian temple architecture, classical arts, and master handloom clusters in Kanchipuram, Banaras, and Pochampally behind every weave.',
    image: '/assets/hero/subpageshero/heritagedesktop.png',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/about',
    title: 'About DORASANI — A Symbol of Tradition',
    description:
      'Brand philosophy, master artisan partnerships, and luxury handloom curation from our Shapur Road, Quthbullapur (Medchal Dist), Hyderabad studio.',
    image: '/assets/banners/about_heritage_showcase.jpg',
    changefreq: 'monthly',
    priority: '0.8',
  },
  {
    path: '/faq',
    title: 'Frequently Asked Questions',
    description:
      'Answers on Silk Mark authenticity, saree lengths, blouse pieces, shipping timelines, Razorpay online payments, and returns.',
    changefreq: 'monthly',
    priority: '0.75',
  },
  {
    path: '/contact',
    title: 'Contact & Bridal Concierge',
    description:
      'Reach DORASANI bridal styling and customer care at Shapur Road, Quthbullapur (Medchal Dist), Hyderabad - 500067 for orders, custom bridal consultations, and support.',
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    path: '/shipping-policy',
    title: 'Shipping & Delivery Policy',
    description:
      'Pan-India insured dispatch timelines (1-2 business day handling, 3-5 day standard delivery), free shipping threshold, and express shipping.',
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    path: '/returns-policy',
    title: 'Returns & Exchange Policy',
    description:
      '7-day return & exchange policy for unworn handloom garments with original tags and Silk Mark certifications intact.',
    changefreq: 'monthly',
    priority: '0.6',
  },
  {
    path: '/privacy-policy',
    title: 'Privacy Policy',
    description:
      'How DORASANI collects, secures, and processes customer data in compliance with Indian data protection practices.',
    changefreq: 'yearly',
    priority: '0.4',
  },
  {
    path: '/terms',
    title: 'Terms & Conditions',
    description:
      'Terms of service, pricing in INR, handloom weave characteristics, and order fulfillment guidelines.',
    changefreq: 'yearly',
    priority: '0.4',
  },
];

// Fallback catalog snapshot used only when Supabase network access is unavailable offline
const FALLBACK_PRODUCTS = [
  {
    title: 'Kanjivaram Silk Saree',
    slug: 'kanjivaram-silk-saree',
    sku: 'DOR-SAR-KANJIVAR',
    price_inr: 3499,
    mrp_inr: 4999,
    fabric: 'Silk',
    weaving_style: 'Traditional Zari Weaving',
    occasion: 'Wedding',
    saree_length: '6.3 meters (including blouse)',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'A timeless Kanjivaram silk saree crafted with intricate zari work and rich traditional motifs for weddings and celebrations.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/kanjivaram_silk_saree.jpg', is_primary: true }],
  },
  {
    title: 'Kanchipuram Bridal Saree',
    slug: 'kanchipuram-bridal-saree',
    sku: 'DOR-SAR-KANCHIPU',
    price_inr: 5999,
    mrp_inr: 7999,
    fabric: 'Silk',
    weaving_style: 'Kanchipuram Korvai Weave',
    occasion: 'Wedding',
    saree_length: '6.3 meters',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: true,
    is_festive: false,
    in_stock: true,
    short_description:
      'Pure Mulberry silk saree handwoven with heavy gold zari pallu, peacock and chakra emblems designed for wedding royalty.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/kanchipuram_bridal_saree.jpg', is_primary: true }],
  },
  {
    title: 'Banarasi Silk Saree',
    slug: 'banarasi-silk-saree',
    sku: 'DOR-SAR-BANARASI',
    price_inr: 2999,
    mrp_inr: 2999,
    fabric: 'Silk',
    weaving_style: 'Banarasi Kadwa Weave',
    occasion: 'Wedding',
    saree_length: '6.3 meters',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'Opulent Banarasi silk saree adorned with floral jaal in gold and silver zari for auspicious beginnings.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/banarasi_silk_saree.jpg', is_primary: true }],
  },
  {
    title: 'Tussar Silk Saree',
    slug: 'tussar-silk-saree',
    sku: 'DOR-SAR-TUSSAR-S',
    price_inr: 2699,
    mrp_inr: 2999,
    fabric: 'Silk',
    weaving_style: 'Tussar Weave',
    occasion: 'Party Wear',
    saree_length: '6.3 meters',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'Rich textured Tussar silk in radiant tones, detailed with traditional temple borders and tribal foliage motifs.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/tussar_silk_saree.jpg', is_primary: true }],
  },
  {
    title: 'Organza Tissue Saree',
    slug: 'organza-tissue-saree',
    sku: 'DOR-SAR-ORGANZA-',
    price_inr: 2499,
    mrp_inr: 3499,
    fabric: 'Organza',
    weaving_style: 'Tissue Zari Weave',
    occasion: 'Party Wear',
    saree_length: '6.3 meters',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'Contemporary shimmer organza tissue saree with gold scalloped borders balancing modern lightness and royal craft.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/organza_tissue_saree.jpg', is_primary: true }],
  },
  {
    title: 'Linen Silk Saree',
    slug: 'linen-silk-saree',
    sku: 'DOR-SAR-LINEN-SI',
    price_inr: 1999,
    mrp_inr: 2799,
    fabric: 'Cotton',
    weaving_style: 'Linen Silk Blend',
    occasion: 'Daily Wear',
    saree_length: '6.3 meters',
    blouse_included: true,
    care_instructions: 'Gentle Hand Wash or Dry Clean',
    is_new: true,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'Naturally textured organic linen blended with fine mulberry silk for breathable daytime elegance.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/linen_silk_saree.jpg', is_primary: true }],
  },
  {
    title: 'Organza Floral Saree',
    slug: 'organza-floral-saree',
    sku: 'DOR-SAR-ORGANZA-',
    price_inr: 1799,
    mrp_inr: 2999,
    fabric: 'Organza',
    weaving_style: 'Zari Border Woven',
    occasion: 'Festive',
    saree_length: '6.3 meters (including blouse)',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: false,
    is_festive: true,
    in_stock: true,
    short_description:
      'Delicate organza saree woven with floral artistry and a subtle golden zari border.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/organza_floral_saree.jpg', is_primary: true }],
  },
  {
    title: 'Chanderi Cotton Saree',
    slug: 'chanderi-cotton-saree',
    sku: 'DOR-SAR-CHANDERI',
    price_inr: 1499,
    mrp_inr: 1999,
    fabric: 'Cotton',
    weaving_style: 'Handloom Weave',
    occasion: 'Daily Wear',
    saree_length: '6.3 meters',
    blouse_included: true,
    care_instructions: 'Hand Wash Gently or Dry Clean',
    is_new: false,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'Lightweight Chanderi cotton saree with tissue pallu and micro-buttas for daytime festivities.',
    categories: { name: 'Sarees', slug: 'sarees' },
    product_media: [{ url: '/assets/products/prod_chanderi_cotton_photo.jpg', is_primary: true }],
  },
  {
    title: 'Bridal Silk Lehenga',
    slug: 'bridal-silk-lehenga',
    sku: 'DOR-LEH-BRIDAL-S',
    price_inr: 24999,
    mrp_inr: 32999,
    fabric: 'Silk',
    weaving_style: 'Traditional Handloom',
    occasion: 'Wedding',
    saree_length: 'Full Bridal Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: true,
    is_festive: false,
    in_stock: true,
    short_description:
      'Heavily embellished bridal silk lehenga featuring antique zardozi work, raw silk flare, and matching dupatta.',
    categories: { name: 'Lehengas', slug: 'lehengas' },
    product_media: [{ url: '/assets/products/bridal_silk_lehenga.jpg', is_primary: true }],
  },
  {
    title: 'Velvet Lehenga Set',
    slug: 'velvet-lehenga-set',
    sku: 'DOR-LEH-VELVET-L',
    price_inr: 19999,
    mrp_inr: 27999,
    fabric: 'Velvet',
    weaving_style: 'Traditional Handloom',
    occasion: 'Wedding',
    saree_length: 'Full Bridal Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: true,
    is_festive: false,
    in_stock: true,
    short_description:
      'Plush micro-velvet lehenga set crafted with royal heritage motifs, crystal detailing, and double dupatta styling.',
    categories: { name: 'Lehengas', slug: 'lehengas' },
    product_media: [{ url: '/assets/products/velvet_lehenga_set.jpg', is_primary: true }],
  },
  {
    title: 'Wedding Lehenga Set',
    slug: 'wedding-lehenga-set',
    sku: 'DOR-LEH-WEDDING-',
    price_inr: 18999,
    mrp_inr: 25999,
    fabric: 'Silk',
    weaving_style: 'Traditional Handloom',
    occasion: 'Wedding',
    saree_length: 'Full Bridal Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: true,
    is_festive: false,
    in_stock: true,
    short_description:
      'Spectacular wedding ensemble with flared silhouette, sweetheart neckline choli, and scalloped dupatta.',
    categories: { name: 'Lehengas', slug: 'lehengas' },
    product_media: [{ url: '/assets/products/wedding_lehenga_set.jpg', is_primary: true }],
  },
  {
    title: 'Designer Lehenga',
    slug: 'designer-lehenga',
    sku: 'DOR-LEH-DESIGNER',
    price_inr: 15999,
    mrp_inr: 22999,
    fabric: 'Silk',
    weaving_style: 'Traditional Handloom',
    occasion: 'Festive',
    saree_length: 'Full Lehenga Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: true,
    is_festive: true,
    in_stock: true,
    short_description:
      'Golden mustard designer lehenga featuring intricate resham embroidery, sequin highlights, and flared kali cut.',
    categories: { name: 'Lehengas', slug: 'lehengas' },
    product_media: [{ url: '/assets/products/designer_lehenga.jpg', is_primary: true }],
  },
  {
    title: 'Pastel Organza Lehenga',
    slug: 'pastel-organza-lehenga',
    sku: 'DOR-LEH-PASTEL-O',
    price_inr: 12499,
    mrp_inr: 17999,
    fabric: 'Organza',
    weaving_style: 'Traditional Handloom',
    occasion: 'Party Wear',
    saree_length: 'Full Lehenga Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'Pastel organza lehenga with silver threadwork, modern silhouette, and airy volume for evening receptions.',
    categories: { name: 'Lehengas', slug: 'lehengas' },
    product_media: [{ url: '/assets/products/pastel_organza_lehenga.jpg', is_primary: true }],
  },
  {
    title: 'Organza Sharara Set',
    slug: 'organza-sharara-set',
    sku: 'DOR-ETH-ORGANZA-',
    price_inr: 3499,
    mrp_inr: 4999,
    fabric: 'Organza',
    weaving_style: 'Traditional Handloom',
    occasion: 'Festive',
    saree_length: 'Ready-to-wear Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: true,
    is_festive: true,
    in_stock: true,
    short_description:
      'Delicate floral organza peplum kurta with multi-tiered sharara pants and scallop lace dupatta.',
    categories: { name: 'Ethnic Wear', slug: 'ethnic-wear' },
    product_media: [{ url: '/assets/products/organza_sharara_set.jpg', is_primary: true }],
  },
  {
    title: 'Embroidered Anarkali Set',
    slug: 'embroidered-anarkali-set',
    sku: 'DOR-ETH-EMBROIDE',
    price_inr: 2499,
    mrp_inr: 3999,
    fabric: 'Georgette',
    weaving_style: 'Traditional Handloom',
    occasion: 'Festive',
    saree_length: 'Ready-to-wear Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: true,
    is_festive: true,
    in_stock: true,
    short_description:
      'Floor-length flared anarkali suit in deep rani pink with ornate neckline embroidery, churidar, and organza dupatta.',
    categories: { name: 'Ethnic Wear', slug: 'ethnic-wear' },
    product_media: [{ url: '/assets/products/embroidered_anarkali.jpg', is_primary: true }],
  },
  {
    title: 'Silk Salwar Suit Set',
    slug: 'silk-salwar-suit-set',
    sku: 'DOR-ETH-SILK-SAL',
    price_inr: 2199,
    mrp_inr: 2999,
    fabric: 'Silk',
    weaving_style: 'Traditional Handloom',
    occasion: 'Festive',
    saree_length: 'Ready-to-wear Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: false,
    is_bestseller: false,
    is_festive: true,
    in_stock: true,
    short_description:
      'Traditional South silk straight cut suit featuring gold thread embroidery and rich contrast dupatta.',
    categories: { name: 'Ethnic Wear', slug: 'ethnic-wear' },
    product_media: [{ url: '/assets/products/silk_salwar_suit.jpg', is_primary: true }],
  },
  {
    title: 'Chanderi Kurti Set',
    slug: 'chanderi-kurti-set',
    sku: 'DOR-ETH-CHANDERI',
    price_inr: 1799,
    mrp_inr: 2499,
    fabric: 'Silk',
    weaving_style: 'Traditional Handloom',
    occasion: 'Daily Wear',
    saree_length: 'Ready-to-wear Set',
    blouse_included: true,
    care_instructions: 'Gentle Hand Wash',
    is_new: false,
    is_bestseller: false,
    is_festive: false,
    in_stock: true,
    short_description:
      'Rich emerald green Chanderi silk kurti paired with matching tapered trousers and a woven zari dupatta.',
    categories: { name: 'Ethnic Wear', slug: 'ethnic-wear' },
    product_media: [{ url: '/assets/products/chanderi_kurti_set.jpg', is_primary: true }],
  },
  {
    title: 'Embroidered Royal Silk Kurti',
    slug: 'embroidered-royal-silk-kurti',
    sku: 'DOR-KUR-EMBROIDE',
    price_inr: 2499,
    mrp_inr: 3499,
    fabric: 'Pure Silk',
    weaving_style: 'Traditional Handloom',
    occasion: 'Festive',
    saree_length: 'Kurti & Dupatta Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: true,
    is_festive: true,
    in_stock: true,
    short_description:
      'Regal royal blue silk kurti set featuring golden temple zari embroidery across neckline and hem with woven dupatta.',
    categories: { name: 'Kurthis', slug: 'kurtis' },
    product_media: [{ url: '/assets/categories/cat_kurtis_arch.jpg', is_primary: true }],
  },
  {
    title: 'Traditional Silk Pattu Pavadai',
    slug: 'traditional-kids-pattu-pavadai',
    sku: 'DOR-KID-TRADITIO',
    price_inr: 1899,
    mrp_inr: 2799,
    fabric: 'Kanchipuram Silk',
    weaving_style: 'Traditional Handloom',
    occasion: 'Festive & Ceremonial',
    saree_length: 'Kids 2-Piece Set',
    blouse_included: true,
    care_instructions: 'Dry Clean Only',
    is_new: true,
    is_bestseller: true,
    is_festive: false,
    in_stock: true,
    short_description:
      'Authentic South Indian pure silk Pattu Pavadai set for young girls with zari borders and temple buttas.',
    categories: { name: 'Kids Wear', slug: 'kids-wear' },
    product_media: [{ url: '/assets/categories/cat_kids_wear_arch.jpg', is_primary: true }],
  },
];

function loadEnvVars() {
  const envMap = { ...process.env };
  for (const envFile of ['.env', '.env.local']) {
    const filePath = path.join(ROOT_DIR, envFile);
    if (!fs.existsSync(filePath)) continue;
    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) continue;
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (!(key in envMap) || envFile === '.env.local') {
        envMap[key] = val;
      }
    }
  }
  return envMap;
}

function escapeXml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toAbsoluteUrl(urlOrPath) {
  if (!urlOrPath) return '';
  const clean = String(urlOrPath).trim();
  if (!clean) return '';
  if (/^https?:\/\//i.test(clean)) return clean;
  const rel = clean.startsWith('/') ? clean : `/${clean}`;
  return `${SITE_ORIGIN}${encodeURI(rel)}`;
}

function toDateOnly(isoString) {
  if (!isoString) return TODAY;
  const match = String(isoString).match(/^\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : TODAY;
}

function parseSettings(rows) {
  if (!Array.isArray(rows) || rows.length === 0) return { ...DEFAULT_SETTINGS };
  const map = new Map(rows.map((r) => [r.key, r.value]));
  const str = (key, fallback, allowEmpty = false) => {
    if (!map.has(key)) return fallback;
    const v = map.get(key);
    if (v === null || v === undefined) return fallback;
    const parsed = String(v).trim();
    if (!allowEmpty && !parsed) return fallback;
    return parsed;
  };
  const num = (key, fallback) => {
    if (!map.has(key)) return fallback;
    const n = Number(map.get(key));
    return Number.isFinite(n) && n >= 0 ? Math.round(n) : fallback;
  };
  const bool = (key, fallback) => {
    if (!map.has(key)) return fallback;
    const raw = map.get(key);
    if (typeof raw === 'boolean') return raw;
    if (raw === null || raw === undefined) return fallback;
    const norm = String(raw).trim().toLowerCase();
    if (norm === 'true') return true;
    if (norm === 'false') return false;
    return fallback;
  };
  return {
    storeName: str('store_name', DEFAULT_SETTINGS.storeName),
    supportEmail: str('support_email', DEFAULT_SETTINGS.supportEmail),
    conciergeEmail: str('concierge_email', DEFAULT_SETTINGS.conciergeEmail),
    supportPhone: str('support_phone', DEFAULT_SETTINGS.supportPhone, true),
    storeAddress: str('store_address', DEFAULT_SETTINGS.storeAddress),
    storeCityStatePin: str('store_city_state_pin', DEFAULT_SETTINGS.storeCityStatePin),
    studioHours: str('studio_hours', DEFAULT_SETTINGS.studioHours),
    freeShippingThreshold: num('free_shipping_threshold', DEFAULT_SETTINGS.freeShippingThreshold),
    standardShippingFee: num('standard_shipping_fee', DEFAULT_SETTINGS.standardShippingFee),
    expressShippingFee: num('express_shipping_fee', DEFAULT_SETTINGS.expressShippingFee),
    codEnabled: bool('cod_enabled', DEFAULT_SETTINGS.codEnabled),
  };
}

async function fetchSupabaseJson(baseUrl, apiKey, resourcePath) {
  const endpoint = `${baseUrl.replace(/\/+$/, '')}/rest/v1/${resourcePath}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(endpoint, {
      headers: {
        apikey: apiKey,
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function loadLiveCatalog() {
  const env = loadEnvVars();
  const supabaseUrl = env.VITE_SUPABASE_URL || '';
  const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes('your-project-ref') ||
    supabaseKey.includes('your-supabase-anon-key')
  ) {
    return {
      isLive: false,
      source: 'fallback (Supabase env not configured)',
      products: FALLBACK_PRODUCTS,
      categories: [],
      settings: { ...DEFAULT_SETTINGS },
      benefits: [],
    };
  }

  try {
    const [products, categories, settingsRows, benefits] = await Promise.all([
      fetchSupabaseJson(
        supabaseUrl,
        supabaseKey,
        'products?select=id,title,slug,sku,price_inr,mrp_inr,fabric,weaving_style,occasion,saree_length,blouse_included,care_instructions,is_new,is_bestseller,is_festive,in_stock,stock_quantity,rating,reviews_count,updated_at,short_description,description,categories(name,slug),product_media(url,is_primary,display_order)&status=eq.active&order=created_at.desc'
      ),
      fetchSupabaseJson(
        supabaseUrl,
        supabaseKey,
        'categories?select=name,slug,image_url,display_order&is_active=eq.true&order=display_order.asc'
      ),
      fetchSupabaseJson(supabaseUrl, supabaseKey, 'site_settings?select=key,value'),
      fetchSupabaseJson(
        supabaseUrl,
        supabaseKey,
        'service_benefits?select=title,description,display_order&is_active=eq.true&order=display_order.asc'
      ),
    ]);

    return {
      isLive: true,
      source: `live Supabase (${Array.isArray(products) ? products.length : 0} products)`,
      products: Array.isArray(products) && products.length > 0 ? products : FALLBACK_PRODUCTS,
      categories: Array.isArray(categories) ? categories : [],
      settings: parseSettings(settingsRows),
      benefits: Array.isArray(benefits) ? benefits : [],
    };
  } catch (err) {
    return {
      isLive: false,
      source: `offline fallback (${err instanceof Error ? err.message : 'network unavailable'})`,
      products: FALLBACK_PRODUCTS,
      categories: [],
      settings: { ...DEFAULT_SETTINGS },
      benefits: [],
    };
  }
}

function getOrderedProductMedia(product) {
  const media = Array.isArray(product.product_media) ? [...product.product_media] : [];
  media.sort((a, b) => {
    if (Boolean(a.is_primary) !== Boolean(b.is_primary)) return a.is_primary ? -1 : 1;
    return (a.display_order ?? 99) - (b.display_order ?? 99);
  });
  const seen = new Set();
  const urls = [];
  for (const item of media) {
    const abs = toAbsoluteUrl(item?.url);
    if (abs && !seen.has(abs)) {
      seen.add(abs);
      urls.push(abs);
    }
  }
  return urls;
}

function buildSitemapXml(products) {
  const urls = [];

  // 1. Homepage
  urls.push({
    loc: `${SITE_ORIGIN}/`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '1.0',
    images: [
      {
        loc: `${SITE_ORIGIN}/assets/hero/desktop/h1.png`,
        title: 'DORASANI — Bridal Kanjivaram Silk Sarees & South Indian Handlooms',
      },
      {
        loc: `${SITE_ORIGIN}/assets/products/kanjivaram_silk_saree.jpg`,
        title: 'DORASANI Kanchipuram Pure Silk Saree',
      },
    ],
  });

  // 2. Shop All Catalog
  urls.push({
    loc: `${SITE_ORIGIN}/shop`,
    lastmod: TODAY,
    changefreq: 'daily',
    priority: '0.95',
    images: [
      {
        loc: `${SITE_ORIGIN}/assets/hero/subpageshero/ShopAllhero.png`,
        title: 'Shop All DORASANI Handloom Collections',
      },
    ],
  });

  // 3. Canonical Collection Routes
  for (const col of COLLECTION_ROUTES) {
    urls.push({
      loc: `${SITE_ORIGIN}${col.path}`,
      lastmod: TODAY,
      changefreq: col.changefreq,
      priority: col.priority,
      images: col.image ? [{ loc: toAbsoluteUrl(col.image), title: `${col.title} | DORASANI` }] : [],
    });
  }

  // 4. Editorial & Policy Pages
  for (const page of EDITORIAL_AND_POLICY_ROUTES) {
    urls.push({
      loc: `${SITE_ORIGIN}${page.path}`,
      lastmod: TODAY,
      changefreq: page.changefreq,
      priority: page.priority,
      images: page.image ? [{ loc: toAbsoluteUrl(page.image), title: `${page.title} | DORASANI` }] : [],
    });
  }

  // 5. Active Product Detail Pages (/products/:slug)
  const seenSlugs = new Set();
  for (const p of products) {
    if (!p?.slug || seenSlugs.has(p.slug)) continue;
    seenSlugs.add(p.slug);
    const images = getOrderedProductMedia(p).slice(0, 5).map((imgUrl, idx) => ({
      loc: imgUrl,
      title: idx === 0 ? p.title : `${p.title} — View ${idx + 1}`,
    }));

    urls.push({
      loc: `${SITE_ORIGIN}/products/${encodeURIComponent(p.slug)}`,
      lastmod: toDateOnly(p.updated_at),
      changefreq: 'weekly',
      priority: p.is_bestseller || p.is_new ? '0.85' : '0.8',
      images,
    });
  }

  const entryXml = urls
    .map((entry) => {
      const imgsXml = (entry.images || [])
        .map(
          (img) =>
            `    <image:image>\n      <image:loc>${escapeXml(img.loc)}</image:loc>\n      <image:title>${escapeXml(img.title)}</image:title>\n    </image:image>`
        )
        .join('\n');

      return [
        '  <url>',
        `    <loc>${escapeXml(entry.loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
        `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        `    <priority>${escapeXml(entry.priority)}</priority>`,
        imgsXml,
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n');
    })
    .join('\n');

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    entryXml,
    '</urlset>',
    '',
  ].join('\n');
}

function buildLlmsTxt(products, settings) {
  const featured = products.slice(0, 12);
  const lines = [
    '# DORASANI',
    '',
    `> DORASANI ("Where Heritage Meets Divine Elegance") is a luxury South Indian handloom boutique located at Shapur Road, Quthbullapur (Medchal Dist), Hyderabad - 500067, Telangana, India (${SITE_ORIGIN}). The store offers pure silk and cotton sarees, bridal & festive lehengas, embroidered Anarkali and sharara sets, handcrafted kurthis, and children's Pattu Pavadai garments shipped pan-India.`,
    '',
    '## Studio & Storefront Facts',
    `- Canonical Domain: ${SITE_ORIGIN}/`,
    `- Storefront Studio: ${settings.storeAddress}, ${settings.storeCityStatePin}`,
    `- Studio Hours: ${settings.studioHours}`,
    `- Support & Bridal Concierge Email: ${settings.supportEmail}`,
    ...(settings.supportPhone ? [`- Customer Care Phone: ${settings.supportPhone}`] : []),
    `- Currency & Shipping: Indian Rupees (INR). Free pan-India shipping above ₹${settings.freeShippingThreshold.toLocaleString('en-IN')}; Standard shipping ₹${settings.standardShippingFee}; Express shipping ₹${settings.expressShippingFee}.`,
    settings.codEnabled
      ? '- Payment Methods: Razorpay Checkout (UPI, Credit/Debit Cards, Net Banking, Wallets) and Cash on Delivery (COD) for eligible orders.'
      : '- Payment Methods: Razorpay Checkout (UPI, Credit/Debit Cards, Net Banking, Wallets). Cash on Delivery (COD) is currently unavailable.',
    '- Returns & Exchanges: 7-day return window for unworn items with original tags intact.',
    '',
    '## Collections',
    ...COLLECTION_ROUTES.map(
      (c) => `- [${c.title}](${SITE_ORIGIN}${c.path}): ${c.description}`
    ),
    `- [Complete Handloom Catalog](${SITE_ORIGIN}/shop): Browse all ${products.length} curated weaves with filters by category, fabric, occasion, and price.`,
    '',
    '## Brand, Craft & Policies',
    ...EDITORIAL_AND_POLICY_ROUTES.map(
      (p) => `- [${p.title}](${SITE_ORIGIN}${p.path}): ${p.description}`
    ),
    '',
    '## Featured Handloom Products',
    ...featured.map((p) => {
      const price = Number(p.price_inr || 0).toLocaleString('en-IN');
      const cat = p.categories?.name || 'Handloom';
      const fabric = p.fabric ? `, ${p.fabric}` : '';
      return `- [${p.title}](${SITE_ORIGIN}/products/${p.slug}): ₹${price} INR — ${cat}${fabric}${p.occasion ? ` (${p.occasion})` : ''}`;
    }),
    '',
    '## Optional',
    `- [Full Catalog & Specification Dossier for LLMs](${SITE_ORIGIN}/llms-full.txt): Complete product table, SKUs, fabrics, weaving styles, lengths, blouse details, and AEO Q&As.`,
    `- [XML Sitemap](${SITE_ORIGIN}/sitemap.xml): Machine-readable index of all canonical storefront and product URLs.`,
    '',
  ];

  return lines.join('\n');
}

function buildLlmsFullTxt(products, settings, benefits) {
  const tableRows = products.map((p) => {
    const price = `₹${Number(p.price_inr || 0).toLocaleString('en-IN')}`;
    const mrp = p.mrp_inr && Number(p.mrp_inr) > Number(p.price_inr || 0)
      ? `₹${Number(p.mrp_inr).toLocaleString('en-IN')}`
      : price;
    const cat = p.categories?.name || 'Ethnic Wear';
    const fabric = p.fabric || 'Handloom';
    const weave = p.weaving_style || 'Traditional Weave';
    const occasion = p.occasion || 'Festive & Wedding';
    const status = p.in_stock === false ? 'Out of Stock' : 'In Stock';
    return `| ${p.title} | ${cat} | ${price} | ${mrp} | ${fabric} | ${weave} | ${occasion} | ${status} | ${SITE_ORIGIN}/products/${p.slug} |`;
  });

  const productDetails = products.map((p, index) => {
    const price = `₹${Number(p.price_inr || 0).toLocaleString('en-IN')}`;
    const mrp = p.mrp_inr ? `₹${Number(p.mrp_inr).toLocaleString('en-IN')}` : price;
    const cat = p.categories?.name || 'Ethnic Wear';
    const catSlug = p.categories?.slug || '';
    const desc = (p.short_description || p.description || '').replace(/\s+/g, ' ').trim();
    const isSaree = catSlug === 'sarees' || /saree/i.test(p.title || '');
    const showLength =
      Boolean(p.saree_length) && (isSaree || !/6\.3\s*m/i.test(String(p.saree_length)));
    const lines = [
      `### ${index + 1}. ${p.title}`,
      `- URL: ${SITE_ORIGIN}/products/${p.slug}`,
      `- Category: ${cat}`,
      `- Price (INR): ${price} (MRP: ${mrp})`,
      ...(p.sku ? [`- SKU: ${p.sku}`] : []),
      `- Fabric / Material: ${p.fabric || 'Handloom Textile'}`,
      `- Craft / Weaving Style: ${p.weaving_style || 'Traditional Handloom'}`,
      `- Recommended Occasion: ${p.occasion || 'Festive & Wedding'}`,
      ...(showLength ? [`- Drape Length: ${p.saree_length}`] : []),
      ...(isSaree
        ? [
          `- Blouse Piece Included: ${p.blouse_included ? 'Yes (Unstitched matching piece)' : 'Styled separately'
          }`,
        ]
        : []),
      ...(p.care_instructions ? [`- Care Instructions: ${p.care_instructions}`] : []),
      `- Availability: ${p.in_stock === false ? 'Currently Out of Stock' : 'In Stock'}`,
      ...(desc ? [`- Summary: ${desc}`] : []),
    ];
    return lines.join('\n');
  });

  const lines = [
    '# DORASANI — Complete Catalog, Heritage & Storefront Dossier',
    '',
    `> Canonical Domain: ${SITE_ORIGIN}/`,
    `> Last Synchronized: ${TODAY}`,
    '',
    '## 1. Brand Identity & Regional Presence (GEO)',
    '- Brand Name: DORASANI ("A Symbol of Tradition" / "Where Heritage Meets Divine Elegance")',
    `- Flagship Location: ${settings.storeAddress}, ${settings.storeCityStatePin}, India`,
    `- Geographic Coordinates: 17.5112° N, 78.4480° E (Quthbullapur / Shapur Nagar, Hyderabad, Telangana, IN-TG)`,
    `- Operating Hours: ${settings.studioHours}`,
    `- Customer Care & Bridal Concierge Email: ${settings.supportEmail}`,
    ...(settings.supportPhone ? [`- Telephone: ${settings.supportPhone}`] : []),
    '- Primary Weaving Inspirations: Kanchipuram (Korvai pure mulberry silk & temple borders), Banaras (Kadwa brocade & floral jaal), Chanderi (handloom cotton & tissue pallu), Bhagalpur/Tussar, and Pochampally craftsmanship.',
    '',
    '## 2. Shipping, Payments & Return Guarantees',
    `- Free Shipping Threshold: Orders above ₹${settings.freeShippingThreshold.toLocaleString('en-IN')} ship free across India.`,
    `- Standard Pan-India Shipping: ₹${settings.standardShippingFee} (below threshold). Handling time: 1–2 business days; estimated transit: 3–5 business days.`,
    `- Express Pan-India Shipping: ₹${settings.expressShippingFee} priority insured courier.`,
    settings.codEnabled
      ? '- Payment Options: Razorpay Checkout supporting UPI, Visa/Mastercard/RuPay cards, Net Banking, Digital Wallets, plus Cash on Delivery (COD) for eligible orders.'
      : '- Payment Options: Razorpay Checkout supporting UPI, Visa/Mastercard/RuPay cards, Net Banking, and Digital Wallets (Cash on Delivery is not available at present).',
    '- Return & Exchange Policy: 7-day return & exchange window on unworn, unwashed garments with original tags and packaging intact.',
    '',
    ...(benefits.length > 0
      ? [
        '## 3. Storefront Service Commitments',
        ...benefits.map((b) => `- **${b.title}**: ${b.description}`),
        '',
      ]
      : []),
    `## ${benefits.length > 0 ? '4' : '3'}. Canonical Collections Directory`,
    `- **Shop All**: ${SITE_ORIGIN}/shop`,
    ...COLLECTION_ROUTES.map(
      (c) => `- **${c.title}**: ${SITE_ORIGIN}${c.path} — ${c.description}`
    ),
    '',
    `## ${benefits.length > 0 ? '5' : '4'}. Full Product Catalog Summary (${products.length} Active Items)`,
    '',
    '| Product | Category | Price | MRP | Fabric | Craft / Weave | Occasion | Status | URL |',
    '| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |',
    ...tableRows,
    '',
    `## ${benefits.length > 0 ? '6' : '5'}. Detailed Product Specifications`,
    '',
    ...productDetails.flatMap((block) => [block, '']),
    `## ${benefits.length > 0 ? '7' : '6'}. Answer Engine Optimization (AEO) — Key Buyer Questions`,
    '',
    '### Q: Does DORASANI ship pure Kanchipuram and Banarasi sarees outside Hyderabad?',
    `Yes. While our boutique is located on Shapur Road, Quthbullapur (Medchal Dist), Hyderabad - 500067 (Telangana), DORASANI ships pan-India within 1–2 business days of order confirmation, with free shipping on orders above ₹${settings.freeShippingThreshold.toLocaleString('en-IN')}.`,
    '',
    '### Q: Are blouse pieces included with DORASANI sarees?',
    'All DORASANI silk, organza, Chanderi cotton, and Tussar silk sarees measure approximately 6.3 meters and include an unstitched coordinating blouse piece (typically 0.8–1 meter) unless explicitly noted on the product specification.',
    '',
    '### Q: Which payment methods are accepted on dorasanicollections.com?',
    settings.codEnabled
      ? 'Customers can pay online via Razorpay (UPI, Credit Cards, Debit Cards, Net Banking, and Wallets) or opt for Cash on Delivery (COD) at checkout where eligible.'
      : 'Customers can pay online via Razorpay (UPI, Credit Cards, Debit Cards, Net Banking, and Wallets). Cash on Delivery (COD) is not available at present.',
    '',
    '### Q: How should handwoven silk sarees and bridal lehengas be cared for?',
    'Pure Kanchipuram, Banarasi, Tussar, organza, and zardozi-embellished bridal garments require Dry Clean Only and should be wrapped in breathable pure cotton muslin away from direct sunlight. Lightweight Chanderi cotton sarees may be gently hand-washed or dry-cleaned.',
    '',
  ];

  return lines.join('\n');
}

async function main() {
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  const targetFiles = ['sitemap.xml', 'llms.txt', 'llms-full.txt'].map((name) =>
    path.join(PUBLIC_DIR, name)
  );
  const allExist = targetFiles.every((file) => fs.existsSync(file));
  const forceFallback = process.argv.includes('--force-fallback');

  const { isLive, source, products, settings, benefits } = await loadLiveCatalog();

  if (!isLive && allExist && !forceFallback) {
    console.log(
      `[seo:generate] Source: ${source}. Existing public/sitemap.xml, llms.txt & llms-full.txt preserved.`
    );
    return;
  }

  const sitemapXml = buildSitemapXml(products);
  const llmsTxt = buildLlmsTxt(products, settings);
  const llmsFullTxt = buildLlmsFullTxt(products, settings, benefits);

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms.txt'), llmsTxt, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_DIR, 'llms-full.txt'), llmsFullTxt, 'utf8');

  const totalUrls = 2 + COLLECTION_ROUTES.length + EDITORIAL_AND_POLICY_ROUTES.length + products.length;
  console.log(
    `[seo:generate] Source: ${source}\n` +
    `[seo:generate] Wrote public/sitemap.xml (${totalUrls} canonical URLs), public/llms.txt, and public/llms-full.txt`
  );
}

main().catch((err) => {
  console.error('[seo:generate] Fatal error:', err);
  process.exit(1);
});
