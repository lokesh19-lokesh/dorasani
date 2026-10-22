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
    <nav className="hidden lg:block bg-[#FFF9F5] border-b border-[#EEDCD1]/80 text-[13px] tracking-wider py-2 relative z-20">
      <div className="max-w-7xl mx-auto px-8">
        <ul className="flex items-center justify-center space-x-6 xl:space-x-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative py-1 font-medium transition-all duration-200 block ${
                    isActive
                      ? 'text-[#AC1443] font-semibold'
                      : 'text-[#441C25] hover:text-[#AC1443]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#AC1443] rounded-full animate-in fade-in" />
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
