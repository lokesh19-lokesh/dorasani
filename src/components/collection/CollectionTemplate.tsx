import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import type {
  Category,
  FilterGroupConfig,
  Product,
  ProductTypeOption,
  SortOption,
} from '../../types';
import { getProductTypeLabel } from '../../types';
import { useStore } from '../../context/StoreContext';
import { ProductCard } from '../product/ProductCard';
import { SubpageHero } from '../common/SubpageHero';
import { SeoHead } from '../common/SeoHead';
import { buildCollectionPageGraph } from '../../utils/seo';
import { productService } from '../../services/productService';

interface SubCategory {
  id?: string;
  name: string;
  slug: string;
  imageUrl?: string;
  filterKeywords?: string;
}

export interface CollectionSeoMeta {
  title: string;
  description: string;
  canonicalPath: string;
  keywords?: string;
  ogImage?: string;
  ogImageAlt?: string;
}

interface CollectionTemplateProps {
  title: string;
  subtitle: string;
  breadcrumbs: { name: string; path?: string }[];
  products?: Product[];
  categorySlug?: string;
  isFestive?: boolean;
  isNew?: boolean;
  isBestseller?: boolean;
  subCategories?: SubCategory[];
  desktopBanner?: string;
  mobileBanner?: string;
  bannerTag?: string;
  textPosition?: 'left' | 'right' | 'center';
  highlights?: string[];
  bannerImage?: string;
  seo?: CollectionSeoMeta;
}

const ITEMS_PER_PAGE = 12;

function extractGroupRawOptions(
  group: FilterGroupConfig,
  products: Product[],
  productTypes: ProductTypeOption[] = []
): string[] {
  switch (group.type) {
    case 'fabric':
      return Array.from(
        new Set(products.map((p) => p.fabric?.trim()).filter(Boolean) as string[])
      ).sort();
    case 'occasion':
      return Array.from(
        new Set(products.map((p) => p.occasion?.trim()).filter(Boolean) as string[])
      ).sort();
    case 'product_type':
      return Array.from(
        new Set(
          products
            .map((p) => p.productType?.trim())
            .filter(Boolean)
            .map((t) => getProductTypeLabel(t, productTypes))
        )
      ).sort();
    case 'weave':
      return Array.from(
        new Set(products.map((p) => p.weave?.trim()).filter(Boolean) as string[])
      ).sort();
    case 'color': {
      const names = new Set<string>();
      for (const p of products) {
        for (const c of p.colors || []) {
          if (c?.name?.trim()) names.add(c.name.trim());
        }
      }
      return Array.from(names).sort();
    }
    case 'availability':
      return ['In Stock Only', 'New Arrivals', 'Bestsellers', 'Festive Edit'];
    case 'discount':
      return ['10% or more', '20% or more', '30% or more'];
    case 'tag': {
      const tags = new Set<string>();
      for (const p of products) {
        if (p.subCategory?.trim()) tags.add(p.subCategory.trim());
        for (const t of p.tags || []) {
          if (t?.trim()) tags.add(t.trim());
        }
      }
      return Array.from(tags).sort();
    }
    default:
      return [];
  }
}

function productMatchesGroupValue(
  product: Product,
  group: FilterGroupConfig,
  val: string,
  productTypes: ProductTypeOption[] = []
): boolean {
  const target = val.trim().toLowerCase();
  if (!target) return true;

  switch (group.type) {
    case 'fabric':
      return (product.fabric || '').trim().toLowerCase() === target;
    case 'occasion':
      return (product.occasion || '').trim().toLowerCase() === target;
    case 'product_type': {
      const rawVal = (product.productType || '').trim().toLowerCase();
      const labelVal = getProductTypeLabel(product.productType, productTypes).trim().toLowerCase();
      return rawVal === target || labelVal === target;
    }
    case 'weave':
      return (product.weave || '').trim().toLowerCase() === target;
    case 'color':
      return (product.colors || []).some(
        (c) => (c?.name || '').trim().toLowerCase() === target
      );
    case 'availability':
      if (target.includes('stock')) return Boolean(product.inStock);
      if (target.includes('new')) return Boolean(product.isNew);
      if (target.includes('best')) return Boolean(product.isBestseller);
      if (target.includes('festive')) return Boolean(product.isFestive);
      return true;
    case 'discount': {
      const minPct = parseInt(target, 10);
      if (!Number.isFinite(minPct)) return true;
      return (product.discountPercent ?? 0) >= minPct;
    }
    case 'tag': {
      const haystacks = [
        ...(product.tags || []),
        product.subCategory || '',
        product.title || '',
        product.fabric || '',
        product.occasion || '',
        product.weave || '',
      ];
      return haystacks.some((h) => h.toLowerCase().includes(target));
    }
    default:
      return true;
  }
}

