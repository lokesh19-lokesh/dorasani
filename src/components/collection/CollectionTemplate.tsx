import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Product, SortOption } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { SubpageHero } from '../common/SubpageHero';
import { productService } from '../../services/productService';

interface SubCategory {
  name: string;
  slug: string;
  imageUrl?: string;
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
}

const ITEMS_PER_PAGE = 12;

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
}) => {
  const [liveProducts, setLiveProducts] = useState<Product[]>(products);
  const [liveSubCategories, setLiveSubCategories] = useState<SubCategory[] | undefined>(
    subCategories
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubCategorySlug, setSelectedSubCategorySlug] = useState<string | null>(null);

  const [selectedFabric, setSelectedFabric] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Reset subcategory & filters when switching collection route
  useEffect(() => {
    setSelectedSubCategorySlug(null);
    setSelectedFabric([]);
    setSelectedOccasion([]);
    setMaxPrice(30000);
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
        const highestPrice = res.products.reduce(
          (max, p) => (p.price > max ? p.price : max),
          30000
        );
        const roundedMax = Math.ceil(highestPrice / 1000) * 1000;
        setMaxPrice((prev) => (prev < roundedMax ? roundedMax : prev));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [categorySlug, selectedSubCategorySlug, isFestive, isNew, isBestseller]);

  // Fetch subcategories (or top showcase categories when on /shop) dynamically
  useEffect(() => {
    let isMounted = true;
    if (categorySlug && categorySlug !== 'all') {
      productService.getCategoryBySlug(categorySlug).then((cat) => {
        if (!isMounted) return;
        if (cat && cat.subcategories && cat.subcategories.length > 0) {
          setLiveSubCategories(cat.subcategories);
        } else {
          setLiveSubCategories(undefined);
        }
      });
    } else if (categorySlug === 'all') {
      productService.getCategories().then((cats) => {
        if (!isMounted) return;
        setLiveSubCategories(
          cats
            .filter((c) => c.slug !== 'new-arrivals' && c.slug !== 'bestsellers')
            .map((c) => ({
              name: c.name,
              slug: c.slug,
              imageUrl: c.imageUrl,
            }))
        );
      });
    }
    return () => {
      isMounted = false;
    };
  }, [categorySlug]);

  // Derive available fabric and occasion filters dynamically from loaded products
  const fabrics = useMemo(() => {
    return Array.from(
      new Set(liveProducts.map((p) => p.fabric?.trim()).filter(Boolean) as string[])
    ).sort();
  }, [liveProducts]);

  const occasions = useMemo(() => {
    return Array.from(
      new Set(liveProducts.map((p) => p.occasion?.trim()).filter(Boolean) as string[])
    ).sort();
  }, [liveProducts]);

  const ceilingPrice = useMemo(() => {
    const maxFound = liveProducts.reduce((m, p) => Math.max(m, p.price), 30000);
    return Math.max(30000, Math.ceil(maxFound / 1000) * 1000);
  }, [liveProducts]);

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return liveProducts.filter((p) => {
      if (selectedFabric.length > 0 && !selectedFabric.includes(p.fabric)) {
        return false;
      }
      if (selectedOccasion.length > 0 && !selectedOccasion.includes(p.occasion)) {
        return false;
      }
      if (p.price > maxPrice) {
        return false;
      }
      return true;
    });
  }, [liveProducts, selectedFabric, selectedOccasion, maxPrice]);

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

  const clearAllFilters = () => {
    setSelectedSubCategorySlug(null);
    setSelectedFabric([]);
    setSelectedOccasion([]);
    setMaxPrice(ceilingPrice);
    setSortBy('featured');
    setCurrentPage(1);
  };

  const activeFilterCount =
    (selectedSubCategorySlug ? 1 : 0) +
    selectedFabric.length +
    selectedOccasion.length +
    (maxPrice < ceilingPrice ? 1 : 0);

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* 1. Hero Banner */}
      {desktopBanner || mobileBanner || bannerImage ? (
        <SubpageHero
          desktopImage={desktopBanner || bannerImage || mobileBanner || ''}
          mobileImage={mobileBanner || desktopBanner || bannerImage || ''}
          tag={bannerTag}
          title={title}
          subtitle={subtitle}
          breadcrumbs={breadcrumbs}
          textPosition={textPosition}
          highlights={highlights}
        />
      ) : (
        <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] pt-4 pb-8 sm:pb-12 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto space-y-4">
            <nav className="flex items-center space-x-1.5 text-xs text-[#4F6355]">
              {breadcrumbs.map((crumb, idx) => (
                <React.Fragment key={crumb.name}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />}
                  {crumb.path ? (
                    <Link to={crumb.path} className="hover:text-[#285A3C]">
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#285A3C]">{crumb.name}</span>
                  )}
                </React.Fragment>
              ))}
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

      {/* Sub-categories horizontal bar (dynamically fetched & interactive) */}
      {liveSubCategories && liveSubCategories.length > 0 && (
        <div className="bg-[#FAF5EE]/70 border-b border-[#D8C7B5] py-3.5 px-4 sm:px-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#1A3B2B] uppercase flex items-center gap-1.5 shrink-0">
              <span className="text-[#C99632]">✦</span>
              <span>Explore Categories</span>
              <span className="text-[#C99632]">✦</span>
            </div>
            <div className="overflow-x-auto no-scrollbar flex items-center gap-4 sm:gap-6 py-1">
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
                      className={`w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border-2 shadow-xs transition-all ${
                        isSelected
                          ? 'border-[#18482C] ring-2 ring-[#285A3C]/40 scale-105'
                          : 'border-[#D8C7B5] group-hover:border-[#285A3C]'
                      }`}
                    >
                      {sub.imageUrl ? (
                        <img
                          src={sub.imageUrl}
                          alt={sub.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#D0E9C0]/50 flex items-center justify-center text-[#285A3C] font-bold text-xs">
                          {sub.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-[11px] mt-1.5 text-center max-w-[84px] line-clamp-1 ${
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
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#D8C7B5] mb-6">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-[#1A3B2B] bg-[#F5EFE6] px-3.5 py-2 rounded-md border border-[#BCD8AA]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#285A3C]" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <span className="text-xs text-[#4F6355]">
            {loading ? 'Loading...' : `${sortedProducts.length} Products`}
          </span>

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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-3 bg-white p-5 rounded-xl border border-[#D8C7B5] shadow-xs space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-[#E8DCCF] pb-3">
              <h3 className="font-cinzel-royal font-bold text-sm text-[#1A3B2B] tracking-wider uppercase">
                Filters
              </h3>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs text-[#285A3C] hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label
                htmlFor="desktop-max-price"
                className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase block"
              >
                Price Range
              </label>
              <div className="flex justify-between text-xs text-[#4F6355]">
                <span>₹500</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                id="desktop-max-price"
                type="range"
                min="500"
                max={ceilingPrice}
                step="500"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full accent-[#285A3C] cursor-pointer"
              />
            </div>

            {/* Dynamic Fabric Filters */}
            {fabrics.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase block">
                  Fabric
                </span>
                <div className="space-y-1.5 text-xs text-[#4F6355]">
                  {fabrics.map((f) => (
                    <label
                      key={f}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#285A3C]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedFabric.includes(f)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFabric([...selectedFabric, f]);
                          } else {
                            setSelectedFabric(selectedFabric.filter((item) => item !== f));
                          }
                          setCurrentPage(1);
                        }}
                        className="accent-[#285A3C] rounded"
                      />
                      <span>{f}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Occasion Filters */}
            {occasions.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase block">
                  Occasion
                </span>
                <div className="space-y-1.5 text-xs text-[#4F6355]">
                  {occasions.map((occ) => (
                    <label
                      key={occ}
                      className="flex items-center gap-2 cursor-pointer hover:text-[#285A3C]"
                    >
                      <input
                        type="checkbox"
                        checked={selectedOccasion.includes(occ)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedOccasion([...selectedOccasion, occ]);
                          } else {
                            setSelectedOccasion(
                              selectedOccasion.filter((item) => item !== occ)
                            );
                          }
                          setCurrentPage(1);
                        }}
                        className="accent-[#285A3C] rounded"
                      />
                      <span>{occ}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Products Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Bar (Showing count & Sort dropdown) */}
            <div className="hidden lg:flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
              <div className="flex items-center gap-3 text-xs text-[#4F6355] font-medium">
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
              </div>

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
                <h3 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
                  No products found
                </h3>
                <p className="text-xs text-[#4F6355] mt-1">
                  {activeFilterCount > 0
                    ? 'Try adjusting your category, fabric, or price filters.'
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
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setIsMobileFilterOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-white h-full ml-auto shadow-xl flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
              <h3 className="font-bold text-sm text-[#1A3B2B]">Filters</h3>
              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setIsMobileFilterOpen(false)}
              >
                <X className="w-5 h-5 text-[#4F6355]" />
              </button>
            </div>

            <div className="py-4 space-y-6 flex-1 text-xs">
              <div>
                <label
                  htmlFor="mobile-max-price"
                  className="font-bold block mb-2 text-[#1A3B2B]"
                >
                  Price: Up to ₹{maxPrice.toLocaleString('en-IN')}
                </label>
                <input
                  id="mobile-max-price"
                  type="range"
                  min="500"
                  max={ceilingPrice}
                  step="500"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-[#285A3C]"
                />
              </div>

              {fabrics.length > 0 && (
                <div>
                  <span className="font-bold block mb-2 text-[#1A3B2B]">Fabric</span>
                  {fabrics.map((f) => (
                    <label key={f} className="flex items-center gap-2 py-1 text-[#4F6355]">
                      <input
                        type="checkbox"
                        checked={selectedFabric.includes(f)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedFabric([...selectedFabric, f]);
                          else
                            setSelectedFabric(selectedFabric.filter((item) => item !== f));
                          setCurrentPage(1);
                        }}
                        className="accent-[#285A3C]"
                      />
                      <span>{f}</span>
                    </label>
                  ))}
                </div>
              )}

              {occasions.length > 0 && (
                <div>
                  <span className="font-bold block mb-2 text-[#1A3B2B]">Occasion</span>
                  {occasions.map((occ) => (
                    <label key={occ} className="flex items-center gap-2 py-1 text-[#4F6355]">
                      <input
                        type="checkbox"
                        checked={selectedOccasion.includes(occ)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedOccasion([...selectedOccasion, occ]);
                          else
                            setSelectedOccasion(
                              selectedOccasion.filter((item) => item !== occ)
                            );
                          setCurrentPage(1);
                        }}
                        className="accent-[#285A3C]"
                      />
                      <span>{occ}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-[#E8DCCF]">
              {activeFilterCount > 0 && (
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
