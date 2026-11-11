import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, AlertCircle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { getStockStatusMeta } from '../../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount, siteSettings } = useStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const freeThreshold = siteSettings.freeShippingThreshold;
  const hasStockIssues = cart.some((item) => {
    if (!item.selected) return false;
    const meta = getStockStatusMeta(
      item.product.stock,
      item.product.inStock ? 'active' : 'out_of_stock'
    );
    return meta.isOutOfStock || item.quantity > meta.qty;
  });

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FAF5EE] h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8DCCF] flex items-center justify-between bg-[#F5EFE6]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#285A3C]" />
            <h3 className="font-cinzel-royal font-bold text-base sm:text-lg text-[#1A3B2B]">
              Shopping Bag ({cartCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#647268] hover:text-[#285A3C] transition-colors"
            aria-label="Close Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Alert in Pastel Pistachio */}
        <div className="bg-[#D0E9C0] px-4 py-2 text-center text-xs text-[#1A3B2B] font-medium border-b border-[#BCD8AA]">
          {subtotal >= freeThreshold ? (
            <span>🎉 Congratulations! You have unlocked FREE Pan-India Shipping!</span>
          ) : (
            <span>
              Add ₹{(freeThreshold - subtotal).toLocaleString('en-IN')} more to unlock FREE
              Shipping!
            </span>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#E8DCCF]">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-[#647268]">
              <div className="w-16 h-16 rounded-full bg-[#F5EFE6] mx-auto flex items-center justify-center text-[#8E9B92] mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-semibold text-sm text-[#1A3B2B]">Your shopping bag is empty</p>
              <p className="text-xs mt-1">Discover our divine South Indian collections</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
                className="mt-5 bg-[#285A3C] text-white text-xs px-5 py-2.5 rounded font-medium hover:bg-[#1E432D] transition-colors shadow-xs"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const stockMeta = getStockStatusMeta(
                item.product.stock,
                item.product.inStock ? 'active' : 'out_of_stock'
              );
              const isAvailable = item.product.inStock && !stockMeta.isOutOfStock;
              const exceedsStock = isAvailable && item.quantity > stockMeta.qty;

              return (
                <div key={item.id} className="py-3 flex gap-3 sm:gap-4 items-center">
                  <img
                    src={item.product.primaryImage}
                    alt={item.product.title}
                    className="w-16 h-20 sm:w-20 sm:h-24 object-cover object-top rounded border border-[#E8DCCF] bg-[#FAF5EE] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-semibold text-[#1A3B2B] truncate">
                      {item.product.title}
                    </h4>
                    <p className="text-[11px] text-[#647268] mt-0.5">
                      Color: {item.selectedColor}
                    </p>
                    <p className="text-xs font-bold text-[#1A3B2B] mt-1">
                      ₹{item.product.price.toLocaleString('en-IN')}
                    </p>
                    {!isAvailable ? (
                      <p className="text-[10px] font-semibold text-rose-700 mt-0.5">
                        Out of Stock
                      </p>
                    ) : exceedsStock ? (
                      <p className="text-[10px] font-semibold text-rose-700 mt-0.5">
                        Only {stockMeta.qty} available — reduce qty
                      </p>
                    ) : stockMeta.isLowStock ? (
                      <p className="text-[10px] font-semibold text-amber-700 mt-0.5">
                        Only {stockMeta.qty} left ({stockMeta.shortageCount} less than 3)
                      </p>
                    ) : null}

                    {/* Quantity and Remove */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-[#D8C7B5] rounded bg-white text-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          aria-label={`Decrease quantity of ${item.product.title}`}
                          className="px-2 py-0.5 text-[#647268] hover:bg-[#FAF5EE]"
                        >
                          -
                        </button>
                        <span className="px-2 font-medium">{item.quantity}</span>
                        <button
                          type="button"
                          disabled={!isAvailable || item.quantity >= stockMeta.qty}
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label={`Increase quantity of ${item.product.title}`}
                          className="px-2 py-0.5 text-[#647268] hover:bg-[#FAF5EE] disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="text-[#8E9B92] hover:text-[#285A3C] p-1"
                        title="Remove Item"
                        aria-label={`Remove ${item.product.title} from bag`}
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#E8DCCF] bg-[#F5EFE6] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#647268]">Estimated Subtotal</span>
              <span className="font-bold text-[#1A3B2B] text-base">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            {hasStockIssues && (
              <p className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded px-2.5 py-1.5 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Adjust or remove out-of-stock items in your cart before checkout.</span>
              </p>
            )}

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/cart"
                onClick={onClose}
                className="w-full text-center border border-[#285A3C] text-[#285A3C] hover:bg-[#D0E9C0]/30 py-2.5 rounded font-medium text-xs transition-colors"
              >
                View Cart
              </Link>
              {hasStockIssues ? (
                <button
                  type="button"
                  disabled
                  className="w-full text-center bg-[#285A3C] text-white py-2.5 rounded font-medium text-xs opacity-45 cursor-not-allowed flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full text-center bg-[#285A3C] hover:bg-[#1E432D] text-white py-2.5 rounded font-medium text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