export const CollectionTemplate: React.FC<CollectionTemplateProps> = ({
  title,
  subtitle,
  breadcrumbs,
  products = [],
  categorySlug,
  isFestive,
  isNew,
  isBestseller,
  subCategories,
  desktopBanner,
  mobileBanner,
  bannerTag,
  textPosition = 'left',
  highlights,
  bannerImage,
  seo,
}) => {
  const { siteSettings, storeCategories } = useStore();
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);
  const [liveSubCategories, setLiveSubCategories] = useState<SubCategory[] | undefined>(
    subCategories
  );
  const [liveCategoryMeta, setLiveCategoryMeta] = useState<Category | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState<string | null>(null);

  const [selectedGroupValues, setSelectedGroupValues] = useState<Record<string, string[]>>({});
  const [userMaxPrice, setUserMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Canonical key used by admin per-collection overrides
  const collectionKey = isNew
    ? 'new-arrivals'
    : isBestseller
    ? 'bestsellers'
    : isFestive || categorySlug === 'festive'
    ? 'festive'
    : categorySlug || 'all';

  // Merge Explore Categories global config + per-collection override
  const exploreConfig = siteSettings.exploreCategoriesConfig;
  const exploreOverride = exploreConfig.categoryOverrides?.[collectionKey] || {};
  const defaultExploreVisible = isNew
    ? exploreConfig.showOnNewArrivals
    : isBestseller
    ? exploreConfig.showOnBestsellers
    : collectionKey === 'all'
    ? exploreConfig.showOnShopAll
    : exploreConfig.showOnCollections;

  const isExploreVisible =
    exploreConfig.enabled &&
    (exploreOverride.enabled !== undefined ? exploreOverride.enabled : defaultExploreVisible);
  const exploreTitle = exploreOverride.title || exploreConfig.title || 'Explore Categories';
  const showAllPill =
    exploreOverride.showAllPill !== undefined
      ? exploreOverride.showAllPill
      : exploreConfig.showAllPill;
  const allPillLabel = exploreOverride.allPillLabel || exploreConfig.allPillLabel || 'All';

  // Merge Collection Filters global config + per-collection override
  const filtersConfig = siteSettings.collectionFiltersConfig;
  const filterOverride = filtersConfig.categoryOverrides?.[collectionKey] || {};
  const isFiltersSidebarVisible =
    filtersConfig.enabled &&
    (filterOverride.enabled !== undefined ? filterOverride.enabled : true);
  const sidebarTitle = filterOverride.sidebarTitle || filtersConfig.sidebarTitle || 'Filters';

  const resolvedGroups = useMemo(() => {
    const disabledIds = new Set(filterOverride.disabledGroupIds || []);
    return [...filtersConfig.groups]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((g) => {
        const gOv = filterOverride.groupOverrides?.[g.id];
        const enabled =
          gOv?.enabled !== undefined
            ? gOv.enabled
            : !disabledIds.has(g.id) && g.enabled;
        const hasCustomOv = Array.isArray(gOv?.customOptions) && gOv.customOptions.length > 0;
        return {
          ...g,
          enabled,
          label: gOv?.label || g.label,
          optionSource: hasCustomOv ? 'custom' : g.optionSource,
          customOptions: hasCustomOv ? (gOv?.customOptions as string[]) : g.customOptions,
          minPrice: gOv?.minPrice !== undefined ? gOv.minPrice : g.minPrice,
          maxPrice: gOv?.maxPrice !== undefined ? gOv.maxPrice : g.maxPrice,
        };
      })
      .filter((g) => g.enabled);
  }, [filtersConfig.groups, filterOverride]);

  const priceGroup = useMemo(
    () => resolvedGroups.find((g) => g.type === 'price_range'),
    [resolvedGroups]
  );

  // Reset subcategory & filters when switching collection route
  useEffect(() => {
    setSelectedSubCategorySlug(null);
    setSelectedGroupValues({});
    setUserMaxPrice(null);
    setSortBy('featured');
    setCurrentPage(1);
  }, [categorySlug, isFestive, isNew, isBestseller]);

  // Fetch products dynamically from Supabase
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    productService
      .getProducts({
        categorySlug: categorySlug && categorySlug !== 'all' ? categorySlug : undefined,
        subCategorySlug: selectedSubCategorySlug || undefined,
        isFestive,
        isNew,
        isBestseller,
        limit: 120,
      })
      .then((res) => {
        if (!isMounted) return;
        setLiveProducts(res.products);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, selectedSubCategorySlug, isFestive, isNew, isBestseller]);

  // Keep Explore Categories synchronized with live DB categories & admin updates
  useEffect(() => {
    let isMounted = true;

    if (categorySlug && categorySlug !== 'all') {
      const cached = storeCategories.find((c) => c.slug === categorySlug);
      if (cached) {
        setLiveCategoryMeta(cached);
        setLiveSubCategories(
          cached.subcategories && cached.subcategories.length > 0
            ? cached.subcategories
            : undefined
        );
      }

      productService.getCategoryBySlug(categorySlug).then((cat) => {
        if (!isMounted) return;
        setLiveCategoryMeta(cat);
        if (cat && cat.subcategories && cat.subcategories.length > 0) {
          setLiveSubCategories(cat.subcategories);
        } else {
          setLiveSubCategories(undefined);
        }
      });
    } else {
      setLiveCategoryMeta(null);
      if (storeCategories.length > 0) {
        setLiveSubCategories(
          storeCategories
            .filter((c) => c.slug !== 'new-arrivals' && c.slug !== 'bestsellers')
            .map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
              imageUrl: c.imageUrl,
              filterKeywords: c.filterKeywords,
            }))
        );
      } else {
        productService.getCategories().then((cats) => {
          if (!isMounted) return;
          setLiveSubCategories(
            cats
              .filter((c) => c.slug !== 'new-arrivals' && c.slug !== 'bestsellers')
              .map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                imageUrl: c.imageUrl,
                filterKeywords: c.filterKeywords,
              }))
          );
        });
      }
    }

    return () => {
      isMounted = false;
    };
  }, [categorySlug, storeCategories]);

  // Compute dynamic price range bounds
  const priceMinBound = priceGroup?.minPrice ?? 500;
  const priceStep = priceGroup?.step && priceGroup.step > 0 ? priceGroup.step : 500;
  const ceilingPrice = useMemo(() => {
    if (priceGroup?.maxPrice && priceGroup.maxPrice > 0) {
      return Math.max(priceMinBound + priceStep, priceGroup.maxPrice);
    }
    const maxFound = liveProducts.reduce((m, p) => Math.max(m, p.price), 30000);
    return Math.max(priceMinBound + 1000, 30000, Math.ceil(maxFound / 1000) * 1000);
  }, [liveProducts, priceGroup, priceMinBound, priceStep]);

  const effectiveMaxPrice =
    userMaxPrice !== null ? Math.max(priceMinBound, Math.min(userMaxPrice, ceilingPrice)) : ceilingPrice;

  // Compute dynamic options for every non-price enabled filter group
  const groupOptionsMap = useMemo(() => {
    const out: Record<string, string[]> = {};
    for (const group of resolvedGroups) {
      if (group.type === 'price_range') continue;
      const hidden = new Set((group.hiddenOptions || []).map((x) => x.toLowerCase()));
      const base =
        group.optionSource === 'custom' && group.customOptions.length > 0
          ? group.customOptions
          : extractGroupRawOptions(group, liveProducts, siteSettings.productTypes);

      const deduped: string[] = [];
      const seen = new Set<string>();
      for (const opt of base) {
        const clean = opt.trim();
        const key = clean.toLowerCase();
        if (!clean || hidden.has(key) || seen.has(key)) continue;
        seen.add(key);
        deduped.push(clean);
      }
      out[group.id] = deduped;
    }
    return out;
  }, [resolvedGroups, liveProducts, siteSettings.productTypes]);

  // Filtering logic across all enabled dynamic groups
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((p) => {
      if (priceGroup && p.price > effectiveMaxPrice) {
        return false;
      }
      for (const group of resolvedGroups) {
        if (group.type === 'price_range') continue;
        const picked = selectedGroupValues[group.id] || [];
        if (picked.length > 0) {
          const matchesAny = picked.some((val) =>
            productMatchesGroupValue(p, group, val, siteSettings.productTypes)
          );
          if (!matchesAny) return false;
        }
      }
      return true;
    });
  }, [
    liveProducts,
    priceGroup,
    effectiveMaxPrice,
    resolvedGroups,
    selectedGroupValues,
    siteSettings.productTypes,
  ]);

  // Sorting logic
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-low-high') {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-high-low') {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === 'popular') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }
    return list;
  }, [filteredProducts, sortBy]);

  // Genuine client-side pagination derived from sortedProducts.length
  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / ITEMS_PER_PAGE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (safeCurrentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, safeCurrentPage]);

  const toggleGroupValue = (groupId: string, option: string) => {
    setSelectedGroupValues((prev) => {
      const current = prev[groupId] || [];
      const exists = current.includes(option);
      const next = exists ? current.filter((x) => x !== option) : [...current, option];
      return { ...prev, [groupId]: next };
    });
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedSubCategorySlug(null);
    setSelectedGroupValues({});
    setUserMaxPrice(null);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const isPriceFiltered = Boolean(
    priceGroup && userMaxPrice !== null && userMaxPrice < ceilingPrice
  );
  const activeGroupFilterCount = Object.values(selectedGroupValues).reduce(
    (sum, arr) => sum + (arr?.length || 0),
    0
  );
  const activeFilterCount =
    (selectedSubCategorySlug ? 1 : 0) +
    activeGroupFilterCount +
    (isPriceFiltered ? 1 : 0);

  // Sync last breadcrumb label with live DB category name when available
  const resolvedBreadcrumbs = useMemo(() => {
    if (!liveCategoryMeta?.name || breadcrumbs.length === 0) return breadcrumbs;
    return breadcrumbs.map((crumb, idx) =>
      idx === breadcrumbs.length - 1 && !crumb.path
        ? { ...crumb, name: liveCategoryMeta.name }
        : crumb
    );
  }, [breadcrumbs, liveCategoryMeta?.name]);

  const collectionJsonLd = useMemo(() => {
    if (!seo) return undefined;
    return buildCollectionPageGraph({
      canonicalPath: seo.canonicalPath,
      name: title,
      description: seo.description,
      image: seo.ogImage || desktopBanner || bannerImage,
      breadcrumbs: resolvedBreadcrumbs,
      products: sortedProducts,
    });
  }, [seo, title, desktopBanner, bannerImage, resolvedBreadcrumbs, sortedProducts]);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {seo && (
        <SeoHead
          title={seo.title}
          description={seo.description}
          canonicalPath={seo.canonicalPath}
          keywords={seo.keywords}
          ogImage={seo.ogImage || desktopBanner || bannerImage}
          ogImageAlt={seo.ogImageAlt || title}
          jsonLd={collectionJsonLd}
        />
      )}
      {/* 1. Hero Banner */}
      {desktopBanner || mobileBanner || bannerImage ? (
        <SubpageHero
          desktopImage={desktopBanner || bannerImage || mobileBanner || ''}
          mobileImage={mobileBanner || desktopBanner || bannerImage || ''}
          tag={bannerTag}
          title={title}
          subtitle={subtitle}
          breadcrumbs={resolvedBreadcrumbs}
          textPosition={textPosition}
          highlights={highlights}
        />
      ) : (
        <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] pt-4 pb-8 sm:pb-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center space-x-1.5 text-xs text-[#4F6355]">
                {resolvedBreadcrumbs.map((crumb, idx) => (
                  <li key={crumb.name} className="inline-flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" aria-hidden="true" />}
                    {crumb.path ? (
                      <Link to={crumb.path} className="hover:text-[#285A3C]">
                        {crumb.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="font-semibold text-[#285A3C]">
                        {crumb.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <div className="max-w-2xl">
              <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#1A3B2B]">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-[#4F6355] mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Explore Categories horizontal bar (100% admin configurable) */}
      {isExploreVisible && liveSubCategories && liveSubCategories.length > 0 && (
        <div className="bg-[#FAF5EE]/70 border-b border-[#D8C7B5] py-3.5 px-4 sm:px-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#1A3B2B] uppercase flex items-center gap-1.5 shrink-0">
              <span className="text-[#C99632]">✦</span>
              <span>{exploreTitle}</span>
              <span className="text-[#C99632]">✦</span>
            </div>
            <div className="overflow-x-auto no-scrollbar flex items-start gap-4 sm:gap-6 py-1">
              {showAllPill && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedSubCategorySlug(null);
                    setCurrentPage(1);
                  }}
                  className="flex flex-col items-center shrink-0 cursor-pointer group focus:outline-none"
                >
                  <div
                    className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 shadow-xs transition-all flex items-center justify-center ${
                      selectedSubCategorySlug === null
                        ? 'border-[#18482C] ring-2 ring-[#285A3C]/40 scale-105 bg-[#18482C] text-white'
                        : 'border-[#D8C7B5] bg-white text-[#285A3C] group-hover:border-[#285A3C]'
                    }`}
                  >
                    <Sparkles className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span
                    className={`text-[11px] mt-1.5 text-center max-w-[104px] sm:max-w-[116px] line-clamp-2 leading-tight ${
                      selectedSubCategorySlug === null
                        ? 'font-bold text-[#18482C]'
                        : 'font-medium text-[#1A3B2B] group-hover:text-[#285A3C]'
                    }`}
                  >
                    {allPillLabel}
                  </span>
                </button>
              )}

              {liveSubCategories.map((sub) => {
                const isSelected = selectedSubCategorySlug === sub.slug;
                return (
                  <button
                    key={sub.slug}
                    type="button"
                    onClick={() => {
                      setSelectedSubCategorySlug(isSelected ? null : sub.slug);
                      setCurrentPage(1);
                    }}
                    className="flex flex-col items-center shrink-0 cursor-pointer group focus:outline-none"
                  >
                    <div
                      className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 shadow-xs transition-all bg-[#FAF5EE] ${
                        isSelected
                          ? 'border-[#18482C] ring-2 ring-[#285A3C]/40 scale-105'
                          : 'border-[#D8C7B5] group-hover:border-[#285A3C]'
                      }`}
                    >
                      {sub.imageUrl ? (
                        <img
                          src={sub.imageUrl}
                          alt={sub.name}
                          loading="lazy"
                          width={120}
                          height={120}
                          className="w-full h-full object-cover object-top transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#D0E9C0]/50 flex items-center justify-center text-[#285A3C] font-bold text-xs">
                          {sub.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 text-center max-w-[104px] sm:max-w-[116px] line-clamp-2 leading-tight ${
                        isSelected
                          ? 'font-bold text-[#18482C]'
                          : 'font-medium text-[#1A3B2B] group-hover:text-[#285A3C]'
                      }`}
                    >
                      {sub.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content: Sidebar Filters + Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Mobile Filter & Sort Bar */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#D8C7B5] mb-6 gap-2">
          {isFiltersSidebarVisible && resolvedGroups.length > 0 ? (
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(true)}
              className="flex items-center gap-2 text-xs font-semibold text-[#1A3B2B] bg-[#F5EFE6] px-3.5 py-2 rounded-md border border-[#BCD8AA]"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#285A3C]" />
              <span>{sidebarTitle} {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>
          ) : (
            <span />
          )}

          <span className="text-xs text-[#4F6355]">
            {loading ? 'Loading...' : `${sortedProducts.length} Products`}
          </span>

          {filtersConfig.showSortDropdown && (
            <div className="relative">
              <select
                aria-label="Sort products"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setCurrentPage(1);
                }}
                className="text-xs bg-[#F5EFE6] border border-[#BCD8AA] rounded-md px-3 py-2 pr-7 text-[#1A3B2B] font-medium appearance-none focus:outline-none"
              >
                <option value="featured">Sort: Featured</option>
                <option value="popular">Sort: Popular</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#4F6355] absolute right-2 top-2.5 pointer-events-none" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (Dynamic) */}
          {isFiltersSidebarVisible && resolvedGroups.length > 0 && (
            <aside
              aria-label="Collection filters"
              className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-xl border border-[#D8C7B5] shadow-xs space-y-6 sticky top-24"
            >
              <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
                <h2 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] tracking-wider uppercase">
                  {sidebarTitle}
                </h2>
                {filtersConfig.showClearAll && activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="text-xs text-[#285A3C] hover:underline font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {resolvedGroups.map((group) => {
                if (group.type === 'price_range') {
                  return (
                    <div key={group.id} className="space-y-2">
                      <label
                        htmlFor={`desktop-filter-${group.id}`}
                        className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase block"
                      >
                        {group.label}
                      </label>
                      <div className="flex justify-between text-xs text-[#4F6355]">
                        <span>₹{priceMinBound.toLocaleString('en-IN')}</span>
                        <span>₹{effectiveMaxPrice.toLocaleString('en-IN')}</span>
                      </div>
                      <input
                        id={`desktop-filter-${group.id}`}
                        type="range"
                        min={priceMinBound}
                        max={ceilingPrice}
                        step={priceStep}
                        value={effectiveMaxPrice}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setUserMaxPrice(next >= ceilingPrice ? null : next);
                          setCurrentPage(1);
                        }}
                        className="w-full accent-[#285A3C] cursor-pointer"
                      />
                    </div>
                  );
                }

                const options = groupOptionsMap[group.id] || [];
                if (options.length === 0) return null;
                const picked = selectedGroupValues[group.id] || [];

                return (
                  <div key={group.id} className="space-y-2">
                    <span className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase block">
                      {group.label}
                    </span>
                    <div className="space-y-1.5 text-xs text-[#4F6355] max-h-48 overflow-y-auto pr-1">
                      {options.map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 cursor-pointer hover:text-[#285A3C]"
                        >
                          <input
                            type="checkbox"
                            checked={picked.includes(opt)}
                            onChange={() => toggleGroupValue(group.id, opt)}
                            className="accent-[#285A3C] rounded"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </aside>
          )}

          {/* Products Grid Area */}
          <div
            className={`${
              isFiltersSidebarVisible && resolvedGroups.length > 0
                ? 'lg:col-span-9'
                : 'lg:col-span-12'
            } space-y-6`}
          >
            {/* Top Bar (Showing count, active chips & Sort dropdown) */}
            <div className="hidden lg:flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#D8C7B5]">
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#4F6355] font-medium">
                <span>
                  {loading
                    ? 'Loading collection...'
                    : sortedProducts.length === 0
                    ? '0 products found'
                    : `Showing ${(safeCurrentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(
                        safeCurrentPage * ITEMS_PER_PAGE,
                        sortedProducts.length
                      )} of ${sortedProducts.length} products`}
                </span>
                {selectedSubCategorySlug && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubCategorySlug(null)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D0E9C0] text-[#1A3B2B] font-semibold"
                  >
                    <span>
                      {liveSubCategories?.find((s) => s.slug === selectedSubCategorySlug)
                        ?.name || selectedSubCategorySlug}
                    </span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {isPriceFiltered && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserMaxPrice(null);
                      setCurrentPage(1);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#F5EFE6] border border-[#D8C7B5] text-[#1A3B2B] font-semibold"
                  >
                    <span>Up to ₹{effectiveMaxPrice.toLocaleString('en-IN')}</span>
                    <X className="w-3 h-3" />
                  </button>
                )}
                {resolvedGroups.map((group) =>
                  (selectedGroupValues[group.id] || []).map((val) => (
                    <button
                      key={`${group.id}-${val}`}
                      type="button"
                      onClick={() => toggleGroupValue(group.id, val)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D0E9C0]/60 text-[#1A3B2B] font-semibold"
                    >
                      <span>{val}</span>
                      <X className="w-3 h-3" />
                    </button>
                  ))
                )}
              </div>

              {filtersConfig.showSortDropdown && (
                <div className="flex items-center gap-2 text-xs">
                  <label htmlFor="desktop-sort-select" className="text-[#4F6355]">
                    Sort by:
                  </label>
                  <select
                    id="desktop-sort-select"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value as SortOption);
                      setCurrentPage(1);
                    }}
                    className="bg-white border border-[#BCD8AA] rounded px-3 py-1.5 text-xs text-[#1A3B2B] font-medium focus:outline-none focus:border-[#285A3C]"
                  >
                    <option value="featured">Featured</option>
                    <option value="popular">Most Popular</option>
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              )}
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg border border-[#E8DCCF] h-64 animate-pulse"
                  />
                ))}
              </div>
            ) : sortedProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border border-[#D8C7B5] p-8">
                <h2 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
                  No products found
                </h2>
                <p className="text-xs text-[#4F6355] mt-1">
                  {activeFilterCount > 0
                    ? 'Try adjusting your category, attribute, or price filters.'
                    : 'No active products are currently assigned to this collection.'}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="mt-4 bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 py-2 rounded text-xs font-semibold"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {paginatedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} showRating={true} />
                ))}
              </div>
            )}

            {/* Real Dynamic Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 pt-8">
                <button
                  type="button"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setCurrentPage(Math.max(1, safeCurrentPage - 1))}
                  aria-label="Previous page"
                  className="w-8 h-8 rounded bg-white border border-[#BCD8AA] disabled:opacity-40 text-[#1A3B2B] text-xs font-medium hover:bg-[#D0E9C0]/30 flex items-center justify-center"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded text-xs font-bold transition-colors ${
                      safeCurrentPage === pageNum
                        ? 'bg-[#285A3C] text-white'
                        : 'bg-white border border-[#BCD8AA] text-[#1A3B2B] hover:bg-[#D0E9C0]/30'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setCurrentPage(Math.min(totalPages, safeCurrentPage + 1))}
                  aria-label="Next page"
                  className="w-8 h-8 rounded bg-white border border-[#BCD8AA] disabled:opacity-40 text-[#1A3B2B] text-xs font-medium hover:bg-[#D0E9C0]/30 flex items-center justify-center"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer (Dynamic) */}
      {isMobileFilterOpen && isFiltersSidebarVisible && resolvedGroups.length > 0 && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full ml-auto shadow-xl flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
              <h2 className="font-bold text-sm text-[#1A3B2B] uppercase tracking-wider">
                {sidebarTitle}
              </h2>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X className="w-5 h-5 text-[#4F6355]" />
              </button>
            </div>

            <div className="py-4 space-y-6 flex-1 text-xs">
              {resolvedGroups.map((group) => {
                if (group.type === 'price_range') {
                  return (
                    <div key={group.id}>
                      <label
                        htmlFor={`mobile-filter-${group.id}`}
                        className="font-bold block mb-2 text-[#1A3B2B] uppercase"
                      >
                        {group.label}: Up to ₹{effectiveMaxPrice.toLocaleString('en-IN')}
                      </label>
                      <input
                        id={`mobile-filter-${group.id}`}
                        type="range"
                        min={priceMinBound}
                        max={ceilingPrice}
                        step={priceStep}
                        value={effectiveMaxPrice}
                        onChange={(e) => {
                          const next = Number(e.target.value);
                          setUserMaxPrice(next >= ceilingPrice ? null : next);
                          setCurrentPage(1);
                        }}
                        className="w-full accent-[#285A3C]"
                      />
                    </div>
                  );
                }

                const options = groupOptionsMap[group.id] || [];
                if (options.length === 0) return null;
                const picked = selectedGroupValues[group.id] || [];

                return (
                  <div key={group.id}>
                    <span className="font-bold block mb-2 text-[#1A3B2B] uppercase">
                      {group.label}
                    </span>
                    {options.map((opt) => (
                      <label key={opt} className="flex items-center gap-2 py-1 text-[#4F6355]">
                        <input
                          type="checkbox"
                          checked={picked.includes(opt)}
                          onChange={() => toggleGroupValue(group.id, opt)}
                          className="accent-[#285A3C]"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E8DCCF]">
              {filtersConfig.showClearAll && activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="w-full border border-[#D8C7B5] text-[#1A3B2B] py-2 rounded font-semibold text-xs"
                >
                  Clear All
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-full bg-[#285A3C] hover:bg-[#1E432D] text-white py-2.5 rounded font-semibold text-xs"
              >
                Show {sortedProducts.length} Products
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
