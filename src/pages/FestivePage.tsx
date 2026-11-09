import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const FestivePage: React.FC = () => {
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
      categorySlug="festive"
      isFestive={true}
      seo={{
        title: 'Festive Handloom Collection | Wedding, Diwali & Pongal Silks | DORASANI',
        description:
          'Celebrate Diwali, Pongal, Ugadi, and weddings in DORASANI’s Festive Collection — pure temple zari silks, bridal lehengas, and embroidered Anarkalis.',
        canonicalPath: '/collections/festive',
        keywords:
          'festive silk sarees India, Diwali sarees, Pongal traditional wear, wedding silk couture, DORASANI festive collection',
        ogImage: '/assets/hero/subpageshero/festivedesktop.png',
      }}
    />
  );
};
