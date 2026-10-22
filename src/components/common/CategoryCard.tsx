import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/collections/${category.slug}`}
      className="group flex flex-col items-center text-center transition-all duration-300"
    >
      {/* Arch Shaped Image Container */}
      <div className="w-full aspect-[3/4] max-w-[130px] sm:max-w-[150px] arch-card-shape overflow-hidden border border-[#DEC3B4] shadow-xs group-hover:shadow-md group-hover:border-[#AC1443] transition-all duration-300 bg-[#FDF4EC] relative">
        <img
          src={category.imageUrl}
          alt={category.name}
          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Category Name & Action Arrow */}
      <div className="mt-2.5 flex items-center justify-center gap-1.5">
        <span className="text-xs sm:text-[13px] font-medium text-[#2D141A] group-hover:text-[#AC1443] transition-colors">
          {category.name}
        </span>
        <div className="w-4 h-4 rounded-full border border-[#DEC3B4] group-hover:border-[#AC1443] group-hover:bg-[#AC1443] text-[#74565D] group-hover:text-white flex items-center justify-center transition-all text-[9px]">
          <ArrowRight className="w-2.5 h-2.5" />
        </div>
      </div>
    </Link>
  );
};
