import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/common/CategoryCard';
import { productService } from '../services/productService';
import type { Product, Category, ServiceBenefit, ProductReview } from '../types';

interface HeroSlide {
  id: string | number;
  tag: string;
  titleLine1: string;
  titleLine2: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  desktopImage: string;
  mobileImage: string;
}

const BENEFIT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles,
  ShieldCheck,
  Truck,
  Headphones,
};

export const HomePage: React.FC = () => {
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [benefits, setBenefits] = useState<ServiceBenefit[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  const [heroLoading, setHeroLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    productService
      .getBanners('hero')
      .then((banners) => {
        if (!isMounted) return;
        if (banners && banners.length > 0) {
          const formatted: HeroSlide[] = banners.map((b: any, idx: number) => ({
            id: b.id || idx,
            tag: b.tagline || 'ROYAL COLLECTION',
            titleLine1: b.title_line_1 || '',
            titleLine2: b.title_line_2 || '',
            description: b.description || '',
            primaryCta: {
              label: b.primary_cta_label || 'Explore Now',
              href: b.primary_cta_link || '/shop',
            },
            secondaryCta: {
              label: b.secondary_cta_label || 'About Us',
              href: b.secondary_cta_link || '/about',
            },
            desktopImage: b.desktop_image_url,
            mobileImage: b.mobile_image_url || b.desktop_image_url,
          }));
          setHeroSlides(formatted);
        } else {
          setHeroSlides([]);
        }
      })
      .finally(() => {
        if (isMounted) setHeroLoading(false);
      });

    Promise.all([
      productService.getCategories(),
      productService.getProducts({ isNew: true, sortBy: 'newest', limit: 4 }),
      productService.getServiceBenefits(),
      productService.getFeaturedReviews(3),
    ])
      .then(async ([cats, newRes, benList, revList]) => {
        if (!isMounted) return;
        setCategories(cats);
        setBenefits(benList);
        setReviews(revList);

        let arrivals = newRes.products.slice(0, 4);
        if (arrivals.length < 4) {
          const fallbackLatest = await productService.getProducts({
            sortBy: 'newest',
            limit: 4,
          });
          if (!isMounted) return;
          const seen = new Set(arrivals.map((p) => p.id));
          for (const p of fallbackLatest.products) {
            if (!seen.has(p.id)) {
              arrivals.push(p);
              seen.add(p.id);
            }
            if (arrivals.length >= 4) break;
          }
        }
        setNewArrivals(arrivals);
      })
      .finally(() => {
        if (isMounted) setCatalogLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance slider every 6 seconds unless hovered
  useEffect(() => {
    if (isPaused || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, heroSlides.length]);

  const safeSlideIndex = heroSlides.length > 0 ? currentHeroSlide % heroSlides.length : 0;
  const activeSlide = heroSlides[safeSlideIndex];

  return (
    <div className="space-y-10 sm:space-y-14 lg:space-y-0 bg-[#FAF5EE]">
      {/* 1. HERO SECTION */}
      <section className="relative w-full overflow-hidden bg-[#FAF5EE] border-b border-[#E8DCCF] lg:border-b-0">
        {heroLoading ? (
          <div className="w-full h-[calc(100dvh-150px)] min-h-[520px] max-h-[850px] sm:h-auto sm:aspect-[2171/724] sm:min-h-0 sm:max-h-none bg-[#F2E8DC] animate-pulse" />
        ) : activeSlide ? (
          <div
            className="relative w-full select-none h-[calc(100dvh-150px)] min-h-[520px] max-h-[850px] sm:h-auto sm:aspect-[2171/724] sm:min-h-0 sm:max-h-none flex items-start sm:items-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Background Slides */}
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  safeSlideIndex === idx ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                }`}
              >
                <picture className="w-full h-full block">
                  <source media="(max-width: 640px)" srcSet={slide.mobileImage} />
                  <img
                    src={slide.desktopImage}
                    alt={`${slide.titleLine1} ${slide.titleLine2}`.trim()}
                    className="w-full h-full object-cover object-top sm:object-cover sm:object-center"
                  />
                </picture>

                <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-transparent sm:hidden pointer-events-none" />
                <div className="hidden sm:block absolute inset-y-0 left-0 w-[60%] lg:w-[50%] xl:w-[46%] bg-gradient-to-r from-[#FAF5EE]/95 via-[#FAF5EE]/70 to-transparent pointer-events-none z-[1]" />
              </div>
            ))}

            {/* Text Content Container */}
            <div className="relative z-10 w-full px-4 sm:px-8 md:pl-[10%] lg:pl-[11%] xl:pl-[12%] pt-3.5 sm:pt-0 pointer-events-none">
              <div className="max-w-[440px] md:max-w-[480px] lg:max-w-[500px] xl:max-w-[540px] text-center sm:text-left mx-auto sm:mx-0">
                <div
                  key={activeSlide.id}
                  className="transition-all duration-300 ease-out animate-in fade-in"
                >
                  <div className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-[9.5px] sm:text-[10px] md:text-[11px] xl:text-xs font-bold tracking-[0.22em] text-[#0D2818] uppercase mb-1 sm:mb-1.5 xl:mb-2.5 [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                    <span className="text-[#966d1f] text-[9px]">✦</span>
                    <span>{activeSlide.tag}</span>
                    <span className="text-[#966d1f] text-[9px]">✦</span>
                  </div>

                  <h1 className="font-serif-royal text-[22px] xs:text-[24px] sm:text-2xl md:text-3xl lg:text-[38px] xl:text-[44px] 2xl:text-[48px] font-bold text-[#0D2818] leading-[1.12] tracking-tight [text-shadow:_0_1px_3px_rgba(255,255,255,0.95)]">
                    {activeSlide.titleLine1}
                    {activeSlide.titleLine2 && (
                      <>
                        <br />
                        <span>{activeSlide.titleLine2}</span>
                      </>
                    )}
                  </h1>

                  <p className="text-[12px] sm:text-[13px] md:text-[13.5px] lg:text-[15px] xl:text-[16px] text-[#14321F] font-semibold sm:font-medium max-w-[440px] xl:max-w-[480px] leading-relaxed mt-1.5 sm:mt-2.5 xl:mt-3.5 mx-auto sm:mx-0 [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                    {activeSlide.description}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-3 pt-2.5 sm:pt-3.5 xl:pt-5 pointer-events-auto">
                    <Link
                      to={activeSlide.primaryCta.href}
                      className="bg-[#18482C] hover:bg-[#113520] text-white px-3.5 sm:px-5 xl:px-6 py-1.5 sm:py-2 xl:py-2.5 rounded-[4px] text-xs sm:text-[13px] xl:text-sm font-semibold tracking-wide transition-all shadow-md flex items-center gap-1 group whitespace-nowrap"
                    >
                      <span>{activeSlide.primaryCta.label}</span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </Link>

                    <Link
                      to={activeSlide.secondaryCta.href}
                      className="bg-white hover:bg-[#FAF5EE] text-[#0D2818] border border-[#D8C7B5] hover:border-[#18482C] px-3.5 sm:px-5 xl:px-6 py-1.5 sm:py-2 xl:py-2.5 rounded-[4px] text-xs sm:text-[13px] xl:text-sm font-semibold tracking-wide transition-all shadow-xs whitespace-nowrap"
                    >
                      {activeSlide.secondaryCta.label}
                    </Link>
                  </div>
                </div>

                {heroSlides.length > 1 && (
                  <div className="flex items-center justify-center sm:justify-start space-x-1.5 sm:space-x-2 pt-2 sm:pt-2.5 xl:pt-4 pointer-events-auto">
                    {heroSlides.map((slide, idx) => (
                      <button
                        key={slide.id}
                        type="button"
                        onClick={() => setCurrentHeroSlide(idx)}
                        aria-label={`Go to slide ${idx + 1}`}
                        className={`rounded-full transition-all duration-300 ${
                          safeSlideIndex === idx
                            ? 'w-5 sm:w-6 h-1.5 sm:h-2 bg-[#18482C]'
                            : 'w-1.5 sm:w-2 h-1.5 sm:h-2 border border-[#809B70] bg-transparent hover:bg-[#18482C]/50'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-16 px-4 text-center max-w-2xl mx-auto space-y-3">
            <h1 className="font-serif-royal text-3xl sm:text-4xl font-bold text-[#1A3B2B]">
              DORASANI Handloom Heritage
            </h1>
            <p className="text-sm text-[#4F6355]">
              Explore authentic South Indian silks, sarees, kurtis, and royal bridal wear.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 bg-[#18482C] hover:bg-[#113520] text-white px-5 py-2.5 rounded text-xs font-semibold"
            >
              <span>Browse Collections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* ── DESKTOP TEMPLE BACKGROUND WRAPPER ── */}
      <div className="w-full relative lg:mt-0 lg:bg-[url('/assets/hero/ShopbyCategoryhomepage1.png')] lg:bg-no-repeat lg:bg-top lg:bg-[length:100%_100%] lg:pt-5 lg:pb-2">
        {/* 2. SHOP BY CATEGORY */}
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            <div className="lg:col-span-8 flex gap-3 sm:gap-3.5 overflow-x-auto pb-2 scrollbar-none items-end">
              {catalogLoading ? (
                Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={i}
                    className="min-w-[96px] sm:min-w-[106px] xl:min-w-[112px] flex-1 shrink-0 aspect-[3/4] arch-card-shape bg-[#F2E8DC] animate-pulse border border-[#D8C7B5]"
                  />
                ))
              ) : categories.length > 0 ? (
                categories.map((cat) => (
                  <div key={cat.id} className="min-w-[96px] sm:min-w-[106px] xl:min-w-[112px] flex-1 shrink-0">
                    <CategoryCard category={cat} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#647268] py-8">No categories are active yet.</p>
              )}
            </div>

            {/* Right Celebration Banner */}
            <div className="lg:col-span-4 rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm relative group bg-[#FAF5EE] min-h-[200px] lg:min-h-[225px] xl:min-h-[240px] flex flex-col">
              <Link to="/collections/festive" className="block relative w-full h-full flex-1 aspect-[1922/818] lg:aspect-auto">
                <img
                  src="/assets/hero/ShopbyCategoryhomepage.png"
                  alt="A Celebration of Our Heritage - Festive Styles"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-y-0 left-0 w-[72%] sm:w-[65%] bg-gradient-to-r from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-transparent pointer-events-none z-[1]" />

                <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-7 lg:px-4 xl:px-5 z-10 max-w-[62%] sm:max-w-[58%] lg:max-w-[58%] xl:max-w-[56%] pointer-events-none">
                  <h3 className="font-serif-royal text-base sm:text-xl lg:text-[18px] xl:text-[21px] font-bold text-[#0D2818] leading-[1.14] tracking-tight [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                    A Celebration
                    <br />
                    <span>of Our Heritage</span>
                  </h3>

                  <div className="flex items-center gap-1.5 my-1 sm:my-1.5 xl:my-2">
                    <div className="w-6 sm:w-10 h-px bg-[#C29336]/80" />
                    <span className="text-[#966d1f] text-[8px] sm:text-[9px] leading-none">✦</span>
                    <div className="w-6 sm:w-10 h-px bg-[#C29336]/80" />
                  </div>

                  <p className="text-[11px] sm:text-[12px] xl:text-[13px] text-[#14321F] font-semibold sm:font-medium leading-snug mb-2 sm:mb-2.5 xl:mb-3 [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                    Elegant styles for festivals, weddings and meaningful occasions.
                  </p>

                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-[#18482C] group-hover:bg-[#113520] text-white text-[10.5px] sm:text-xs font-semibold px-3 sm:px-3.5 py-1 sm:py-1.5 rounded shadow-md transition-colors pointer-events-auto">
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

          <div className="flex flex-col lg:flex-row gap-3.5 xl:gap-4 items-stretch">
            <div className="w-full lg:w-[55%] xl:w-[54%] shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 md:gap-3">
              {catalogLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-[#E8DCCF] bg-white h-56 animate-pulse"
                  />
                ))
              ) : newArrivals.length > 0 ? (
                newArrivals.map((product) => (
                  <ProductCard key={product.id} product={product} compact={true} />
                ))
              ) : (
                <div className="col-span-full py-10 text-center text-xs text-[#647268] bg-white/80 rounded-lg border border-[#D8C7B5]">
                  New weaves arriving soon.
                </div>
              )}
            </div>

            <div className="w-full lg:w-[45%] xl:w-[46%] rounded-xl overflow-hidden border border-[#D8C7B5] shadow-xs relative group bg-[#FAF5EE] flex flex-col">
              <Link to="/about" className="block relative w-full h-full aspect-[2097/750] lg:aspect-auto min-h-0 lg:min-h-[200px]">
                <img
                  src="/assets/hero/NewArrivalsbrander.png"
                  alt="A Legacy of Beauty. A Spirit of Tradition."
                  className="w-full h-full object-cover object-left transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-y-0 right-0 w-[72%] sm:w-[65%] bg-gradient-to-l from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-transparent pointer-events-none z-[1]" />

                <div className="absolute inset-0 flex flex-col justify-center items-end pr-3.5 sm:pr-5 md:pr-6 lg:pr-4 xl:pr-6 pl-4 z-10 pointer-events-none">
                  <div className="max-w-[58%] sm:max-w-[54%] md:max-w-[52%] text-left">
                    <h3 className="font-serif-royal text-xs sm:text-base md:text-lg lg:text-[17px] xl:text-[20px] font-bold text-[#0D2818] leading-[1.18] tracking-tight [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                      A Legacy of Beauty.
                      <br />
                      <span>A Spirit of Tradition.</span>
                    </h3>

                    <p className="text-[10px] sm:text-[11.5px] xl:text-xs text-[#14321F] font-semibold sm:font-medium leading-relaxed my-1 sm:my-2 [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                      DORASANI celebrates the rich artistic traditions of South India, bringing timeless textiles and elegant designs to your most cherished moments.
                    </p>

                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1.5 bg-[#18482C] group-hover:bg-[#113520] text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded shadow-sm transition-colors pointer-events-auto">
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

        {/* 4. DYNAMIC SERVICE BENEFITS STRIP */}
        <section className="relative overflow-hidden bg-[#D0E9C0] lg:bg-transparent border-y border-[#BCD8AA] lg:border-y-0 py-6 sm:py-8 lg:py-5 lg:pb-6 mt-12 lg:mt-6">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-[#1A3B2B]">
              {benefits.map((b) => {
                const IconComp = BENEFIT_ICON_MAP[b.iconName] || Sparkles;
                return (
                  <div key={b.id} className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                    <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0] lg:bg-transparent">
                      <IconComp className="w-6 h-6 text-[#1A3B2B]" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                        {b.title}
                      </h4>
                      <p className="text-[10px] sm:text-[11px] text-[#2C4A37] mt-0.5">
                        {b.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* 5. CUSTOMER REVIEWS & TESTIMONIALS (LIVE FROM SUPABASE) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 text-center lg:mt-12">
        <span className="text-xs font-semibold tracking-[0.25em] text-[#285A3C] uppercase">
          ✦ Real Experiences ✦
        </span>
        <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B] mt-2 mb-8">
          Customer Love
        </h2>

        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCCF] shadow-sm flex flex-col sm:flex-row items-center gap-6 text-left max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 rounded-full bg-[#D0E9C0] border border-[#BCD8AA] text-[#18482C] font-serif-royal font-bold text-2xl flex items-center justify-center shrink-0">
                  {rev.reviewerName.charAt(0).toUpperCase()}
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-1 text-[#C29336]">
                    {Array.from({ length: Math.max(1, Math.round(rev.rating)) }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  {rev.title && (
                    <h4 className="font-bold text-sm text-[#1A3B2B]">{rev.title}</h4>
                  )}
                  {rev.content && (
                    <p className="font-serif-royal italic text-sm sm:text-base text-[#1A3B2B] leading-relaxed">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  )}
                  <div>
                    <h4 className="font-semibold text-xs text-[#285A3C]">{rev.reviewerName}</h4>
                    <p className="text-[11px] text-[#647268]">
                      {rev.verifiedPurchase ? 'Verified Buyer' : 'DORASANI Patron'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8DCCF] shadow-sm flex flex-col sm:flex-row items-center gap-6 text-left max-w-2xl mx-auto">
            <img
              src="/assets/categories/cat_sarees_arch.jpg"
              alt="DORASANI Handloom Craftsmanship"
              className="w-24 h-28 sm:w-28 sm:h-32 object-cover object-top rounded-xl border border-[#D8C7B5] shadow-xs shrink-0"
            />
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#C29336]">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#285A3C]">
                  Silk Mark &amp; Artisan Certified
                </span>
              </div>
              <p className="font-serif-royal text-sm sm:text-base text-[#1A3B2B] leading-relaxed">
                Every weave in the DORASANI collection comes directly from master handloom looms across Kanchipuram, Varanasi, and South India. Customer reviews submitted on verified purchases appear right here.
              </p>
              <div className="pt-1">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#285A3C] hover:underline"
                >
                  <span>Explore the Collection</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
