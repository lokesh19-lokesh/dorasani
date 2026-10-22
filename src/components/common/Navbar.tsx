import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Shop All', path: '/shop' },
  { name: 'Sarees', path: '/collections/sarees' },
  { name: 'Ethnic Wear', path: '/collections/ethnic-wear' },
  { name: 'Lehengas', path: '/collections/lehengas' },
  { name: 'Festive Collection', path: '/collections/festive' },
  { name: 'New Arrivals', path: '/collections/new-arrivals' },
  { name: 'Bestsellers', path: '/collections/bestsellers' },
  { name: 'Mythology & Heritage', path: '/heritage' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  return (
    <nav className="hidden lg:block bg-transparent py-2 xl:py-2.5 relative z-10 w-full">
      <div className="max-w-[1280px] mx-auto px-4 flex justify-center">
        <ul className="inline-flex items-center justify-center flex-nowrap whitespace-nowrap gap-x-1.5 lg:gap-x-2.5 xl:gap-x-4 2xl:gap-x-5 bg-[#FAF5EE]/90 backdrop-blur-md px-3.5 lg:px-4 xl:px-6 py-1 xl:py-1.5 rounded-full border border-[#D8C7B5] shadow-xs">
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative py-0.5 px-1.5 xl:px-2 font-semibold text-[11.5px] lg:text-[12px] xl:text-[12.8px] tracking-wide transition-all duration-200 block rounded-full ${
                    isActive
                      ? 'text-[#113520] font-bold bg-[#D0E9C0]/60'
                      : 'text-[#18482C] hover:text-[#0D2818] hover:bg-white/60'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-1.5 right-1.5 h-[2px] bg-[#18482C] rounded-full animate-in fade-in" />
                    )}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
