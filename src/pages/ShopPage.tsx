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
        title: 'Shop All Collections | Authentic Handloom Sarees & Bridal Couture | DORASANI',
        description:
          'Browse all DORASANI collections online — Kanchipuram pure silk sarees, Banarasi weaves, Chanderi cottons, bridal lehengas, kurthis, ethnic wear, and pattu pavadai.',
        canonicalPath: '/shop',
        keywords:
          'shop handloom sarees online, DORASANI all collections, South Indian bridal couture, silk sarees India',
        ogImage: '/assets/hero/subpageshero/ShopAllhero.png',
      }}
    />
  );
};
