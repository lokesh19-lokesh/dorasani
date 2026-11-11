import React, { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';

const DEFAULT_COLLECTION_NAV_ITEMS = [
  { name: 'Sarees', path: '/collections/sarees' },
  { name: 'Kurthis', path: '/collections/kurtis' },
  { name: 'Ethnic Wear', path: '/collections/ethnic-wear' },
  { name: 'Lehengas', path: '/collections/lehengas' },
  { name: 'Kids Wear', path: '/collections/kids-wear' },
  { name: 'Festive Collection', path: '/collections/festive' },
  { name: 'New Arrivals', path: '/collections/new-arrivals' },
  { name: 'Bestsellers', path: '/collections/bestsellers' },
];

export const Navbar: React.FC = () => {
  const { storeCategories } = useStore();

  const navItems = useMemo(() => {
    const dynamicCollections =
      storeCategories.length > 0
        ? storeCategories
            .filter((c) => c.slug !== 'silk-sarees')
            .map((c) => ({
              name: c.name,
              path: `/collections/${c.slug}`,
            }))
        : DEFAULT_COLLECTION_NAV_ITEMS;

    return [
      { name: 'Home', path: '/' },
      { name: 'Shop All', path: '/shop' },
      ...dynamicCollections,
      { name: 'Mythology & Heritage', path: '/heritage' },
      { name: 'About Us', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ];
  }, [storeCategories]);

  return (
    <nav
      aria-label="Primary"
      className="hidden lg:block bg-transparent py-1.5 xl:py-2 relative z-10 w-full border-t border-[#96c89b]/60"
    >
      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-6 overflow-x-auto scrollbar-none">
        <ul className="mx-auto w-max flex items-center flex-nowrap whitespace-nowrap gap-x-0.5 lg:gap-x-1 xl:gap-x-2 2xl:gap-x-3.5 py-1">
          {navItems.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `relative py-1 px-1.5 lg:px-2 xl:px-2.5 font-semibold text-[11.5px] xl:text-[12.5px] 2xl:text-[13px] tracking-wide transition-all duration-200 block rounded-full ${
                    isActive
                      ? 'text-[#06180c] font-bold bg-white/75 shadow-xs'
                      : 'text-[#0e311a] hover:text-[#06180c] hover:bg-white/40'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.name}</span>
                    {isActive && (
                      <span className="absolute -bottom-0.5 left-2 right-2 h-[2px] bg-[#0e311a] rounded-full animate-in fade-in" />
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
