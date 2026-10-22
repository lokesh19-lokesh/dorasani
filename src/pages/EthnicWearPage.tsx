import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const EthnicWearPage: React.FC = () => {
  const ethnicProducts = PRODUCTS.filter((p) => p.categorySlug === 'ethnic-wear');
  const ethnicSub = CATEGORIES.find((c) => c.slug === 'ethnic-wear')?.subcategories;

  return (
    <CollectionTemplate
      title="Elegance in Every Tradition"
      subtitle="Explore our ethnic wear collection, crafted for festivals, celebrations and everyday elegance."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Ethnic Wear' },
      ]}
      products={ethnicProducts}
      subCategories={ethnicSub}
    />
  );
};
