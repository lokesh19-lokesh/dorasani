import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose }) => {
  const { cart, updateQuantity, removeFromCart, subtotal, cartCount } = useStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-[#FFF9F5] h-full shadow-2xl flex flex-col z-10">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#EEDCD1] flex items-center justify-between bg-[#FDF4EC]">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-[#AC1443]" />
            <h3 className="font-cinzel-royal font-bold text-base sm:text-lg text-[#2D141A]">
              Shopping Bag ({cartCount})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#74565D] hover:text-[#AC1443] transition-colors"
            aria-label="Close Bag"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Alert */}
        <div className="bg-[#FBE5EB] px-4 py-2 text-center text-xs text-[#AC1443] font-medium border-b border-[#EEDCD1]">
          {subtotal >= 999 ? (
            <span>🎉 Congratulations! You have unlocked FREE Pan-India Shipping!</span>
          ) : (
            <span>Add ₹{(999 - subtotal).toLocaleString('en-IN')} more to unlock FREE Shipping!</span>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 divide-y divide-[#EEDCD1]">
          {cart.length === 0 ? (
            <div className="py-16 text-center text-[#74565D]">
              <div className="w-16 h-16 rounded-full bg-[#FDF4EC] mx-auto flex items-center justify-center text-[#9B8086] mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-semibold text-sm text-[#2D141A]">Your shopping bag is empty</p>
              <p className="text-xs mt-1">Discover our divine South Indian collections</p>
              <button
                onClick={() => {
                  onClose();
                  navigate('/shop');
                }}
                className="mt-5 bg-[#AC1443] text-white text-xs px-5 py-2.5 rounded font-medium hover:bg-[#860E33] transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="py-3 flex gap-3 sm:gap-4 items-center">
                <img
                  src={item.product.primaryImage}
                  alt={item.product.title}
                  className="w-16 h-20 sm:w-20 sm:h-24 object-cover object-top rounded border border-[#EEDCD1] bg-[#FAF2EB] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-semibold text-[#2D141A] truncate">
                    {item.product.title}
                  </h4>
                  <p className="text-[11px] text-[#74565D] mt-0.5">
                    Color: {item.selectedColor}
                  </p>
                  <p className="text-xs font-bold text-[#AC1443] mt-1">
                    ₹{item.product.price.toLocaleString('en-IN')}
                  </p>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-[#DEC3B4] rounded bg-white text-xs">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="px-2 py-0.5 text-[#74565D] hover:bg-[#FAF0E6]"
                      >
                        -
                      </button>
                      <span className="px-2 font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="px-2 py-0.5 text-[#74565D] hover:bg-[#FAF0E6]"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#9B8086] hover:text-[#AC1443] p-1"
                      title="Remove Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-[#EEDCD1] bg-[#FDF4EC] space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#74565D]">Estimated Subtotal</span>
              <span className="font-bold text-[#2D141A] text-base">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                to="/cart"
                onClick={onClose}
                className="w-full text-center border border-[#AC1443] text-[#AC1443] hover:bg-[#FBE5EB] py-2.5 rounded font-medium text-xs transition-colors"
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                onClick={onClose}
                className="w-full text-center bg-[#AC1443] hover:bg-[#860E33] text-white py-2.5 rounded font-medium text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                <span>Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
