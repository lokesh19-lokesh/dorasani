import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Category } from '../../types';
import { OptimizedPicture } from './OptimizedPicture';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const isFestive = category.slug === 'festive';

  return (
    <Link
      to={`/collections/${category.slug}`}
      className="group flex flex-col items-center text-center transition-all duration-300 w-full"
    >
      {/* Arch Shaped Image Container - Festive collection is slightly taller matching reference */}
      <div
        className={`w-full max-w-[130px] sm:max-w-[150px] arch-card-shape overflow-hidden border border-[#D8C7B5] shadow-xs group-hover:shadow-md group-hover:border-[#285A3C] transition-all duration-300 bg-[#FAF5EE] relative ${
          isFestive ? 'aspect-[3/4.4]' : 'aspect-[3/4]'
        }`}
      >
        {category.imageUrl ? (
          <OptimizedPicture
            src={category.imageUrl}
            alt={category.name}
            sizes="(max-width: 640px) 130px, 150px"
            pictureClassName="block w-full h-full"
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-106"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[#FAF5EE] to-[#E8DCCF]/75 flex flex-col items-center justify-center p-2 text-center">
            <span className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#285A3C] tracking-wider">
              {(category.name || 'D').charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Category Name & Action Arrow */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5 min-h-[32px]">
        {isFestive ? (
          <div className="text-center leading-tight">
            <span className="block text-xs sm:text-[13px] font-medium text-[#1A3B2B] group-hover:text-[#285A3C] transition-colors">
              Festive
            </span>
            <span className="block text-xs sm:text-[13px] font-medium text-[#1A3B2B] group-hover:text-[#285A3C] transition-colors">
              Collection
            </span>
          </div>
        ) : (
          <span className="text-xs sm:text-[13px] font-medium text-[#1A3B2B] group-hover:text-[#285A3C] transition-colors line-clamp-1 max-w-[115px] sm:max-w-[130px]">
            {category.name}
          </span>
        )}
        <div className="w-4 h-4 rounded-full border border-[#D8C7B5] group-hover:border-[#285A3C] group-hover:bg-[#285A3C] text-[#647268] group-hover:text-white flex items-center justify-center transition-all text-[9px] shrink-0">
          <ArrowRight className="w-2.5 h-2.5" />
        </div>
      </div>
    </Link>
  );
};
