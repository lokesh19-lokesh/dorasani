import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const ShopPage: React.FC = () => {
  return (
    <CollectionTemplate
      title="All Collections"
      subtitle="Discover timeless Indian fashion, crafted with tradition and designed for today."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Shop All' },
      ]}
      products={PRODUCTS}
      subCategories={CATEGORIES[0].subcategories}
    />
  );
};
