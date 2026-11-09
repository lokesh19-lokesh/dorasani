import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { productService } from '../services/productService';
import type { Product } from '../types';

export const SearchResultsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    productService
      .getProducts({ search: query.trim() || undefined, limit: 60 })
      .then((res) => {
        if (!isMounted) return;
        setResults(res.products);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchInput.trim();
    if (clean) {
      setSearchParams({ q: clean });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Search Header Banner */}
      <div className="bg-[#D0E9C0]/40 border-b border-[#BCD8AA] py-8 sm:py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="max-w-xl mx-auto">
            <form onSubmit={handleSearch} className="relative flex items-center">
              <input
                type="search"
                aria-label="Search products"
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
                  aria-label="Clear search"
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
              {loading ? (
                <span>Searching DORASANI catalogue...</span>
              ) : (
                <>
                  Showing results for{' '}
                  <span className="font-bold text-[#285A3C]">"{query || 'all'}"</span> (
                  {results.length} {results.length === 1 ? 'product' : 'products'} found)
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-[#E8DCCF] h-64 animate-pulse"
              />
            ))}
          </div>
        ) : results.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-[#D8C7B5] p-8 max-w-lg mx-auto">
            <Search className="w-12 h-12 text-[#D8C7B5] mx-auto mb-3" />
            <h3 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
              No products found for "{query}"
            </h3>
            <p className="text-xs text-[#4F6355] mt-1">
              Try searching for terms like "silk", "organza", "kanchipuram", or "lehenga".
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
