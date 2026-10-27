import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const SareesPage: React.FC = () => {
  const sareeProducts = PRODUCTS.filter((p) => p.categorySlug === 'sarees');

  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/sareesdesktop.png"
      mobileBanner="/assets/hero/subpageshero/sareesmobile.png"
      bannerTag="Sacred Drapes & Pure Silks"
      title="The Saree Collection"
      subtitle="Timeless drapes woven with divine Dravidian heritage, lustrous mulberry silks and authentic gold zari."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Sarees' },
      ]}
      highlights={['Kanjivaram & Banarasi Silks', 'Pure Gold Zari', 'Temple Artisans']}
      products={sareeProducts}
      subCategories={CATEGORIES[0].subcategories}
    />
  );
};
