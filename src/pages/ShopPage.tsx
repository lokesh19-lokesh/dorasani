import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
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
      products={PRODUCTS}
      subCategories={CATEGORIES[0].subcategories}
    />
  );
};
