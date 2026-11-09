import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const KidsWearPage: React.FC = () => {
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
      categorySlug="kids-wear"
      seo={{
        title: 'Traditional Kids Pattu Pavadai & Silk Ethnic Wear | DORASANI',
        description:
          'Shop traditional pure silk pattu pavadai sets and festive kids ethnic couture crafted by DORASANI for weddings, naming ceremonies, and South Indian festivals.',
        canonicalPath: '/collections/kids-wear',
        keywords:
          'kids pattu pavadai online, traditional girls silk ethnic wear, South Indian kids festive clothing, DORASANI kids wear',
        ogImage: '/assets/hero/subpageshero/lehengasdesktop.png',
      }}
    />
  );
};

export default KidsWearPage;
