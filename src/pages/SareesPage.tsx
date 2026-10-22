import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const SareesPage: React.FC = () => {
  const sareeProducts = PRODUCTS.filter((p) => p.categorySlug === 'sarees');

  return (
    <CollectionTemplate
      title="The Saree Collection"
      subtitle="Timeless drapes for every occasion, crafted with tradition and designed for the modern woman."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Sarees' },
      ]}
      products={sareeProducts}
      subCategories={CATEGORIES[0].subcategories}
    />
  );
};
