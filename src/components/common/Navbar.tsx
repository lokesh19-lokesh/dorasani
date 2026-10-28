import React from 'react';
import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { name: 'Home', path: '/' },
  { name: 'Shop All', path: '/shop' },
  { name: 'Sarees', path: '/collections/sarees' },
  { name: 'Kurthis', path: '/collections/kurtis' },
  { name: 'Ethnic Wear', path: '/collections/ethnic-wear' },
  { name: 'Lehengas', path: '/collections/lehengas' },
  { name: 'Kids Wear', path: '/collections/kids-wear' },
  { name: 'Festive Collection', path: '/collections/festive' },
  { name: 'New Arrivals', path: '/collections/new-arrivals' },
  { name: 'Bestsellers', path: '/collections/bestsellers' },
  { name: 'Mythology & Heritage', path: '/heritage' },
  { name: 'About Us', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

export const Navbar: React.FC = () => {
  return (
    <nav className="hidden lg:block bg-transparent py-2 xl:py-2.5 relative z-10 w-full border-t border-[#96c89b]/60">
      <div className="max-w-[1360px] mx-auto px-4 flex justify-center">
        <ul className="flex items-center justify-center flex-nowrap whitespace-nowrap gap-x-1.5 lg:gap-x-2.5 xl:gap-x-4 2xl:gap-x-5">
          {NAV_ITEMS.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative py-1 px-2.5 xl:px-3 font-semibold text-[12.5px] lg:text-[13px] xl:text-[13.5px] tracking-wide transition-all duration-200 block rounded-full ${
                    isActive
                      ? 'text-[#06180c] font-bold bg-white/70 shadow-xs'
                      : 'text-[#0e311a] hover:text-[#06180c] hover:bg-white/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-2.5 right-2.5 h-[2px] bg-[#0e311a] rounded-full animate-in fade-in" />
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
