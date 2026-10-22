import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center py-16 px-4 sm:px-8 text-center bg-[#FAF5EE]">
      <div className="max-w-md mx-auto space-y-4">
        <span className="font-cinzel-royal text-6xl font-bold text-[#285A3C] block">
          404
        </span>
        <h1 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B]">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-[#4F6355] leading-relaxed">
          The page you are looking for may have been moved or does not exist. Discover our timeless sarees and festive collections instead.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs font-semibold px-6 py-2.5 rounded shadow-sm transition-colors mt-2"
        >
          <span>Return to Homepage</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

