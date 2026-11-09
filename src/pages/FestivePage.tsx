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
    />
  );
};
