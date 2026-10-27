import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const LehengasPage: React.FC = () => {
  const lehengaProducts = PRODUCTS.filter((p) => p.categorySlug === 'lehengas');
  const lehengaSub = CATEGORIES.find((c) => c.slug === 'lehengas')?.subcategories;

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
      products={lehengaProducts}
      subCategories={lehengaSub}
    />
  );
};
