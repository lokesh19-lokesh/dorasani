import React from 'react';
import { PRODUCTS } from '../data/products';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';

export const BestsellersPage: React.FC = () => {
  const bestsellers = PRODUCTS.filter((p) => p.isBestseller);

  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/bestsellersdesktop.png"
      mobileBanner="/assets/hero/subpageshero/bestsellersmobile.png"
      bannerTag="Most Cherished"
      title="Our Bestsellers"
      subtitle="Timeless favourites, loved by many. Explore our most popular collections, chosen for their exceptional beauty, quality and elegance."
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Bestsellers' },
      ]}
      highlights={['5-Star Patron Rating', 'Signature DORASANI Weaves', 'Restocked on Popular Demand']}
      products={bestsellers}
    />
  );
};
