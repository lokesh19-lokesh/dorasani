import React from 'react';
import { WishlistIcon, WishlistIconProps } from './WishlistIcon';

/**
 * Re-exporting WishlistIcon as WishlistHeart for backward compatibility
 */
export const WishlistHeart: React.FC<WishlistIconProps> = (props) => {
  return <WishlistIcon {...props} />;
};

export default WishlistHeart;
