import type { Product, ProductReview, SiteSettings } from '../types';
import { getProductTypeLabel } from '../types';

export const SITE_ORIGIN = 'https://dorasanicollections.com';
export const SITE_NAME = 'DORASANI';
export const SITE_LEGAL_NAME = 'DORASANI Heritage Handlooms';
export const SITE_TAGLINE = 'Where Heritage Meets Divine Elegance';
export const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/assets/products/kanjivaram_silk_saree.jpg`;
export const DEFAULT_OG_IMAGE_ALT =
  'DORASANI Kanchipuram pure silk saree with intricate gold zari weave';

const GENERIC_SOCIAL_ROOTS = new Set([
  'https://instagram.com',
  'https://www.instagram.com',
  'https://facebook.com',
  'https://www.facebook.com',
  'https://youtube.com',
  'https://www.youtube.com',
]);

export function toAbsoluteUrl(pathOrUrl?: string | null): string {
  if (!pathOrUrl) return SITE_ORIGIN;
  const trimmed = pathOrUrl.trim();
  if (!trimmed) return SITE_ORIGIN;
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  const normalizedPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `${SITE_ORIGIN}${normalizedPath}`;
}

export function buildCanonicalUrl(path: string): string {
  if (!path || path === '/') {
    return `${SITE_ORIGIN}/`;
  }
  const clean = path.split('?')[0].split('#')[0].replace(/\/+$/, '');
  return `${SITE_ORIGIN}${clean.startsWith('/') ? clean : `/${clean}`}`;
}

function getConfiguredSocialProfiles(settings: SiteSettings): string[] {
  return [settings.instagramUrl, settings.facebookUrl, settings.youtubeUrl]
    .map((url) => (url || '').trim())
    .filter((url) => {
      if (!url || !/^https?:\/\//i.test(url)) return false;
      const normalized = url.replace(/\/+$/, '').toLowerCase();
      return !GENERIC_SOCIAL_ROOTS.has(normalized);
    });
}

function parseCityState(cityStatePin: string): {
  addressLocality: string;
  addressRegion: string;
  postalCode?: string;
} {
  const parts = (cityStatePin || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const pinMatch = (cityStatePin || '').match(/\b\d{6}\b/);
  return {
    addressLocality: parts[0] || 'Hyderabad',
    addressRegion: (parts[1] || 'Telangana').replace(/\b\d{6}\b/, '').replace(/-/g, '').trim() || 'Telangana',
    ...(pinMatch ? { postalCode: pinMatch[0] } : {}),
  };
}

export function buildBaseStoreGraph(settings: SiteSettings): Record<string, unknown> {
  const socialLinks = getConfiguredSocialProfiles(settings);
  const { addressLocality, addressRegion, postalCode } = parseCityState(
    settings.storeCityStatePin
  );

  const organizationNode: Record<string, unknown> = {
    '@type': ['Organization', 'ClothingStore', 'OnlineStore'],
    '@id': `${SITE_ORIGIN}/#organization`,
    name: SITE_NAME,
    alternateName: ['DORASANI Sarees', 'Dorasani Collections', settings.storeName],
    url: `${SITE_ORIGIN}/`,
    logo: {
      '@type': 'ImageObject',
      '@id': `${SITE_ORIGIN}/#logo`,
      url: `${SITE_ORIGIN}/assets/logo.png`,
      width: 1842,
      height: 854,
      caption: 'DORASANI — A Symbol of Tradition',
    },
    image: DEFAULT_OG_IMAGE,
    description:
      'DORASANI is a luxury South Indian handloom boutique offering Silk Mark authentic Kanchipuram, Banarasi, Chanderi, and Tussar silk sarees, bridal lehengas, kurthis, kids pattu pavadai, and ethnic wear.',
    slogan: SITE_TAGLINE,
    email: settings.supportEmail || 'dorasanisarees@gmail.com',
    ...(settings.supportPhone ? { telephone: settings.supportPhone } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        settings.storeAddress ||
        'Plot No 7-13/1/A, Bhagyalaxmi Colony, Shapur Road, Quthbullapur (M), Medchal Dist (Landmark: Opposite Maxx Cycle Shop and beside new KFC)',
      addressLocality,
      addressRegion,
      ...(postalCode ? { postalCode } : {}),
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 17.5112,
      longitude: 78.448,
    },
    areaServed: [
      { '@type': 'Country', name: 'India' },
      { '@type': 'City', name: addressLocality },
    ],
    currenciesAccepted: 'INR',
    paymentAccepted: settings.codEnabled
      ? 'UPI, Credit Card, Debit Card, Net Banking, Digital Wallets, Cash on Delivery, Razorpay'
      : 'UPI, Credit Card, Debit Card, Net Banking, Digital Wallets, Razorpay',
    priceRange: '₹₹–₹₹₹',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '10:30',
        closes: '21:00',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: settings.supportEmail || 'dorasanisarees@gmail.com',
      ...(settings.supportPhone ? { telephone: settings.supportPhone } : {}),
      areaServed: ['IN', 'US', 'GB', 'AE', 'SG', 'AU', 'CA'],
      availableLanguage: ['English', 'Telugu', 'Hindi'],
    },
    knowsAbout: [
      'Kanchipuram Silk Sarees',
      'Banarasi Silk Sarees',
      'Chanderi Cotton Sarees',
      'Tussar Silk Sarees',
      'Organza Sarees',
      'South Indian Bridal Lehengas',
      'Pattu Pavadai Kids Wear',
      'Indian Handloom Textiles',
    ],
    ...(socialLinks.length > 0 ? { sameAs: socialLinks } : {}),
  };

  const websiteNode: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': `${SITE_ORIGIN}/#website`,
    url: `${SITE_ORIGIN}/`,
    name: `${SITE_NAME} — ${SITE_TAGLINE}`,
    alternateName: 'dorasanicollections.com',
    inLanguage: 'en-IN',
    publisher: { '@id': `${SITE_ORIGIN}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_ORIGIN}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [organizationNode, websiteNode],
  };
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; path?: string }>,
  currentCanonicalUrl: string
): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    '@id': `${currentCanonicalUrl}#breadcrumb`,
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: item.path ? buildCanonicalUrl(item.path) : currentCanonicalUrl,
    })),
  };
}

