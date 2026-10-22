import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Share2, MoreVertical, Trash2, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const WishlistPage: React.FC = () => {
  const { wishlist, removeFromWishlist, addToCart, moveAllToBag, showToast } = useStore();

  const handleShareWishlist = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My DORASANI Wishlist',
        text: 'Check out my favourite traditional styles on DORASANI!',
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Wishlist link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Wishlist Banner */}
      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-8 sm:py-12 px-4 sm:px-8 text-center sm:text-left">
        <div className="max-w-7xl mx-auto space-y-2">
          <h1 className="font-serif-royal text-2xl sm:text-4xl font-bold text-[#1A3B2B]">
            My Wishlist
          </h1>
          <p className="font-serif-royal text-xs sm:text-sm text-[#285A3C] italic">
            Your favourite picks, saved with love.
          </p>
          <p className="text-xs text-[#4F6355] max-w-xl leading-relaxed">
            Handpicked styles that reflect your taste and connect you to timeless South Indian tradition.
          </p>
        </div>
      </div>

      {/* 2. Main Wishlist Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {wishlist.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-xl border border-[#D8C7B5] p-8 max-w-md mx-auto">
            <Heart className="w-12 h-12 text-[#BCD8AA] mx-auto mb-3" />
            <h3 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
              Your wishlist is empty
            </h3>
            <p className="text-xs text-[#4F6355] mt-1">
              Explore our handcrafted sarees, lehengas, and festive wear to save your favourites.
            </p>
            <Link
              to="/shop"
              className="mt-5 inline-block bg-[#285A3C] text-white px-6 py-2.5 rounded text-xs font-semibold hover:bg-[#1E432D] transition-colors"
            >
              Explore Collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Items Grid */}
            <div className="lg:col-span-9 space-y-5">
              {/* Header Actions */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D8C7B5]">
                <span className="text-xs sm:text-sm font-semibold text-[#1A3B2B]">
                  {wishlist.length} Items in Wishlist
                </span>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleShareWishlist}
                    className="flex items-center gap-1.5 text-xs text-[#4F6355] hover:text-[#285A3C] font-medium"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share Wishlist</span>
                  </button>

                  <button
                    onClick={moveAllToBag}
                    className="bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs px-3.5 py-1.5 rounded font-semibold transition-colors shadow-xs"
                  >
                    Move All to Bag
                  </button>
                </div>
              </div>

              {/* Wishlist Product Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
                {wishlist.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-lg border border-[#D8C7B5] overflow-hidden flex flex-col justify-between group shadow-xs hover:shadow-md transition-all relative"
                  >
                    {/* Image */}
                    <div className="relative aspect-[4/5] bg-[#FAF5EE] overflow-hidden">
                      <Link to={`/products/${item.product.slug}`}>
                        <img
                          src={item.product.primaryImage}
                          alt={item.product.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {/* Remove from Wishlist Heart Button */}
                      <button
                        onClick={() => removeFromWishlist(item.product.id)}
                        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#285A3C] text-white flex items-center justify-center shadow-md transition-transform hover:scale-110"
                        title="Remove from Wishlist"
                      >
                        <Heart className="w-3.5 h-3.5 fill-current" />
                      </button>
                    </div>

                    {/* Details */}
                    <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
                      <div>
                        <Link
                          to={`/products/${item.product.slug}`}
                          className="font-semibold text-xs text-[#1A3B2B] hover:text-[#285A3C] line-clamp-1"
                        >
                          {item.product.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-xs sm:text-sm text-[#1A3B2B]">
                            ₹{item.product.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-[#8E9B92] line-through">
                            ₹{item.product.mrp.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Add to Bag action button */}
                      <div className="flex items-center gap-1.5 pt-2 border-t border-[#F5EAE2]">
                        <button
                          onClick={() => {
                            addToCart(item.product);
                            removeFromWishlist(item.product.id);
                          }}
                          className="flex-1 bg-[#FAF5EE] hover:bg-[#285A3C] text-[#285A3C] hover:text-white py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-[#BCD8AA]"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          <span>Add to Bag</span>
                        </button>
                        <button
                          onClick={() => removeFromWishlist(item.product.id)}
                          className="p-1.5 text-[#8E9B92] hover:text-[#285A3C]"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Promo Panel */}
            <div className="hidden lg:block lg:col-span-3 bg-[#FAF5EE] rounded-xl border border-[#D8C7B5] p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6 fill-current" />
              </div>
              <h3 className="font-serif-royal text-lg font-bold text-[#1A3B2B]">
                Your Wishlist Is Special
              </h3>
              <p className="text-xs text-[#4F6355] leading-relaxed">
                Save your favourite styles and shop them anytime. Tradition always stays close to your heart with DORASANI.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-[#285A3C] text-white text-xs font-semibold px-5 py-2.5 rounded shadow-sm hover:bg-[#1E432D] transition-colors"
              >
                <span>Continue Shopping</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
