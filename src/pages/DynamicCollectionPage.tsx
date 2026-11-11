import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { CollectionTemplate } from '../components/collection/CollectionTemplate';
import { useStore } from '../context/StoreContext';
import { productService } from '../services/productService';
import type { Category } from '../types';
import { NotFoundPage } from './NotFoundPage';

export const DynamicCollectionPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { storeCategories } = useStore();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    if (!slug) {
      setCategory(null);
      setLoading(false);
      return;
    }

    const fromContext = storeCategories.find((c) => c.slug === slug);
    if (fromContext) {
      setCategory(fromContext);
    }

    setLoading(!fromContext);
    productService
      .getCategoryBySlug(slug)
      .then((found) => {
        if (!active) return;
        setCategory(found);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, storeCategories]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-6">
        <div className="h-44 rounded-2xl bg-[#F2E8DC] animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-64 rounded-xl bg-white border border-[#E8DCCF] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return <NotFoundPage />;
  }

  return (
    <CollectionTemplate
      desktopBanner="/assets/hero/subpageshero/ShopAllhero.png"
      mobileBanner="/assets/hero/subpageshero/ShopAllheromobile.png"
      bannerTag="Curated Collection"
      title={category.name}
      subtitle={
        category.description ||
        `Explore handpicked ${category.name} creations crafted by artisan weavers for DORASANI.`
      }
      breadcrumbs={[
        { name: 'Home', path: '/' },
        { name: 'Shop All', path: '/shop' },
        { name: category.name },
      ]}
      categorySlug={category.slug}
      isFestive={category.slug === 'festive'}
      seo={{
        title: `${category.name} | Handloom Sarees & Bridal Couture | DORASANI`,
        description:
          category.description ||
          `Browse DORASANI's curated ${category.name} collection online with pan-India delivery.`,
        canonicalPath: `/collections/${category.slug}`,
        ogImage: category.imageUrl || '/assets/hero/subpageshero/ShopAllhero.png',
      }}
    />
  );
};

export default DynamicCollectionPage;