export function buildMerchantReturnPolicy(settings: SiteSettings): Record<string, unknown> {
  return {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'IN',
    returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
    merchantReturnDays: 7,
    returnMethod: 'https://schema.org/ReturnByMail',
    returnFees: 'https://schema.org/FreeReturn',
    merchantReturnLink: buildCanonicalUrl('/returns-policy'),
    additionalProperty: {
      '@type': 'PropertyValue',
      name: 'Support Email',
      value: settings.supportEmail || 'dorasanisarees@gmail.com',
    },
  };
}

export function buildShippingDetails(
  price: number,
  settings: SiteSettings
): Record<string, unknown> {
  const shippingCost =
    price >= settings.freeShippingThreshold ? 0 : settings.standardShippingFee;

  return {
    '@type': 'OfferShippingDetails',
    shippingRate: {
      '@type': 'MonetaryAmount',
      value: shippingCost,
      currency: 'INR',
    },
    shippingDestination: {
      '@type': 'DefinedRegion',
      addressCountry: 'IN',
    },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 2,
        unitCode: 'DAY',
      },
      transitTime: {
        '@type': 'QuantitativeValue',
        minValue: 3,
        maxValue: 5,
        unitCode: 'DAY',
      },
    },
  };
}

export function buildProductPageGraph(
  product: Product,
  reviews: ProductReview[],
  settings: SiteSettings
): Record<string, unknown> {
  const canonicalUrl = buildCanonicalUrl(`/products/${product.slug}`);
  const images = (product.images.length > 0 ? product.images : [product.primaryImage]).map(
    (img) => toAbsoluteUrl(img)
  );

  const isSareeProduct =
    product.productType === 'saree' ||
    product.categorySlug === 'sarees' ||
    /saree/i.test(product.title || '');
  const showSareeLength =
    Boolean(product.length) && (isSareeProduct || !/6\.3\s*m/i.test(product.length || ''));
  const typeLabel = getProductTypeLabel(product.productType, settings.productTypes);

  const additionalProperties = [
    product.productType && {
      '@type': 'PropertyValue',
      name: 'Product Type',
      value: typeLabel,
    },
    product.fabric && {
      '@type': 'PropertyValue',
      name: 'Fabric',
      value: product.fabric,
    },
    product.weave && {
      '@type': 'PropertyValue',
      name: 'Weaving Style',
      value: product.weave,
    },
    product.occasion && {
      '@type': 'PropertyValue',
      name: 'Occasion',
      value: product.occasion,
    },
    showSareeLength && {
      '@type': 'PropertyValue',
      name: 'Length & Fit',
      value: product.length,
    },
    ...(isSareeProduct
      ? [
        {
          '@type': 'PropertyValue',
          name: 'Blouse Piece',
          value: product.blouseIncluded
            ? 'Included (Unstitched matching blouse piece)'
            : 'Styled separately',
        },
      ]
      : []),
    product.careInstructions && {
      '@type': 'PropertyValue',
      name: 'Care Instructions',
      value: product.careInstructions,
    },
  ].filter(Boolean);

  const approvedReviews = reviews.filter((r) => !r.status || r.status === 'approved');
  const reviewCount = Math.max(product.reviewsCount || 0, approvedReviews.length);

  const categoryPath =
    product.categorySlug && product.categorySlug !== 'all'
      ? `/collections/${product.categorySlug}`
      : '/shop';

  const productNode: Record<string, unknown> = {
    '@type': 'Product',
    '@id': `${canonicalUrl}#product`,
    name: product.title,
    url: canonicalUrl,
    image: images,
    description:
      product.description ||
      product.subtitle ||
      `${product.title} — ${product.fabric || 'Handloom'} ${product.category || 'wear'} by DORASANI.`,
    sku: product.sku || `DOR-${product.slug}`,
    mpn: product.sku || `DOR-${product.slug}`,
    category: product.category || 'Ethnic Wear',
    ...(product.fabric ? { material: product.fabric } : {}),
    ...(product.weave ? { pattern: product.weave } : {}),
    ...(product.colors.length > 0
      ? { color: product.colors.map((c) => c.name).join(', ') }
      : {}),
    brand: {
      '@type': 'Brand',
      name: SITE_NAME,
    },
    ...(additionalProperties.length > 0
      ? { additionalProperty: additionalProperties }
      : {}),
    offers: {
      '@type': 'Offer',
      url: canonicalUrl,
      priceCurrency: 'INR',
      price: product.price,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${SITE_ORIGIN}/#organization` },
      shippingDetails: buildShippingDetails(product.price, settings),
      hasMerchantReturnPolicy: buildMerchantReturnPolicy(settings),
    },
    ...(product.rating > 0 && reviewCount > 0
      ? {
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: Number(product.rating.toFixed(1)),
          reviewCount,
          bestRating: 5,
          worstRating: 1,
        },
      }
      : {}),
    ...(approvedReviews.length > 0
      ? {
        review: approvedReviews.slice(0, 5).map((rev) => ({
          '@type': 'Review',
          author: {
            '@type': 'Person',
            name: rev.reviewerName,
          },
          ...(rev.createdAt ? { datePublished: rev.createdAt.slice(0, 10) } : {}),
          ...(rev.title ? { name: rev.title } : {}),
          ...(rev.content ? { reviewBody: rev.content } : {}),
          reviewRating: {
            '@type': 'Rating',
            ratingValue: Math.min(5, Math.max(1, Number(rev.rating || 5))),
            bestRating: 5,
            worstRating: 1,
          },
        })),
      }
      : {}),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${product.title} | ${SITE_NAME}`,
        description: product.description || product.subtitle || product.title,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        primaryImageOfPage: images[0],
        mainEntity: { '@id': `${canonicalUrl}#product` },
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
        inLanguage: 'en-IN',
      },
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: product.category || 'Collections', path: categoryPath },
          { name: product.title },
        ],
        canonicalUrl
      ),
      productNode,
    ],
  };
}

export interface CollectionSchemaInput {
  canonicalPath: string;
  name: string;
  description: string;
  image?: string;
  breadcrumbs: Array<{ name: string; path?: string }>;
  products?: Product[];
}

export function buildCollectionPageGraph(
  input: CollectionSchemaInput
): Record<string, unknown> {
  const canonicalUrl = buildCanonicalUrl(input.canonicalPath);
  const products = input.products || [];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: `${input.name} | ${SITE_NAME}`,
        description: input.description,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        about: { '@id': `${SITE_ORIGIN}/#organization` },
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
        ...(input.image ? { primaryImageOfPage: toAbsoluteUrl(input.image) } : {}),
        inLanguage: 'en-IN',
        ...(products.length > 0
          ? {
            mainEntity: {
              '@type': 'ItemList',
              numberOfItems: products.length,
              itemListElement: products.slice(0, 12).map((p, idx) => ({
                '@type': 'ListItem',
                position: idx + 1,
                url: buildCanonicalUrl(`/products/${p.slug}`),
                name: p.title,
              })),
            },
          }
          : {}),
      },
      buildBreadcrumbSchema(input.breadcrumbs, canonicalUrl),
    ],
  };
}
