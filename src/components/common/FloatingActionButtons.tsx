import React, { useEffect, useState, useCallback } from 'react';
import { ArrowUp } from 'lucide-react';

const WHATSAPP_NUMBER = '917780673360';
const WHATSAPP_DEFAULT_MESSAGE =
  'Hello DORASANI, I would like assistance with your sarees and collections.';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  WHATSAPP_DEFAULT_MESSAGE
)}`;

export const FloatingActionButtons: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 280);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, []);

  return (
    <div className="fixed right-4 sm:right-6 bottom-[74px] lg:bottom-6 z-40 flex flex-col items-center gap-3 pointer-events-none">
      {/* Scroll to Top Button */}
      <button
        type="button"
        onClick={handleScrollToTop}
        aria-label="Scroll back to top"
        title="Back to top"
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
        className={`group relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#18482C] hover:bg-[#113520] text-white border border-[#C29336]/70 shadow-lg flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C29336] focus-visible:ring-offset-2 ${
          showScrollTop
            ? 'opacity-100 translate-y-0 pointer-events-auto cursor-pointer'
            : 'opacity-0 translate-y-3 pointer-events-none'
        }`}
      >
        <ArrowUp
          className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5"
          aria-hidden="true"
        />
        <span className="hidden sm:block pointer-events-none absolute right-full mr-2.5 whitespace-nowrap rounded-md bg-[#1A3B2B] px-2.5 py-1 text-[11px] font-semibold text-white shadow-md opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          Back to top
        </span>
      </button>

      {/* WhatsApp Floating Chat Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with DORASANI on WhatsApp (+91 7780673360)"
        title="Chat on WhatsApp"
        className="group relative pointer-events-auto w-12 h-12 sm:w-[52px] sm:h-[52px] rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white shadow-[0_6px_20px_rgba(37,211,102,0.42)] flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
      >
        <svg
          className="w-6 h-6 sm:w-7 sm:h-7 fill-current"
          viewBox="0 0 32 32"
          aria-hidden="true"
        >
          <path d="M16.002 3.2c-7.06 0-12.8 5.74-12.8 12.8 0 2.256.59 4.46 1.71 6.4L3.2 28.8l6.56-1.72a12.74 12.74 0 0 0 6.242 1.622h.006c7.058 0 12.796-5.74 12.796-12.8 0-3.42-1.332-6.634-3.75-9.052A12.716 12.716 0 0 0 16.002 3.2zm0 23.332h-.004a10.6 10.6 0 0 1-5.404-1.478l-.388-.23-3.892 1.02 1.04-3.794-.252-.402a10.583 10.583 0 0 1-1.624-5.646c0-5.854 4.764-10.618 10.622-10.618 2.836 0 5.502 1.106 7.506 3.112a10.556 10.556 0 0 1 3.112 7.51c-.002 5.854-4.766 10.626-10.716 10.526zm5.822-7.95c-.32-.16-1.888-.932-2.18-1.038-.292-.106-.504-.16-.716.16-.212.318-.822 1.038-1.008 1.252-.186.212-.372.24-.692.08-.32-.16-1.348-.498-2.568-1.586-.948-.846-1.59-1.892-1.776-2.212-.186-.32-.02-.492.14-.65.144-.144.32-.372.478-.558.16-.186.212-.32.32-.532.106-.212.054-.398-.026-.558-.08-.16-.716-1.728-.982-2.366-.258-.622-.522-.538-.716-.548l-.61-.01c-.212 0-.558.08-.85.398-.292.32-1.114 1.09-1.114 2.656s1.14 3.08 1.3 3.292c.16.212 2.244 3.428 5.438 4.808.76.328 1.352.524 1.814.67.762.242 1.456.208 2.004.126.612-.092 1.888-.772 2.154-1.518.266-.744.266-1.384.186-1.518-.08-.132-.292-.212-.612-.372z" />
        </svg>
        <span className="hidden sm:block pointer-events-none absolute right-full mr-2.5 whitespace-nowrap rounded-md bg-[#1A3B2B] px-2.5 py-1 text-[11px] font-semibold text-white shadow-md opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200">
          Chat on WhatsApp
        </span>
      </a>
    </div>
  );
};
