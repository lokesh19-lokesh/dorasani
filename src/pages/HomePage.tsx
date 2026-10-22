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
    slideImage: '/assets/banners/hero_slide_0_clean.jpg',
  },
  {
    id: 1,
    tag: 'BRIDAL KANJIVARAM SILKS',
    titleLine1: 'Sacred Threads.',
    titleLine2: 'Blessed for Eternity.',
    description: 'Authentic 24k gold zari handlooms woven with centuries of Dravidian craftsmanship for your auspicious wedding rituals.',
    primaryCta: { label: 'Explore Bridal Silks', href: '/collections/sarees' },
    secondaryCta: { label: 'View Bridal Lookbook', href: '/shop' },
    slideImage: '/assets/banners/hero_slide_1_clean.jpg',
  },
  {
    id: 2,
    tag: 'THE ROYAL LEHENGA EDIT',
    titleLine1: 'Grandeur in Swirl.',
    titleLine2: 'Grace in Every Fold.',
    description: 'Regal lehengas sculpted with Dravidian temple motifs, rich brocades and opulent heritage borders for royal celebrations.',
    primaryCta: { label: 'Shop Royal Lehengas', href: '/collections/lehengas' },
    secondaryCta: { label: 'Explore Festive Wear', href: '/collections/festive' },
    slideImage: '/assets/banners/hero_slide_2_clean.jpg',
  },
  {
    id: 3,
    tag: 'TIMELESS HEIRLOOM WEAVES',
    titleLine1: 'Adorned in Grace.',
    titleLine2: 'Cherished Forever.',
    description: 'Directly from hereditary master looms to your sacred occasions — carrying the prayers and living art of South India.',
    primaryCta: { label: 'Discover Heirlooms', href: '/collections/ethnic-wear' },
    secondaryCta: { label: 'Our Weaver Story', href: '/about' },
    slideImage: '/assets/banners/hero_slide_3_clean.jpg',
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

  return (
    <div className="space-y-10 sm:space-y-14 bg-[#FAF5EE]">
      {/* 1. HERO SECTION (100% Matching IMAGE 1: Full-Width Edge-to-Edge Panoramic Hero) */}
      <section className="relative w-full overflow-hidden bg-[#FAF5EE] border-b border-[#E8DCCF]">
        <div
          className="relative w-full select-none min-h-[380px] sm:min-h-[420px] md:min-h-[450px] lg:min-h-[480px] xl:min-h-[500px] flex items-center"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Background Slides: Seamless clean temple architecture + fashion model photography */}
          {HERO_SLIDES.map((slide, idx) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                currentHeroSlide === idx ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
              }`}
            >
              <img
                src={slide.slideImage}
                alt={`${slide.titleLine1} ${slide.titleLine2}`}
                className="w-full h-full object-cover object-[75%_center] sm:object-center"
              />
              {/* Subtle mobile readability vignette on the left text area only */}
              <div className="absolute inset-y-0 left-0 w-full sm:w-2/3 bg-gradient-to-r from-[#FAF5EE]/90 via-[#FAF5EE]/50 to-transparent sm:hidden pointer-events-none" />
            </div>
          ))}

          {/* Left Text Content: Exact typography, positions ~13-16% from left edge */}
          <div className="relative z-10 w-full px-6 sm:px-10 md:pl-[12%] lg:pl-[14%] xl:pl-[15%] py-8 sm:py-12 pointer-events-none">
            <div className="max-w-[560px]">
              {HERO_SLIDES.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`transition-all duration-500 ease-out ${
                    currentHeroSlide === idx
                      ? 'opacity-100 translate-y-0 relative'
                      : 'opacity-0 translate-y-3 pointer-events-none absolute top-0 left-0 w-full'
                  }`}
                >
                  {/* Eyebrow */}
                  <div className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-semibold tracking-[0.22em] text-[#18482C] uppercase mb-2 sm:mb-3">
                    <span className="opacity-50 text-[10px]">⟵</span>
                    <span>{slide.tag}</span>
                    <span className="opacity-50 text-[10px]">⟶</span>
                  </div>

                  {/* Headline in refined serif */}
                  <h1 className="font-serif-royal text-2xl sm:text-4xl md:text-[42px] lg:text-[48px] font-bold text-[#18482C] leading-[1.12] tracking-tight">
                    {slide.titleLine1}<br />
                    <span>{slide.titleLine2}</span>
                  </h1>

                  {/* Description */}
                  <p className="text-xs sm:text-sm md:text-[14px] lg:text-[15px] text-[#302E27] max-w-[480px] leading-relaxed mt-2.5 sm:mt-3.5">
                    {slide.description}
                  </p>

                  {/* CTAs */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 sm:pt-6 pointer-events-auto">
                    <Link
                      to={slide.primaryCta.href}
                      className="bg-[#18482C] hover:bg-[#113520] text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-[4px] text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1.5 group"
                    >
                      <span>{slide.primaryCta.label}</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>

                    <Link
                      to={slide.secondaryCta.href}
                      className="bg-white/95 hover:bg-white text-[#18482C] border border-[#D8C7B5] hover:border-[#18482C] px-5 sm:px-6 py-2.5 sm:py-3 rounded-[4px] text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs"
                    >
                      {slide.secondaryCta.label}
                    </Link>
                  </div>
                </div>
              ))}

              {/* Slider Dots matching IMAGE 1 */}
              <div className="flex items-center space-x-2 pt-5 sm:pt-6 pointer-events-auto">
                {HERO_SLIDES.map((slide, idx) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentHeroSlide(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-300 ${
                      currentHeroSlide === idx
                        ? 'w-6 h-2 bg-[#18482C]'
                        : 'w-2 h-2 border border-[#809B70] bg-transparent hover:bg-[#18482C]/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY CATEGORY (100% Matching Pic 2 & Pic 4) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <h2 className="font-serif-royal text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3B2B] flex items-center justify-center gap-2">
              <span className="text-[#285A3C] text-sm">✦</span>
              <span>Shop by Category</span>
              <span className="text-[#285A3C] text-sm">✦</span>
            </h2>
          </div>

          <Link
            to="/shop"
            className="flex items-center gap-1 text-xs font-semibold text-[#285A3C] hover:text-[#1E432D] transition-colors"
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
            <Link to="/collections/festive" className="block relative h-full">
              <img
                src="/assets/banners/celebration_heritage.jpg"
                alt="A Celebration of Our Heritage - Festive Styles"
                className="w-full h-full object-cover object-center min-h-[220px] transition-transform duration-500 group-hover:scale-102"
              />
              {/* Invisible interactive area for Explore Festive Styles */}
              <div className="absolute bottom-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 bg-[#285A3C] group-hover:bg-[#1E432D] text-white text-xs font-semibold px-4 py-2 rounded shadow-md transition-colors">
                  <span>Explore Festive Styles</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. NEW ARRIVALS (100% Matching Pic 2 & Pic 4) */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 text-center">
            <h2 className="font-serif-royal text-xl sm:text-2xl md:text-3xl font-bold text-[#1A3B2B] flex items-center justify-center gap-2">
              <span className="text-[#285A3C] text-sm">✦</span>
              <span>New Arrivals</span>
              <span className="text-[#285A3C] text-sm">✦</span>
            </h2>
          </div>

          <Link
            to="/collections/new-arrivals"
            className="flex items-center gap-1 text-xs font-semibold text-[#285A3C] hover:text-[#1E432D] transition-colors"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 4 Product Cards + Right Legacy Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 4 Products on Left */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Right Feature Card: A Legacy of Beauty. A Spirit of Tradition. */}
          <div className="lg:col-span-4 rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm relative group bg-[#FAF5EE]">
            <Link to="/about" className="block relative h-full">
              <img
                src="/assets/banners/legacy_tradition.jpg"
                alt="A Legacy of Beauty. A Spirit of Tradition."
                className="w-full h-full object-cover object-center min-h-[240px] transition-transform duration-500 group-hover:scale-102"
              />
              {/* Interactive Button for Our Story */}
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:left-36 z-10">
                <span className="inline-flex items-center gap-1.5 bg-[#285A3C] group-hover:bg-[#1E432D] text-white text-xs font-semibold px-5 py-2 rounded shadow-md transition-colors">
                  <span>Our Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. PASTEL PISTACHIO TRUST STRIP (100% Matching Pic 2 & Pic 4) */}
      <section className="relative overflow-hidden bg-[#D0E9C0] border-y border-[#BCD8AA] py-6 sm:py-8 mt-12">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-[#1A3B2B]">
            {/* 1. Thoughtfully Curated Fashion */}
            <div className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
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
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
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
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
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
              <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0]">
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

        {/* Decorative corner lotuses matching Pic 2/4 */}
        <div className="absolute bottom-0 left-0 w-24 h-16 pointer-events-none opacity-80">
          <img src="/assets/brand/pillar_left.jpg" alt="" className="w-full h-full object-cover object-bottom" />
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-16 pointer-events-none opacity-80">
          <img src="/assets/brand/pillar_right.jpg" alt="" className="w-full h-full object-cover object-bottom" />
        </div>
      </section>

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
