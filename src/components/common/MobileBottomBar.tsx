import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Sparkles, LayoutGrid, Heart, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const MobileBottomBar: React.FC = () => {
  const { wishlistCount } = useStore();

  const navItems = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Shop', path: '/shop', icon: Sparkles },
    { name: 'Categories', path: '/collections/sarees', icon: LayoutGrid },
    { name: 'Wishlist', path: '/wishlist', icon: Heart, badge: wishlistCount },
    { name: 'Account', path: '/account', icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF5EE] border-t border-[#E8DCCF] shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-[10px] tracking-wide font-medium relative transition-colors ${
                  isActive
                    ? 'text-[#285A3C] font-semibold'
                    : 'text-[#1A3B2B] hover:text-[#285A3C]'
                }`
              }
            >
              <div className="relative">
                <Icon className="w-5 h-5 mb-0.5" />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-2 bg-[#285A3C] text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
