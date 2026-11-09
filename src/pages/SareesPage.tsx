import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const SareesPage: React.FC = () => {
  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/sareesdesktop.png"
      mobileBanner="/assets/hero/subpageshero/sareesmobile.png"
      bannerTag="A Symbol of Tradition"
      title="Dorasani Sarees"
      subtitle="Inspired by timeless elegance and rooted in deep-seated values, Dorasani Sarees brings you authentic weaves, festive lehengas, and custom tailoring essentials. We treat every customer with the care of family and the assurance of uncompromising quality."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Sarees' },
      ]}
      highlights={['Authentic Handloom Weaves', 'Uncompromising Quality', 'Family Trust & Care']}
      categorySlug="sarees"
    />
  );
};
