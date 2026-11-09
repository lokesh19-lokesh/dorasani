import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const EthnicWearPage: React.FC = () => {
  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/ethnic-weardesktop.png"
      mobileBanner="/assets/hero/subpageshero/ethnic-wearmobile.png"
      bannerTag="Regal Silhouettes"
      title="Elegance in Every Tradition"
      subtitle="Gracefully tailored kurtas, floor-sweeping anarkalis and fusion sets designed for festivals, poojas and celebrations."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Ethnic Wear' },
      ]}
      highlights={['Artisan Hand-Embroidery', 'Pure Breathable Fabrics', 'Regal Drapes & Cuts']}
      categorySlug="ethnic-wear"
    />
  );
};
