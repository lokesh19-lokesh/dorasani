import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const LehengasPage: React.FC = () => {
  const lehengaProducts = PRODUCTS.filter((p) => p.categorySlug === 'lehengas');
  const lehengaSub = CATEGORIES.find((c) => c.slug === 'lehengas')?.subcategories;

  return (
    <CollectionTemplate
      title="The Lehengas Collection"
      subtitle="Royal silhouettes for your most cherished moments."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Lehengas' },
      ]}
      products={lehengaProducts}
      subCategories={lehengaSub}
    />
  );
};
