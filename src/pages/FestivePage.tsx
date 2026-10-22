import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const FestivePage: React.FC = () => {
  const festiveProducts = PRODUCTS.filter((p) => p.isFestive);
  const festiveSub = CATEGORIES.find((c) => c.slug === 'festive')?.subcategories;

  return (
    <CollectionTemplate
      title="Celebrate Every Sacred Moment"
      subtitle="Traditional styles for festivals, weddings and every special occasion."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Festive Collection' },
      ]}
      products={festiveProducts}
      subCategories={festiveSub}
    />
  );
};
