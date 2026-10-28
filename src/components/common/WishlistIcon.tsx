import React from 'react';

export interface WishlistIconProps {
  className?: string;
  filled?: boolean;
  color?: string;
  strokeWidth?: number;
}

/**
 * Luxury Fashion Bookmark / Ribbon Icon (Zara / Massimo Dutti / COS style)
 * Represents saving curated heritage items to the personal wishlist.
 */
export const WishlistIcon: React.FC<WishlistIconProps> = ({
  className = 'w-4 h-4',
  filled = false,
  color,
  strokeWidth = 1.75,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? (color || 'currentColor') : 'none'}
      stroke={color || 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} transition-all duration-200`}
      aria-hidden="true"
    >
      <path d="m19 21-7-4.5-7 4.5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
};

export default WishlistIcon;
