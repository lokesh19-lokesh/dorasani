import React, { useEffect } from 'react';
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  SITE_NAME,
  buildBaseStoreGraph,
  buildCanonicalUrl,
  toAbsoluteUrl,
} from '../../utils/seo';
import type { SiteSettings } from '../../types';

export interface SeoHeadProps {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  robots?: string;
  ogType?: 'website' | 'product' | 'article';
  ogImage?: string;
  ogImageAlt?: string;
  productMeta?: {
    price: number;
    currency?: string;
    availability: 'instock' | 'oos';
    brand?: string;
    retailerItemId?: string;
  };
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function removeMeta(attr: 'name' | 'property', key: string): void {
  const el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (el) {
    el.remove();
  }
}

function upsertLink(rel: string, href: string, hreflang?: string): void {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`;
  let el = document.head.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) {
      el.setAttribute('hreflang', hreflang);
    }
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export const SeoHead: React.FC<SeoHeadProps> = ({
  title,
  description,
  canonicalPath,
  keywords,
  robots = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  ogType = 'website',
  ogImage,
  ogImageAlt,
  productMeta,
  jsonLd,
}) => {
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const resolvedOgImage = ogImage ? toAbsoluteUrl(ogImage) : DEFAULT_OG_IMAGE;
  const resolvedOgAlt = ogImageAlt || DEFAULT_OG_IMAGE_ALT;
  const jsonLdString = jsonLd ? serializeJsonLd(jsonLd) : '';

  useEffect(() => {
    document.title = title;

    upsertMeta('name', 'description', description);
    upsertMeta('name', 'robots', robots);
    upsertMeta('name', 'googlebot', robots);
    if (keywords) {
      upsertMeta('name', 'keywords', keywords);
    } else {
      removeMeta('name', 'keywords');
    }

    upsertLink('canonical', canonicalUrl);
    upsertLink('alternate', canonicalUrl, 'en-IN');
    upsertLink('alternate', canonicalUrl, 'x-default');

    upsertMeta('property', 'og:type', ogType);
    upsertMeta('property', 'og:site_name', SITE_NAME);
    upsertMeta('property', 'og:locale', 'en_IN');
    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', resolvedOgImage);
    upsertMeta('property', 'og:image:secure_url', resolvedOgImage);
    upsertMeta('property', 'og:image:alt', resolvedOgAlt);

    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', resolvedOgImage);
    upsertMeta('name', 'twitter:image:alt', resolvedOgAlt);

    const productKeys = [
      'product:price:amount',
      'product:price:currency',
      'product:availability',
      'product:brand',
      'product:retailer_item_id',
    ];

    if (productMeta) {
      upsertMeta('property', 'product:price:amount', String(productMeta.price));
      upsertMeta('property', 'product:price:currency', productMeta.currency || 'INR');
      upsertMeta('property', 'product:availability', productMeta.availability);
      upsertMeta('property', 'product:brand', productMeta.brand || SITE_NAME);
      if (productMeta.retailerItemId) {
        upsertMeta('property', 'product:retailer_item_id', productMeta.retailerItemId);
      } else {
        removeMeta('property', 'product:retailer_item_id');
      }
    } else {
      productKeys.forEach((k) => removeMeta('property', k));
    }

    const scriptId = 'dorasani-page-schema';
    const existingScript = document.getElementById(scriptId);
    if (jsonLdString) {
      if (existingScript) {
        existingScript.textContent = jsonLdString;
      } else {
        const script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        script.textContent = jsonLdString;
        document.head.appendChild(script);
      }
    } else if (existingScript) {
      existingScript.remove();
    }

    return () => {
      productKeys.forEach((k) => removeMeta('property', k));
    };
  }, [
    title,
    description,
    canonicalUrl,
    keywords,
    robots,
    ogType,
    resolvedOgImage,
    resolvedOgAlt,
    productMeta,
    jsonLdString,
  ]);

  return null;
};

export const BaseStoreSchema: React.FC<{ settings: SiteSettings }> = ({ settings }) => {
  const schemaJson = serializeJsonLd(buildBaseStoreGraph(settings));

  useEffect(() => {
    const scriptId = 'dorasani-base-schema';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = schemaJson;
  }, [schemaJson]);

  return null;
};
