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
      seo={{
        title: 'Pure Silk & Handloom Sarees Online | Kanchipuram, Banarasi & Chanderi | DORASANI',
        description:
          'Explore DORASANI’s curated collection of Silk Mark authentic Kanchipuram bridal silks, Banarasi brocades, Chanderi cottons, Tussar silks, and floral organza sarees.',
        canonicalPath: '/collections/sarees',
        keywords:
          'Kanchipuram silk saree, Banarasi silk saree, Chanderi cotton saree, Tussar silk saree, organza saree, buy silk sarees online India',
        ogImage: '/assets/hero/subpageshero/sareesdesktop.png',
      }}
    />
  );
};
