import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SlidersHorizontal, ChevronDown, X, ChevronRight } from 'lucide-react';
import type { Product, SortOption } from '../../types';
import { ProductCard } from '../product/ProductCard';
import { SubpageHero } from '../common/SubpageHero';

interface SubCategory {
  name: string;
  slug: string;
  imageUrl?: string;
}

interface CollectionTemplateProps {
  title: string;
  subtitle: string;
  breadcrumbs: { name: string; path?: string }[];
  products: Product[];
  subCategories?: SubCategory[];
  desktopBanner?: string;
  mobileBanner?: string;
  bannerTag?: string;
  textPosition?: 'left' | 'right' | 'center';
  highlights?: string[];
  bannerImage?: string;
}

export const CollectionTemplate: React.FC<CollectionTemplateProps> = ({
  title,
  subtitle,
  breadcrumbs,
  products,
  subCategories,
  desktopBanner,
  mobileBanner,
  bannerTag,
  textPosition = 'left',
  highlights,
  bannerImage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFabric, setSelectedFabric] = useState<string[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Available filter options
  const fabrics = ['Silk', 'Cotton', 'Organza', 'Georgette', 'Velvet'];
  const occasions = ['Wedding', 'Festive', 'Party Wear', 'Daily Wear'];

  // Filtering logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
  }, [products, selectedFabric, selectedOccasion, maxPrice]);

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

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedFabric([]);
    setSelectedOccasion([]);
    setMaxPrice(30000);
    setSortBy('featured');
  };

  const activeFilterCount =
    (selectedFabric.length > 0 ? selectedFabric.length : 0) +
    (selectedOccasion.length > 0 ? selectedOccasion.length : 0) +
    (maxPrice < 30000 ? 1 : 0);

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
            {/* Breadcrumbs */}
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

            {/* Banner Title & Description */}
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

      {/* Sub-categories horizontal bar (if provided, like on Sarees / Ethnic Wear page) */}
      {subCategories && subCategories.length > 0 && (
        <div className="bg-[#FAF5EE]/70 border-b border-[#D8C7B5] py-3.5 px-4 sm:px-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="text-[11px] font-bold tracking-[0.2em] text-[#1A3B2B] uppercase flex items-center gap-1.5 shrink-0">
              <span className="text-[#C99632]">✦</span>
              <span>Explore Categories</span>
              <span className="text-[#C99632]">✦</span>
            </div>
            <div className="overflow-x-auto no-scrollbar flex items-center gap-4 sm:gap-6 py-1">
              {subCategories.map((sub) => (
                <div
                  key={sub.slug}
                  className="flex flex-col items-center shrink-0 cursor-pointer group"
                >
                  <div className="w-13 h-13 sm:w-15 sm:h-15 rounded-full overflow-hidden border border-[#D8C7B5] group-hover:border-[#285A3C] shadow-xs transition-all">
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
                  <span className="text-[11px] font-medium text-[#1A3B2B] group-hover:text-[#285A3C] mt-1.5 text-center max-w-[80px] line-clamp-1">
                    {sub.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Content: Sidebar Filters + Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Mobile Filter & Sort Bar */}
        <div className="lg:hidden flex items-center justify-between pb-4 border-b border-[#D8C7B5] mb-6">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="flex items-center gap-2 text-xs font-semibold text-[#1A3B2B] bg-[#F5EFE6] px-3.5 py-2 rounded-md border border-[#BCD8AA]"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#285A3C]" />
            <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
          </button>

          <span className="text-xs text-[#4F6355]">
            {sortedProducts.length} Products
          </span>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
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
                  onClick={clearAllFilters}
                  className="text-xs text-[#285A3C] hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase">
                Price Range
              </label>
              <div className="flex justify-between text-xs text-[#4F6355]">
                <span>₹500</span>
                <span>₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="500"
                max="30000"
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#285A3C] cursor-pointer"
              />
            </div>

            {/* Fabric */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase">
                Fabric
              </label>
              <div className="space-y-1.5 text-xs text-[#4F6355]">
                {fabrics.map((f) => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer hover:text-[#285A3C]">
                    <input
                      type="checkbox"
                      checked={selectedFabric.includes(f)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedFabric([...selectedFabric, f]);
                        } else {
                          setSelectedFabric(selectedFabric.filter((item) => item !== f));
                        }
                      }}
                      className="accent-[#285A3C] rounded"
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Occasion */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#1A3B2B] tracking-wide uppercase">
                Occasion
              </label>
              <div className="space-y-1.5 text-xs text-[#4F6355]">
                {occasions.map((occ) => (
                  <label key={occ} className="flex items-center gap-2 cursor-pointer hover:text-[#285A3C]">
                    <input
                      type="checkbox"
                      checked={selectedOccasion.includes(occ)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedOccasion([...selectedOccasion, occ]);
                        } else {
                          setSelectedOccasion(selectedOccasion.filter((item) => item !== occ));
                        }
                      }}
                      className="accent-[#285A3C] rounded"
                    />
                    <span>{occ}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Products Grid Area */}
          <main className="lg:col-span-9 space-y-6">
            {/* Top Bar (Showing count & Sort dropdown) */}
            <div className="hidden lg:flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
              <span className="text-xs text-[#4F6355] font-medium">
                Showing 1-{sortedProducts.length} of {products.length} products
              </span>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#4F6355]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
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
            {sortedProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-xl border border-[#D8C7B5] p-8">
                <h3 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
                  No products match your selected filters
                </h3>
                <p className="text-xs text-[#4F6355] mt-1">
                  Try adjusting your price range or fabric options.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-4 bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 py-2 rounded text-xs font-semibold"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {sortedProducts.map((p) => (
                  <ProductCard key={p.id} product={p} showRating={true} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {sortedProducts.length > 0 && (
              <div className="flex items-center justify-center space-x-1 sm:space-x-2 pt-8">
                <button
                  onClick={() => setCurrentPage(1)}
                  className="w-8 h-8 rounded bg-[#285A3C] text-white text-xs font-bold"
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className="w-8 h-8 rounded bg-white border border-[#BCD8AA] text-[#1A3B2B] text-xs font-medium hover:bg-[#D0E9C0]/30"
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className="w-8 h-8 rounded bg-white border border-[#BCD8AA] text-[#1A3B2B] text-xs font-medium hover:bg-[#D0E9C0]/30"
                >
                  3
                </button>
                <button
                  onClick={() => setCurrentPage(4)}
                  className="w-8 h-8 rounded bg-white border border-[#BCD8AA] text-[#1A3B2B] text-xs font-medium hover:bg-[#D0E9C0]/30"
                >
                  4
                </button>
                <span className="px-2 text-xs text-[#8E9B92]">...</span>
                <button
                  onClick={() => setCurrentPage(28)}
                  className="w-8 h-8 rounded bg-white border border-[#BCD8AA] text-[#1A3B2B] text-xs font-medium hover:bg-[#D0E9C0]/30"
                >
                  28
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, 28))}
                  className="w-8 h-8 rounded bg-white border border-[#BCD8AA] text-[#1A3B2B] text-xs font-medium hover:bg-[#D0E9C0]/30 flex items-center justify-center"
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
              <button onClick={() => setIsMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-[#4F6355]" />
              </button>
            </div>

            <div className="py-4 space-y-6 flex-1 text-xs">
              {/* Mobile Price */}
              <div>
                <label className="font-bold block mb-2 text-[#1A3B2B]">Price: Up to ₹{maxPrice.toLocaleString('en-IN')}</label>
                <input
                  type="range"
                  min="500"
                  max="30000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#285A3C]"
                />
              </div>

              {/* Mobile Fabric */}
              <div>
                <label className="font-bold block mb-2 text-[#1A3B2B]">Fabric</label>
                {fabrics.map((f) => (
                  <label key={f} className="flex items-center gap-2 py-1 text-[#4F6355]">
                    <input
                      type="checkbox"
                      checked={selectedFabric.includes(f)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedFabric([...selectedFabric, f]);
                        else setSelectedFabric(selectedFabric.filter((item) => item !== f));
                      }}
                      className="accent-[#285A3C]"
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(false)}
              className="w-full bg-[#285A3C] hover:bg-[#1E432D] text-white py-2.5 rounded font-semibold text-xs"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
