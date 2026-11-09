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
    />
  );
};

export default KidsWearPage;
