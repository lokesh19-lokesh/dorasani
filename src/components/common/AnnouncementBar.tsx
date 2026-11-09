import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, RotateCcw, ShieldCheck, Headphones, LayoutDashboard, Shield } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AnnouncementBar: React.FC = () => {
  const { user, siteSettings } = useStore();
  const formattedThreshold = siteSettings.freeShippingThreshold.toLocaleString('en-IN');
  const resolvedItems = (siteSettings.announcementItems || []).map((item) =>
    item.replace(/\{threshold\}/gi, formattedThreshold)
  );
  const desktopItems = resolvedItems.slice(0, 4);
  const mobileItems = resolvedItems.slice(0, 3);
  const announcementIcons = [Truck, RotateCcw, ShieldCheck, Headphones];

  return (
    <div className="relative z-40 w-full overflow-hidden">
      {/* Admin Mode Switcher Strip (Visible only to authenticated DB admins) */}
      {user?.isAdmin && (
        <div className="bg-[#18482C] text-[#FAF5EE] text-[11px] sm:text-xs py-1.5 px-3 sm:px-8 lg:px-12 border-b border-[#0F311D]">
          <div className="w-full flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D0E9C0] text-[#113520] font-bold text-[10px] uppercase tracking-wider shrink-0">
                <Shield className="w-3 h-3" />
                <span>{(user.role || 'admin').replace(/_/g, ' ')}</span>
              </span>
              <span className="truncate text-[#D0E9C0] font-medium">
                Signed in as <strong className="text-white">{user.email}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D0E9C0] hover:bg-white text-[#113520] font-bold text-[10.5px] sm:text-[11px] transition-colors shadow-xs whitespace-nowrap"
              >
                <LayoutDashboard className="w-3 h-3" />
                <span>Open Admin Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="bg-[#D0E9C0] text-[#18482C] text-[11px] sm:text-[12px] py-1.5 sm:py-2 px-3 sm:px-8 lg:px-12 tracking-wide border-b border-[#BCD8AA]">
        {/* Desktop Announcement Bar */}
        <div className="hidden sm:flex w-full items-center justify-between">
          {/* Left Perks */}
          <div className="flex items-center space-x-3 sm:space-x-5 py-0.5 font-medium">
            {desktopItems.map((label, idx) => {
              const Icon = announcementIcons[idx] || ShieldCheck;
              const hideOnSmallDesktop = idx === 3;
              return (
                <React.Fragment key={`${label}-${idx}`}>
                  {idx > 0 && (
                    <span
                      className={`${hideOnSmallDesktop ? 'hidden md:inline' : ''} text-[#18482C]/30 font-light`}
                    >
                      |
                    </span>
                  )}
                  <span
                    className={`${
                      hideOnSmallDesktop ? 'hidden md:flex' : 'flex'
                    } items-center gap-1.5 whitespace-nowrap`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#18482C]" /> {label}
                  </span>
                </React.Fragment>
              );
            })}
          </div>

          {/* Right Utility Links */}
          <div className="flex items-center space-x-3 sm:space-x-4 shrink-0 text-[#18482C] font-medium ml-4">
            <Link to="/track-order" className="hover:text-[#113520] transition-colors whitespace-nowrap">
              Track Order
            </Link>
            <span className="text-[#18482C]/30 font-light">|</span>
            <Link to="/faq" className="hover:text-[#113520] transition-colors whitespace-nowrap">
              Help
            </Link>
          </div>
        </div>

        {/* Mobile Clean Announcement Bar - No scrollbar, elegant compact perks */}
        <div className="sm:hidden flex items-center justify-between py-0.5 text-[10.5px] font-medium">
          {mobileItems.map((label, idx) => {
            const Icon = announcementIcons[idx] || ShieldCheck;
            return (
              <React.Fragment key={`m-${label}-${idx}`}>
                {idx > 0 && <span className="text-[#18482C]/25">•</span>}
                <span className="flex items-center gap-1 whitespace-nowrap text-[#18482C]">
                  <Icon className="w-3 h-3 text-[#18482C]" /> {label}
                </span>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
};
