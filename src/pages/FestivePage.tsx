import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const FestivePage: React.FC = () => {
  const festiveProducts = PRODUCTS.filter((p) => p.isFestive);
  const festiveSub = CATEGORIES.find((c) => c.slug === 'festive')?.subcategories;

  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/festivedesktop.png"
      mobileBanner="/assets/hero/subpageshero/festivemobile.png"
      bannerTag="Celebration Edit"
      title="Celebrate Every Sacred Moment"
      subtitle="Auspicious temple hues, glowing zari weaves and heirloom silks curated for Diwali, Pongal and sacred celebrations."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Festive Collection' },
      ]}
      highlights={['Auspicious Temple Colors', 'Handloom Pure Zari', 'Limited Festive Drops']}
      products={festiveProducts}
      subCategories={festiveSub}
    />
  );
};
