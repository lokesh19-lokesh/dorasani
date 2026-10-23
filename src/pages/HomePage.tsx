import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, ShieldCheck, Truck, Headphones, ChevronLeft, ChevronRight } from 'lucide-react';
import { CATEGORIES, PRODUCTS } from '../data/products';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/common/CategoryCard';

const HERO_SLIDES = [
  {
    id: 0,
    tag: 'THE ROYAL HERITAGE EDIT',
    titleLine1: 'Woven in Tradition.',
    titleLine2: 'Adorned in Royalty.',
    description: 'Discover the timeless beauty of South Indian fashion, where heritage, artistry and elegance come together.',
    primaryCta: { label: 'Explore the Collection', href: '/shop' },
    secondaryCta: { label: 'Discover Our Heritage', href: '/heritage' },
    desktopImage: '/assets/hero/desktop/h1.png',
    mobileImage: '/assets/hero/mobile/h1.png',
  },
  {
    id: 1,
    tag: 'BRIDAL KANJIVARAM SILKS',
    titleLine1: 'Sacred Threads.',
    titleLine2: 'Blessed for Eternity.',
    description: 'Authentic 24k gold zari handlooms woven with centuries of Dravidian craftsmanship for your auspicious wedding rituals.',
    primaryCta: { label: 'Explore Bridal Silks', href: '/collections/sarees' },
    secondaryCta: { label: 'View Bridal Lookbook', href: '/shop' },
    desktopImage: '/assets/hero/desktop/h2.png',
    mobileImage: '/assets/hero/mobile/h2.png',
  },
  {
    id: 2,
    tag: 'TIMELESS HEIRLOOM WEAVES',
    titleLine1: 'Adorned in Grace.',
    titleLine2: 'Cherished Forever.',
    description: 'Directly from hereditary master looms to your sacred occasions — carrying the prayers and living art of South India.',
    primaryCta: { label: 'Shop Festive Silks', href: '/collections/festive' },
    secondaryCta: { label: 'Our Weaver Story', href: '/about' },
    desktopImage: '/assets/hero/desktop/h3.png',
    mobileImage: '/assets/hero/mobile/h3.png',
  },
];

