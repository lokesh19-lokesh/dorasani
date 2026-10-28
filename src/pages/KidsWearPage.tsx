import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const KidsWearPage: React.FC = () => {
  const kidsProducts = PRODUCTS.filter((p) => p.categorySlug === 'kids-wear');
  const kidsSub = CATEGORIES.find((c) => c.slug === 'kids-wear')?.subcategories;

  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/lehengasdesktop.png"
      mobileBanner="/assets/hero/subpageshero/lehengasmobile.png"
      bannerTag="Little Royals"
      title="Heritage Kids Wear"
      subtitle="Adorable pure pattu pavadais, heritage silk lehengas, and miniature royal festive ensembles crafted for life's precious auspicious moments."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Kids Wear' },
      ]}
      highlights={['Gentle Pure Silk Fabrics', 'Handloom Pattu Pavadai', 'Auspicious Festive Colors']}
      products={kidsProducts.length > 0 ? kidsProducts : PRODUCTS.slice(0, 4)}
      subCategories={kidsSub}
    />
  );
};

export default KidsWearPage;
