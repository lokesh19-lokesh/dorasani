import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const LehengasPage: React.FC = () => {
  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/lehengasdesktop.png"
      mobileBanner="/assets/hero/subpageshero/lehengasmobile.png"
      bannerTag="Royal Silhouettes"
      title="The Lehengas Collection"
      subtitle="Grand volumetric silhouettes, heavy temple zari borders and intricate handwork tailored for weddings and milestones."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Lehengas' },
      ]}
      highlights={['Voluminous Flares', 'Intricate Zardozi Work', 'Heirloom Keepsakes']}
      categorySlug="lehengas"
      seo={{
        title: 'Bridal & Festive Silk Lehengas Online | Zardozi & Organza Sets | DORASANI',
        description:
          'Shop South Indian bridal silk lehengas, zardozi velvet sets, and pastel organza lehengas tailored for weddings, sangeet ceremonies, and grand celebrations.',
        canonicalPath: '/collections/lehengas',
        keywords:
          'bridal silk lehenga, South Indian wedding lehenga, zardozi velvet lehenga, pastel organza lehenga, DORASANI lehengas',
        ogImage: '/assets/hero/subpageshero/lehengasdesktop.png',
      }}
    />
  );
};
