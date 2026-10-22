import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { PRODUCTS } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || 'sarees';
  const [searchInput, setSearchInput] = useState(query);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({ q: '' });
  };

  const results = useMemo(() => {
    if (!query) return PRODUCTS;
    const lower = query.toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        p.title.toLowerCase().includes(lower) ||
        p.category.toLowerCase().includes(lower) ||
        p.fabric.toLowerCase().includes(lower) ||
        p.description.toLowerCase().includes(lower)
    );
  }, [query]);

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Search Header Banner */}
      <div className="bg-[#D0E9C0]/40 border-b border-[#BCD8AA] py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Active Search Bar in Banner */}
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for sarees, lehengas, silk..."
                className="w-full bg-white border border-[#D8C7B5] rounded-full py-2.5 pl-10 pr-10 text-sm text-[#1A3B2B] focus:outline-none focus:border-[#285A3C] shadow-xs"
              />
              <Search className="w-4 h-4 text-[#4F6355] absolute left-3.5" />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3.5 p-1 text-[#4F6355] hover:text-[#285A3C]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </form>
          </div>

          <div className="text-center pt-2">
            <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
              Search Results
            </h1>
            <p className="text-xs sm:text-sm text-[#4F6355] mt-1">
              Showing results for <span className="font-bold text-[#285A3C]">"{query || 'all'}"</span> ({results.length} products found)
            </p>
          </div>
        </div>
      </div>

      {/* 2. Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {results.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-[#D8C7B5] p-8 max-w-lg mx-auto">
            <Search className="w-12 h-12 text-[#D8C7B5] mx-auto mb-3" />
            <h3 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
              No products found for "{query}"
            </h3>
            <p className="text-xs text-[#4F6355] mt-1">
              Try searching for popular terms like "silk", "organza", "kanjivaram", or "lehenga".
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-block bg-[#285A3C] hover:bg-[#1E432D] text-white px-5 py-2 rounded text-xs font-semibold shadow-xs transition-colors"
            >
              Browse All Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {results.map((product) => (
              <ProductCard key={product.id} product={product} showRating={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

