import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const ShopPage: React.FC = () => {
  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/ShopAllhero.png"
      mobileBanner="/assets/hero/subpageshero/ShopAllheromobile.png"
      bannerTag="Royal Heritage Edit"
      title="All Collections"
      subtitle="Discover timeless South Indian fashion — pure silks, lehengas and festive ensembles designed for today."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Shop All' },
      ]}
      highlights={['Hereditary Looms', 'Certified Pure Silks', 'Heirloom Craftsmanship']}
      categorySlug="all"
      seo={{
        title: 'Dorasani Collections — Shop All Sarees & Ethnic Wear | Dorasani Sarees A Symbol of Tradition',
        description:
          'Shop Dorasani Collections online (Dorasani Sarees — A Symbol of Tradition) — Kanchipuram pure silk sarees, Banarasi weaves, Chanderi cottons, bridal lehengas, kurthis, ethnic wear & pattu pavadai with free pan-India shipping.',
        canonicalPath: '/shop',
        keywords:
          'Dorasani Collections, dorasani collections, Dorasani Sarees A Symbol of Tradition, shop handloom sarees online, South Indian bridal couture, silk sarees India',
        ogImage: '/assets/hero/subpageshero/ShopAllhero.png',
      }}
    />
  );
};
