import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const KurtisPage: React.FC = () => {
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
      categorySlug="kurtis"
    />
  );
};

export default KurtisPage;
