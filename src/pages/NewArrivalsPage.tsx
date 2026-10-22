import React from 'react';
import { PRODUCTS } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const NewArrivalsPage: React.FC = () => {
  const newProducts = PRODUCTS.filter((p) => p.isNew);

  return (
    <CollectionTemplate
      title="New Arrivals"
      subtitle="Fresh styles, timeless traditions. Discover our latest collection of sarees, ethnic wear and festive ensembles, crafted for the modern woman."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'New Arrivals' },
      ]}
      products={newProducts}
    />
  );
};
