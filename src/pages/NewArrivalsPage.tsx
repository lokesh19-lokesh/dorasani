import React from 'react';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const NewArrivalsPage: React.FC = () => {
  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/new-arrivalsdesktop.png"
      mobileBanner="/assets/hero/subpageshero/new-arrivalsmobile.png"
      bannerTag="Fresh Loom Drops"
      title="New Arrivals"
      subtitle="Fresh styles, timeless traditions. Explore the newest handpicked heirloom weaves, pastel palettes and temple classics."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'New Arrivals' },
      ]}
      highlights={['Latest Weave Drops', 'Contemporary South Indian Styles', 'Limited Yardage']}
      isNew={true}
    />
  );
};