export const HomePage: React.FC = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slider every 6 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  // 4 New arrivals matching design
  const newArrivals = PRODUCTS.slice(0, 4);
  const activeSlide = HERO_SLIDES[currentHeroSlide];

  return (
    <div className="space-y-10 sm:space-y-14 bg-[#FAF5EE]">
      {/* 1. HERO SECTION (Screen-fit on mobile, exact 2171/724 proportional fit on desktop with ZERO cutting) */}
      <section className="relative w-full overflow-hidden bg-[#FAF5EE] border-b border-[#E8DCCF]">
        <div
          className="relative w-full select-none h-[calc(100dvh-150px)] min-h-[520px] max-h-[850px] sm:h-auto sm:aspect-[2171/724] sm:min-h-0 sm:max-h-none flex items-start sm:items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Slides: Responsive desktop and mobile artwork */}
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${currentHeroSlide === idx ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                }`}
            >
              <picture className="w-full h-full block">
                <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                <img
                  src={slide.desktopImage}
                  alt={`${slide.titleLine1} ${slide.titleLine2}`}
                  className="w-full h-full object-cover object-top sm:object-cover sm:object-center"
                />
              </picture>

              {/* Mobile top readability vignette - Soft parchment glow behind top text only */}
              <div className="absolute inset-x-0 top-0 h-52 bg-gradient-to-b from-[#FAF5EE]/95 via-[#FAF5EE]/70 to-transparent sm:hidden pointer-events-none" />
            </div>
          ))}

          {/* Text Content Container: Positioned in open left courtyard, never overlapping temple or bride */}
          <div className="relative z-10 w-full px-4 sm:px-8 md:pl-[10%] lg:pl-[11%] xl:pl-[12%] pt-3.5 sm:pt-0 pointer-events-none">
            <div className="max-w-[440px] md:max-w-[480px] lg:max-w-[500px] xl:max-w-[540px] text-center sm:text-left mx-auto sm:mx-0">
              <div
                key={activeSlide.id}
                className="transition-all duration-300 ease-out animate-in fade-in"
              >
                {/* Eyebrow */}
                <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[9.5px] sm:text-[10px] md:text-[11px] xl:text-xs font-semibold tracking-[0.2em] text-[#18482C] uppercase mb-1 sm:mb-1.5 xl:mb-2.5">
                  <span className="opacity-50 text-[9px]">✦</span>
                  <span>{activeSlide.tag}</span>
                  <span className="opacity-50 text-[9px]">✦</span>
                </div>

                {/* Headline in refined royal serif */}
                <h1 className="font-serif-royal text-[21px] xs:text-[23px] sm:text-2xl md:text-3xl lg:text-[38px] xl:text-[44px] 2xl:text-[48px] font-bold text-[#18482C] leading-[1.12] tracking-tight">
                  {activeSlide.titleLine1}<br />
                  <span>{activeSlide.titleLine2}</span>
                </h1>

                {/* Description: Clean, high-legibility styling */}
                <p className="text-[11px] sm:text-xs md:text-[13px] lg:text-[14px] xl:text-[15px] text-[#2C2B26] max-w-[420px] xl:max-w-[460px] leading-snug sm:leading-relaxed mt-1 sm:mt-2 xl:mt-3 mx-auto sm:mx-0 line-clamp-1 sm:line-clamp-none font-medium sm:font-normal">
                  {activeSlide.description}
                </p>

                {/* CTAs */}
                <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-2.5 sm:pt-3.5 xl:pt-5 pointer-events-auto">
                  <Link
                    to={activeSlide.primaryCta.href}
                    className="bg-[#18482C] hover:bg-[#113520] text-white px-3.5 sm:px-5 xl:px-6 py-1.5 sm:py-2 xl:py-2.5 rounded-[4px] text-xs sm:text-[13px] xl:text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1 group whitespace-nowrap"
                  >
                    <span>{activeSlide.primaryCta.label}</span>
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </Link>

                  <Link
                    to={activeSlide.secondaryCta.href}
                    className="bg-white/95 hover:bg-white text-[#18482C] border border-[#D8C7B5] hover:border-[#18482C] px-3.5 sm:px-5 xl:px-6 py-1.5 sm:py-2 xl:py-2.5 rounded-[4px] text-xs sm:text-[13px] xl:text-sm font-semibold tracking-wide transition-all shadow-xs whitespace-nowrap"
                  >
                    {activeSlide.secondaryCta.label}
                  </Link>
                </div>
              </div>

              {/* Slider Dots */}
              <div className="flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2 pt-2 sm:pt-2.5 xl:pt-4 pointer-events-auto">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentHeroSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${currentHeroSlide === idx
                      ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-[#18482C]'
                      : 'w-1.5 sm:w-2 h-1.5 sm:h-2 border border-[#809B70] bg-transparent hover:bg-[#18482C]/50'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESKTOP-ONLY TEMPLE BACKGROUND WRAPPER (Shop by Category, New Arrivals, Service-Benefits) ── */}
      <div className="w-full relative lg:bg-[url('/assets/hero/ShopbyCategoryandNewArrivalsbackground.png')] lg:bg-no-repeat lg:bg-top lg:bg-[length:100%_100%] lg:pt-7 lg:pb-2">
        {/* 2. SHOP BY CATEGORY (100% Matching Pic 2 & Pic 4) */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-6 sm:w-10 h-px bg-[#C29336]/60" />
              <span className="text-[#C29336] text-[10px]">✦</span>
              <h2 className="font-serif-royal text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3B2B] tracking-tight">
                Shop by Category
              </h2>
              <span className="text-[#C29336] text-[10px]">✦</span>
              <div className="w-6 sm:w-10 h-px bg-[#C29336]/60" />
            </div>

            <Link
              to="/shop"
              className="flex items-center gap-1 text-xs font-semibold text-[#285A3C] hover:text-[#1E432D] transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 7 Category Arch Cards + Right Celebration Banner */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Category Cards (7 items) */}
            <div className="lg:col-span-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4 items-end">
              {CATEGORIES.slice(0, 7).map((cat) => (
                <CategoryCard key={cat.id} category={cat} />
              ))}
            </div>

            {/* Right Feature Card: A Celebration of Our Heritage */}
            <div className="lg:col-span-4 rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm relative group bg-[#FAF5EE]">
              <Link to="/collections/festive" className="block relative h-full min-h-[220px]">
                <img
                  src="/assets/hero/ShopbyCategoryhomepage.png"
                  alt="A Celebration of Our Heritage - Festive Styles"
                  className="w-full h-full object-cover object-center min-h-[220px] transition-transform duration-500 group-hover:scale-102"
                />
                {/* Overlay Content matching Reference Design */}
                <div className="absolute inset-0 flex flex-col justify-center px-5 sm:px-6 md:px-7 lg:px-5 xl:px-6 z-10 max-w-[62%] sm:max-w-[55%] pointer-events-none">
                  <h3 className="font-serif-royal text-xl sm:text-2xl lg:text-[22px] xl:text-[26px] font-bold text-[#143D24] leading-[1.15] tracking-tight">
                    A Celebration<br />
                    <span>of Our Heritage</span>
                  </h3>

                  {/* Subtle Golden Ornamental Divider */}
                  <div className="flex items-center gap-1.5 my-2 sm:my-2.5">
                    <div className="w-8 sm:w-12 h-px bg-[#C29336]/60" />
                    <span className="text-[#C29336] text-[9px] leading-none">✦</span>
                    <div className="w-8 sm:w-12 h-px bg-[#C29336]/60" />
                  </div>

                  <p className="text-xs sm:text-[13px] text-[#2C3B30] font-normal leading-snug sm:leading-relaxed mb-3 sm:mb-4">
                    Elegant styles for festivals, weddings and meaningful occasions.
                  </p>

                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-[#285A3C] group-hover:bg-[#1E432D] text-white text-xs font-semibold px-3.5 sm:px-4 py-1.5 sm:py-2 rounded shadow-md transition-colors pointer-events-auto">
                      <span>Explore Festive Styles</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 3. NEW ARRIVALS */}
        <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 mt-7 sm:mt-8 lg:mt-7">
          <div className="flex items-center justify-between mb-4 sm:mb-5">
            <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3">
              <div className="w-6 sm:w-10 h-px bg-[#C29336]/60" />
              <span className="text-[#C29336] text-[10px]">✦</span>
              <h2 className="font-serif-royal text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3B2B] tracking-tight">
                New Arrivals
              </h2>
              <span className="text-[#C29336] text-[10px]">✦</span>
              <div className="w-6 sm:w-10 h-px bg-[#C29336]/60" />
            </div>

            <Link
              to="/collections/new-arrivals"
              className="flex items-center gap-1 text-xs font-semibold text-[#285A3C] hover:text-[#1E432D] transition-colors shrink-0"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 4 Product Cards + Right Legacy Banner */}
          <div className="flex flex-col lg:flex-row gap-3.5 xl:gap-4 items-stretch">
            {/* 4 Products on Left - decreased width and height to fit */}
            <div className="w-full lg:w-[55%] xl:w-[54%] shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} compact={true} />
              ))}
            </div>

            {/* Right Feature Card: Increased width, decreased height, full image visible */}
            <div className="w-full lg:w-[45%] xl:w-[46%] flex-1 rounded-xl overflow-hidden border border-[#D8C7B5] shadow-xs relative group bg-[#FAF5EE] flex flex-col">
              <Link to="/about" className="block relative w-full h-full min-h-[190px] sm:min-h-[210px]">
                <img
                  src="/assets/hero/NewArrivalsbrander.png"
                  alt="A Legacy of Beauty. A Spirit of Tradition."
                  className="w-full h-full object-cover object-left transition-transform duration-500 group-hover:scale-102"
                />
                {/* Overlay Content matching Picture 3 and Picture 4 */}
                <div className="absolute inset-0 flex flex-col justify-center items-end pr-3.5 sm:pr-5 md:pr-6 lg:pr-4 xl:pr-6 pl-4 z-10 pointer-events-none">
                  <div className="max-w-[58%] sm:max-w-[54%] md:max-w-[52%] text-left">
                    <h3 className="font-serif-royal text-sm sm:text-base md:text-lg lg:text-[17px] xl:text-[20px] font-bold text-[#143D24] leading-[1.18] tracking-tight">
                      A Legacy of Beauty.<br />
                      <span>A Spirit of Tradition.</span>
                    </h3>

                    <p className="text-[10px] sm:text-[11px] xl:text-xs text-[#2C3B30] font-normal leading-relaxed my-1.5 sm:my-2 line-clamp-2 sm:line-clamp-3">
                      DORASANI celebrates the rich artistic traditions of South India, bringing timeless textiles and elegant designs to your most cherished moments.
                    </p>

                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1.5 bg-[#285A3C] group-hover:bg-[#1E432D] text-white text-[11px] sm:text-xs font-semibold px-3.5 sm:px-4 py-1.5 rounded shadow-sm transition-colors pointer-events-auto">
                        <span>Our Story</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* 4. PASTEL PISTACHIO TRUST STRIP (Integrated with painted green band on desktop) */}
        <section className="relative overflow-hidden bg-[#D0E9C0] lg:bg-transparent border-y border-[#BCD8AA] lg:border-y-0 py-6 sm:py-8 lg:py-5 lg:pb-6 mt-12 lg:mt-6">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-[#1A3B2B]">
              {/* 1. Thoughtfully Curated Fashion */}
              <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0] lg:bg-transparent">
                  <Sparkles className="w-6 h-6 text-[#1A3B2B]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                    Thoughtfully Curated Fashion
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                    Premium fabrics and timeless designs
                  </p>
                </div>
              </div>

              {/* 2. Secure Payments */}
              <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0] lg:bg-transparent">
                  <ShieldCheck className="w-6 h-6 text-[#1A3B2B]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                    Secure Payments
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                    100% safe and encrypted
                  </p>
                </div>
              </div>

              {/* 3. Reliable Delivery */}
              <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0] lg:bg-transparent">
                  <Truck className="w-6 h-6 text-[#1A3B2B]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                    Reliable Delivery
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                    Pan India shipping
                  </p>
                </div>
              </div>

              {/* 4. Customer Support */}
              <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0] lg:bg-transparent">
                  <Headphones className="w-6 h-6 text-[#1A3B2B]" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                    Customer Support
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                    Here to help always
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* 5. CUSTOMER TESTIMONIALS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 text-center">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#285A3C] uppercase">
          ✦ Real Experiences ✦
        </span>
        <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B] mt-2 mb-8">
          Customer Love
        </h2>

        {/* Testimonial Card in Cream & Forest Green */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCCF] shadow-sm flex flex-col sm:flex-row items-center gap-6 text-left max-w-2xl mx-auto">
          <img
            src="/assets/categories/cat_sarees_arch.jpg"
            alt="Priya S."
            className="w-24 h-28 sm:w-28 sm:h-32 object-cover object-top rounded-xl border border-[#D8C7B5] shadow-xs shrink-0"
          />
          <div className="space-y-3">
            <div className="flex items-center gap-1 text-[#C29336]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="font-serif-royal italic text-sm sm:text-base text-[#1A3B2B] leading-relaxed">
              "Absolutely beautiful sarees! The quality and detailing are exceptional. DORASANI has truly captured the essence of South Indian tradition."
            </p>
            <div>
              <h4 className="font-semibold text-xs text-[#285A3C]">Priya S.</h4>
              <p className="text-[11px] text-[#647268]">Verified Customer, Bengaluru</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
