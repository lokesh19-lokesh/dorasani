import React from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const KurtisPage: React.FC = () => {
  const kurtiProducts = PRODUCTS.filter(
    (p) => p.categorySlug === 'kurtis' || p.categorySlug === 'ethnic-wear'
  );
  const kurtiSub = CATEGORIES.find((c) => c.slug === 'kurtis')?.subcategories;

  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/ethnic-weardesktop.png"
      mobileBanner="/assets/hero/subpageshero/ethnic-wearmobile.png"
      bannerTag="Contemporary Grace"
      title="Kurthis & Tunic Sets"
      subtitle="Exquisitely tailored silk, chanderi, and organza kurthis adorned with delicate zari embroidery, paired for modern festive poise."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Kurthis' },
      ]}
      highlights={['Fine Zari Detailing', 'Pure Chanderi & Raw Silk', 'Modern Festive Drapes']}
      products={kurtiProducts}
      subCategories={kurtiSub}
    />
  );
};

export default KurtisPage;
