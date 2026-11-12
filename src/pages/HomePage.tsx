import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Sparkles, ShieldCheck, Truck, Headphones, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '../components/product/ProductCard';
import { CategoryCard } from '../components/common/CategoryCard';
import { OptimizedPicture } from '../components/common/OptimizedPicture';
import { SeoHead } from '../components/common/SeoHead';
import { useStore } from '../context/StoreContext';
import { productService } from '../services/productService';
import { SITE_ORIGIN, buildCanonicalUrl } from '../utils/seo';
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
  const { siteSettings, storeCategories } = useStore();
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [promoBanners, setPromoBanners] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>(storeCategories);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [benefits, setBenefits] = useState<ServiceBenefit[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);

  const [heroLoading, setHeroLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollCatsLeft, setCanScrollCatsLeft] = useState(false);
  const [canScrollCatsRight, setCanScrollCatsRight] = useState(false);

  const updateCategoryScrollState = useCallback(() => {
    const el = categoryScrollRef.current;
    if (!el) return;
    setCanScrollCatsLeft(el.scrollLeft > 4);
    setCanScrollCatsRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollCategoriesBy = useCallback((direction: 'left' | 'right') => {
    const el = categoryScrollRef.current;
    if (!el) return;
    const distance = Math.max(220, Math.round(el.clientWidth * 0.65));
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(updateCategoryScrollState);
    window.addEventListener('resize', updateCategoryScrollState);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateCategoryScrollState);
    };
  }, [categories, catalogLoading, updateCategoryScrollState]);

  useEffect(() => {
    if (storeCategories.length > 0) {
      setCategories(storeCategories);
    }
  }, [storeCategories]);

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      productService.getBanners('hero'),
      productService.getBanners('promotional'),
    ])
      .then(([banners, promoList]) => {
        if (!isMounted) return;
        setPromoBanners(promoList || []);
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

  const celebrationBanner = promoBanners[0]
    ? {
      link: promoBanners[0].primary_cta_link || '/collections/festive',
      image: promoBanners[0].desktop_image_url || '/assets/hero/ShopbyCategoryhomepage.png',
      title1: promoBanners[0].title_line_1 || 'A Celebration',
      title2: promoBanners[0].title_line_2 || 'of Our Heritage',
      description:
        promoBanners[0].description ||
        'Elegant styles for festivals, weddings and meaningful occasions.',
      ctaLabel: promoBanners[0].primary_cta_label || 'Explore Festive Styles',
    }
    : {
      link: '/collections/festive',
      image: '/assets/hero/ShopbyCategoryhomepage.png',
      title1: 'A Celebration',
      title2: 'of Our Heritage',
      description: 'Elegant styles for festivals, weddings and meaningful occasions.',
      ctaLabel: 'Explore Festive Styles',
    };

  const legacyBanner = promoBanners[1]
    ? {
      link: promoBanners[1].primary_cta_link || '/about',
      image: promoBanners[1].desktop_image_url || '/assets/hero/NewArrivalsbrander.png',
      title1: promoBanners[1].title_line_1 || 'A Legacy of Beauty.',
      title2: promoBanners[1].title_line_2 || 'A Spirit of Tradition.',
      description:
        promoBanners[1].description ||
        'DORASANI celebrates the rich artistic traditions of South India, bringing timeless textiles and elegant designs to your most cherished moments.',
      ctaLabel: promoBanners[1].primary_cta_label || 'Our Story',
    }
    : {
      link: '/about',
      image: '/assets/hero/NewArrivalsbrander.png',
      title1: 'A Legacy of Beauty.',
      title2: 'A Spirit of Tradition.',
      description:
        'DORASANI celebrates the rich artistic traditions of South India, bringing timeless textiles and elegant designs to your most cherished moments.',
      ctaLabel: 'Our Story',
    };

  const homeFaqs = useMemo(
    () => [
      {
        question: 'Are DORASANI Kanchipuram and Banarasi sarees authentic handlooms?',
        answer:
          'Yes. Every DORASANI Kanchipuram, Banarasi, Chanderi, Tussar, and organza saree is sourced from generational artisan clusters across South India and Varanasi and undergoes stringent quality checks for silk purity, zari integrity, and loom weave finishing.',
      },
      {
        question: 'What is the shipping fee and delivery timeline across India?',
        answer: `DORASANI offers free standard pan-India shipping on orders of ₹${siteSettings.freeShippingThreshold.toLocaleString(
          'en-IN'
        )} or above. Orders below this threshold carry ₹${siteSettings.standardShippingFee} standard shipping or ₹${siteSettings.expressShippingFee} express priority dispatch, typically arriving in 3–5 business days in metro cities.`,
      },
      {
        question: 'Can I return or exchange a saree or bridal lehenga from DORASANI?',
        answer:
          'Yes. Eligible unworn items with original tags intact may be returned or exchanged within 7 days of delivery with complimentary reverse pickup and full refund or store credit.',
      },
      {
        question: 'How should pure silk sarees with gold zari be cared for?',
        answer:
          'Dry clean pure silk sarees only, wrap them individually in breathable unbleached muslin or cotton cloth in a cool dark wardrobe, refold along alternate creases every few months, and steam or press on low heat on the reverse side away from zari threads.',
      },
    ],
    [
      siteSettings.freeShippingThreshold,
      siteSettings.standardShippingFee,
      siteSettings.expressShippingFee,
    ]
  );

  const homeJsonLd = useMemo(() => {
    const graph: Record<string, unknown>[] = [
      {
        '@type': 'WebPage',
        '@id': `${SITE_ORIGIN}/#webpage`,
        url: `${SITE_ORIGIN}/`,
        name: 'DORASANI — Where Heritage Meets Divine Elegance | Luxury South Indian Handloom Sarees',
        description:
          'Discover Silk Mark authentic Kanchipuram sarees, Banarasi silks, Chanderi cottons, bridal lehengas, kurthis, and kids pattu pavadai crafted across heritage looms in India.',
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        about: { '@id': `${SITE_ORIGIN}/#organization` },
        inLanguage: 'en-IN',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_ORIGIN}/#home-faq`,
        mainEntity: homeFaqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
          },
        })),
      },
    ];

    if (newArrivals.length > 0) {
      graph.push({
        '@type': 'ItemList',
        name: 'DORASANI New Arrivals',
        itemListOrder: 'https://schema.org/ItemListOrderDescending',
        numberOfItems: newArrivals.length,
        itemListElement: newArrivals.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          url: buildCanonicalUrl(`/products/${p.slug}`),
          name: p.title,
        })),
      });
    }

    return {
      '@context': 'https://schema.org',
      '@graph': graph,
    };
  }, [homeFaqs, newArrivals]);

  return (
    <div className="space-y-10 sm:space-y-14 lg:space-y-0 bg-[#FAF5EE]">
      <SeoHead
        title="DORASANI — Where Heritage Meets Divine Elegance | Luxury South Indian Handloom Sarees"
        description="Shop Silk Mark authentic Kanchipuram pure silk sarees, Banarasi brocades, Chanderi cottons, Tussar weaves, bridal lehengas, kurthis, and kids pattu pavadai crafted across India."
        canonicalPath="/"
        keywords="DORASANI, dorasanicollections, Kanchipuram silk saree, Banarasi silk saree, Chanderi cotton saree, Tussar silk saree, bridal lehenga, pattu pavadai, Hyderabad handloom sarees"
        ogImage="/assets/products/kanjivaram_silk_saree.jpg"
        ogImageAlt="DORASANI Kanchipuram pure silk saree with intricate gold zari weave"
        jsonLd={homeJsonLd}
      />
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
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${safeSlideIndex === idx ? 'opacity-100 z-0' : 'opacity-0 pointer-events-none'
                  }`}
              >
                <OptimizedPicture
                  src={slide.desktopImage}
                  mobileSrc={slide.mobileImage}
                  mobileMedia="(max-width: 640px)"
                  sizes="100vw"
                  mobileSizes="100vw"
                  alt={`${slide.titleLine1} ${slide.titleLine2}`.trim()}
                  width={2170}
                  height={725}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  pictureClassName="w-full h-full block"
                  className="w-full h-full object-cover object-top sm:object-cover sm:object-center"
                />

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
                        className={`rounded-full transition-all duration-300 ${safeSlideIndex === idx
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
      <div className="w-full relative lg:mt-0 home-temple-bg lg:bg-no-repeat lg:bg-top lg:bg-[length:100%_100%] lg:pt-5 lg:pb-2">
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

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_410px] gap-4 xl:gap-5 items-stretch">
            <div className="min-w-0 relative flex items-end">
              {canScrollCatsLeft && (
                <button
                  type="button"
                  onClick={() => scrollCategoriesBy('left')}
                  aria-label="Scroll categories left"
                  className="hidden sm:flex items-center justify-center absolute left-1 top-[42%] -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#FAF5EE]/95 hover:bg-white border border-[#D8C7B5] text-[#18482C] shadow-md transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              <div
                ref={categoryScrollRef}
                onScroll={updateCategoryScrollState}
                className="w-full flex gap-2.5 sm:gap-3 lg:gap-2 xl:gap-2.5 overflow-x-auto pb-2 scrollbar-none items-end"
              >
                {catalogLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="min-w-[92px] sm:min-w-[100px] xl:min-w-0 flex-1 shrink-0 xl:shrink aspect-[3/4] arch-card-shape bg-[#F2E8DC] animate-pulse border border-[#D8C7B5]"
                    />
                  ))
                ) : categories.length > 0 ? (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className={
                        categories.length <= 8
                          ? 'min-w-[92px] sm:min-w-[100px] xl:min-w-0 flex-1 shrink-0 xl:shrink'
                          : 'min-w-[92px] sm:min-w-[100px] xl:min-w-[104px] flex-1 shrink-0'
                      }
                    >
                      <CategoryCard category={cat} />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#647268] py-8">No categories are active yet.</p>
                )}
              </div>

              {canScrollCatsRight && (
                <button
                  type="button"
                  onClick={() => scrollCategoriesBy('right')}
                  aria-label="Scroll categories right"
                  className="hidden sm:flex items-center justify-center absolute right-1 top-[42%] -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#FAF5EE]/95 hover:bg-white border border-[#D8C7B5] text-[#18482C] shadow-md transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Right Celebration Banner */}
            <div className="rounded-xl overflow-hidden border border-[#D8C7B5] shadow-sm relative group bg-[#FAF5EE] min-h-[200px] lg:min-h-[225px] xl:min-h-[240px] flex flex-col">
              <Link
                to={celebrationBanner.link}
                className="block relative w-full h-full flex-1 aspect-[1922/818] lg:aspect-auto"
              >
                <OptimizedPicture
                  src={celebrationBanner.image}
                  alt={`${celebrationBanner.title1} ${celebrationBanner.title2}`.trim()}
                  width={1922}
                  height={818}
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  loading="lazy"
                  pictureClassName="w-full h-full block"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-y-0 left-0 w-[72%] sm:w-[65%] bg-gradient-to-r from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-transparent pointer-events-none z-[1]" />

                <div className="absolute inset-0 flex flex-col justify-center px-4 sm:px-6 md:px-7 lg:px-4 xl:px-5 z-10 max-w-[62%] sm:max-w-[58%] lg:max-w-[58%] xl:max-w-[56%] pointer-events-none">
                  <h3 className="font-serif-royal text-base sm:text-xl lg:text-[18px] xl:text-[21px] font-bold text-[#0D2818] leading-[1.14] tracking-tight [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                    {celebrationBanner.title1}
                    {celebrationBanner.title2 && (
                      <>
                        <br />
                        <span>{celebrationBanner.title2}</span>
                      </>
                    )}
                  </h3>

                  <div className="flex items-center gap-1.5 my-1 sm:my-1.5 xl:my-2">
                    <div className="w-6 sm:w-10 h-px bg-[#C29336]/80" />
                    <span className="text-[#966d1f] text-[8px] sm:text-[9px] leading-none">✦</span>
                    <div className="w-6 sm:w-10 h-px bg-[#C29336]/80" />
                  </div>

                  <p className="text-[11px] sm:text-[12px] xl:text-[13px] text-[#14321F] font-semibold sm:font-medium leading-snug mb-2 sm:mb-2.5 xl:mb-3 [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                    {celebrationBanner.description}
                  </p>

                  <div>
                    <span className="inline-flex items-center gap-1.5 bg-[#18482C] group-hover:bg-[#113520] text-white text-[10.5px] sm:text-xs font-semibold px-3 sm:px-3.5 py-1 sm:py-1.5 rounded shadow-md transition-colors pointer-events-auto">
                      <span>{celebrationBanner.ctaLabel}</span>
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
              <Link
                to={legacyBanner.link}
                className="block relative w-full h-full aspect-[2097/750] lg:aspect-auto min-h-0 lg:min-h-[200px]"
              >
                <OptimizedPicture
                  src={legacyBanner.image}
                  alt={`${legacyBanner.title1} ${legacyBanner.title2}`.trim()}
                  width={2097}
                  height={750}
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  loading="lazy"
                  pictureClassName="w-full h-full block"
                  className="w-full h-full object-cover object-left transition-transform duration-500 group-hover:scale-102"
                />
                <div className="absolute inset-y-0 right-0 w-[72%] sm:w-[65%] bg-gradient-to-l from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-transparent pointer-events-none z-[1]" />

                <div className="absolute inset-0 flex flex-col justify-center items-end pr-3.5 sm:pr-5 md:pr-6 lg:pr-4 xl:pr-6 pl-4 z-10 pointer-events-none">
                  <div className="max-w-[58%] sm:max-w-[54%] md:max-w-[52%] text-left">
                    <h3 className="font-serif-royal text-xs sm:text-base md:text-lg lg:text-[17px] xl:text-[20px] font-bold text-[#0D2818] leading-[1.18] tracking-tight [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                      {legacyBanner.title1}
                      {legacyBanner.title2 && (
                        <>
                          <br />
                          <span>{legacyBanner.title2}</span>
                        </>
                      )}
                    </h3>

                    <p className="text-[10px] sm:text-[11.5px] xl:text-xs text-[#14321F] font-semibold sm:font-medium leading-relaxed my-1 sm:my-2 [text-shadow:_0_1px_2px_rgba(255,255,255,0.95)]">
                      {legacyBanner.description}
                    </p>

                    <div className="pt-0.5">
                      <span className="inline-flex items-center gap-1.5 bg-[#18482C] group-hover:bg-[#113520] text-white text-[10px] sm:text-xs font-semibold px-2.5 sm:px-4 py-1 sm:py-1.5 rounded shadow-sm transition-colors pointer-events-auto">
                        <span>{legacyBanner.ctaLabel}</span>
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
            <h2 className="sr-only">The DORASANI Guarantee</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-[#1A3B2B]">
              {benefits.map((b) => {
                const IconComp = BENEFIT_ICON_MAP[b.iconName] || Sparkles;
                return (
                  <div key={b.id} className="flex items-center gap-3 sm:gap-4 justify-center sm:justify-start">
                    <div className="w-12 h-12 rounded-full border-2 border-[#1A3B2B] flex items-center justify-center shrink-0 bg-[#D0E9C0] lg:bg-transparent">
                      <IconComp className="w-6 h-6 text-[#1A3B2B]" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xs sm:text-sm text-[#1A3B2B] leading-tight">
                        {b.title}
                      </h3>
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
      <section className="below-fold-section max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12 text-center lg:mt-12">
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
                    <h3 className="font-bold text-sm text-[#1A3B2B]">{rev.title}</h3>
                  )}
                  {rev.content && (
                    <p className="font-serif-royal italic text-sm sm:text-base text-[#1A3B2B] leading-relaxed">
                      &ldquo;{rev.content}&rdquo;
                    </p>
                  )}
                  <div>
                    <p className="font-semibold text-xs text-[#285A3C]">{rev.reviewerName}</p>
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
            <OptimizedPicture
              src="/assets/categories/cat_sarees_arch.jpg"
              alt="DORASANI Handloom Craftsmanship"
              width={896}
              height={1200}
              sizes="112px"
              loading="lazy"
              pictureClassName="shrink-0 block"
              className="w-24 h-28 sm:w-28 sm:h-32 object-cover object-top rounded-xl border border-[#D8C7B5] shadow-xs"
            />
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-[#C29336]">
                <ShieldCheck className="w-4 h-4" aria-hidden="true" />
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
                  <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. AEO HERITAGE & HANDLOOM QUICK ANSWERS */}
      <section className="below-fold-section max-w-4xl mx-auto px-4 sm:px-8 pb-12 sm:pb-16">
        <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E8DCCF] pb-4">
            <div>
              <span className="text-[11px] font-bold tracking-[0.22em] text-[#285A3C] uppercase">
                ✦ Handloom &amp; Boutique Guide ✦
              </span>
              <h2 className="font-serif-royal text-xl sm:text-2xl font-bold text-[#1A3B2B] mt-1">
                Quick Questions About DORASANI
              </h2>
            </div>
            <Link
              to="/faq"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#285A3C] hover:underline shrink-0"
            >
              <span>View All FAQs</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="divide-y divide-[#E8DCCF]">
            {homeFaqs.map((faq) => (
              <details key={faq.question} name="home-aeo" className="group py-3.5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-semibold text-xs sm:text-sm text-[#1A3B2B] hover:text-[#285A3C]">
                  <span>{faq.question}</span>
                  <ChevronDown
                    className="w-4 h-4 text-[#285A3C] shrink-0 transition-transform duration-200 group-open:rotate-180"
                    aria-hidden="true"
                  />
                </summary>
                <p className="mt-2.5 text-xs sm:text-sm text-[#4F6355] leading-relaxed pr-6">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
