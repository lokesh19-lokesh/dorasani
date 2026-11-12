import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { OptimizedPicture } from './OptimizedPicture';

export interface BreadcrumbItem {
  name: string;
  path?: string;
}

export interface SubpageHeroProps {
  desktopImage: string;
  mobileImage: string;
  tag?: string;
  title: string;
  subtitle: string;
  breadcrumbs: BreadcrumbItem[];
  textPosition?: 'left' | 'right' | 'center';
  highlights?: string[];
  cta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
}

export const SubpageHero: React.FC<SubpageHeroProps> = ({
  desktopImage,
  mobileImage,
  tag,
  title,
  subtitle,
  breadcrumbs,
  textPosition = 'left',
  highlights,
  cta,
  secondaryCta,
}) => {
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return (
    <section className="relative w-full overflow-hidden border-b border-[#D8C7B5] bg-[#FAF5EE]">
      {/* 1. Main Background Media Container */}
      <div className="relative w-full h-[430px] xs:h-[460px] sm:h-[500px] md:h-auto md:aspect-[2170/725] md:min-h-[380px] md:max-h-[520px] flex flex-col md:flex-row md:items-center">
        {/* Responsive Picture for LCP hero */}
        <OptimizedPicture
          src={desktopImage}
          mobileSrc={mobileImage}
          mobileMedia="(max-width: 767px)"
          sizes="100vw"
          mobileSizes="100vw"
          alt={title}
          width={2170}
          height={725}
          fetchPriority="high"
          loading="eager"
          pictureClassName="absolute inset-0 w-full h-full block"
          className="w-full h-full object-cover object-[center_28%] md:object-center select-none"
        />

        {/* Soft Vignette Gradients for Text Legibility without obscuring the artwork */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#FAF5EE]/95 via-[#FAF5EE]/45 to-transparent pointer-events-none md:hidden" />

        <div
          className={`hidden md:block absolute inset-y-0 w-3/5 pointer-events-none transition-opacity ${
            textPosition === 'right'
              ? 'right-0 bg-gradient-to-l from-[#FAF5EE]/90 via-[#FAF5EE]/50 to-transparent'
              : textPosition === 'center'
              ? 'inset-x-0 mx-auto bg-radial from-[#FAF5EE]/80 to-transparent'
              : 'left-0 bg-gradient-to-r from-[#FAF5EE]/90 via-[#FAF5EE]/50 to-transparent'
          }`}
        />

        {/* 2. Mobile View Card */}
        <div className="md:hidden relative z-10 px-3 pt-2.5 xs:pt-3 w-full">
          <div className="bg-[#FAF5EE]/92 backdrop-blur-md border border-[#C99632]/45 rounded-xl p-3 xs:p-3.5 shadow-sm space-y-1.5 relative">
            <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-[#C99632]/70 rounded-tl-xs" />
            <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-[#C99632]/70 rounded-tr-xs" />
            <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-[#C99632]/70 rounded-bl-xs" />
            <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-[#C99632]/70 rounded-br-xs" />

            <nav aria-label="Mobile breadcrumb" className="overflow-x-auto no-scrollbar">
              <ol className="flex items-center space-x-1 text-[10.5px] text-[#4F6355]">
                {breadcrumbs.map((crumb, idx) => (
                  <li key={crumb.name} className="inline-flex items-center gap-1 shrink-0">
                    {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-[#C99632] shrink-0" aria-hidden="true" />}
                    {crumb.path ? (
                      <Link to={crumb.path} className="hover:text-[#285A3C] shrink-0 font-medium">
                        {crumb.name}
                      </Link>
                    ) : (
                      <span aria-current="page" className="font-semibold text-[#285A3C] shrink-0">
                        {crumb.name}
                      </span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>

            <div>
              {tag && (
                <div className="inline-flex items-center gap-1 text-[9px] font-bold tracking-[0.2em] text-[#1A3B2B] uppercase mb-0.5">
                  <span className="text-[#C99632]" aria-hidden="true">✦</span>
                  <span>{tag}</span>
                  <span className="text-[#C99632]" aria-hidden="true">✦</span>
                </div>
              )}
              {isDesktop ? (
                <p className="font-serif-royal text-lg xs:text-xl font-bold text-[#1A3B2B] leading-tight">
                  {title}
                </p>
              ) : (
                <h1 className="font-serif-royal text-lg xs:text-xl font-bold text-[#1A3B2B] leading-tight">
                  {title}
                </h1>
              )}
            </div>

            <p className="text-[11px] text-[#3A443D] leading-snug line-clamp-2">
              {subtitle}
            </p>

            {cta && (
              <div className="pt-1 flex items-center gap-2">
                <Link
                  to={cta.href}
                  className="inline-flex items-center gap-1.5 bg-[#285A3C] hover:bg-[#1E432D] text-white text-[11px] font-semibold px-3.5 py-1.5 rounded shadow-xs"
                >
                  <span>{cta.label}</span>
                  <ArrowRight className="w-3 h-3" aria-hidden="true" />
                </Link>
                {secondaryCta && (
                  <Link
                    to={secondaryCta.href}
                    className="inline-flex items-center text-[11px] font-semibold text-[#285A3C] hover:underline px-1.5 py-1"
                  >
                    {secondaryCta.label}
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 3. Desktop View Card */}
        <div className="hidden md:flex relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-6">
          <div
            className={`w-full flex ${
              textPosition === 'right'
                ? 'justify-end'
                : textPosition === 'center'
                ? 'justify-center text-center'
                : 'justify-start'
            }`}
          >
            <div className="bg-[#FAF5EE]/90 backdrop-blur-md border border-[#C99632]/45 rounded-2xl p-6 lg:p-8 max-w-md lg:max-w-lg xl:max-w-xl shadow-[0_12px_40px_rgba(26,59,43,0.08)] space-y-3.5 relative">
              <div className="absolute top-2.5 left-2.5 w-3 h-3 border-t-2 border-l-2 border-[#C99632]/70 rounded-tl" />
              <div className="absolute top-2.5 right-2.5 w-3 h-3 border-t-2 border-r-2 border-[#C99632]/70 rounded-tr" />
              <div className="absolute bottom-2.5 left-2.5 w-3 h-3 border-b-2 border-l-2 border-[#C99632]/70 rounded-bl" />
              <div className="absolute bottom-2.5 right-2.5 w-3 h-3 border-b-2 border-r-2 border-[#C99632]/70 rounded-br" />

              <nav aria-label="Breadcrumb">
                <ol
                  className={`flex items-center space-x-1.5 text-xs text-[#4F6355] ${
                    textPosition === 'center' ? 'justify-center' : ''
                  }`}
                >
                  {breadcrumbs.map((crumb, idx) => (
                    <li key={crumb.name} className="inline-flex items-center gap-1.5">
                      {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" aria-hidden="true" />}
                      {crumb.path ? (
                        <Link
                          to={crumb.path}
                          className="hover:text-[#285A3C] transition-colors font-medium"
                        >
                          {crumb.name}
                        </Link>
                      ) : (
                        <span aria-current="page" className="font-semibold text-[#285A3C]">
                          {crumb.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>

              {tag && (
                <div
                  className={`inline-flex items-center gap-1.5 text-[11px] font-bold tracking-[0.22em] text-[#1A3B2B] uppercase ${
                    textPosition === 'center' ? 'justify-center' : ''
                  }`}
                >
                  <span className="text-[#C99632]" aria-hidden="true">✦</span>
                  <span>{tag}</span>
                  <span className="text-[#C99632]" aria-hidden="true">✦</span>
                </div>
              )}

              {isDesktop ? (
                <h1 className="font-serif-royal text-2xl sm:text-3xl lg:text-[36px] xl:text-[40px] font-bold text-[#1A3B2B] leading-[1.16] tracking-tight">
                  {title}
                </h1>
              ) : (
                <p className="font-serif-royal text-2xl sm:text-3xl lg:text-[36px] xl:text-[40px] font-bold text-[#1A3B2B] leading-[1.16] tracking-tight">
                  {title}
                </p>
              )}

              <p className="text-xs sm:text-sm text-[#3A443D] leading-relaxed max-w-lg">
                {subtitle}
              </p>

              {highlights && highlights.length > 0 && (
                <div
                  className={`pt-1 flex flex-wrap gap-2 ${
                    textPosition === 'center' ? 'justify-center' : ''
                  }`}
                >
                  {highlights.map((h, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#285A3C] bg-[#D0E9C0]/40 px-3 py-1 rounded-full border border-[#BCD8AA]"
                    >
                      <span className="text-[#C99632]" aria-hidden="true">✦</span>
                      <span>{h}</span>
                    </span>
                  ))}
                </div>
              )}

              {cta && (
                <div
                  className={`pt-2 flex items-center gap-3 ${
                    textPosition === 'center' ? 'justify-center' : ''
                  }`}
                >
                  <Link
                    to={cta.href}
                    className="inline-flex items-center gap-2 bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs sm:text-sm font-semibold px-6 py-2.5 rounded shadow-sm transition-all group"
                  >
                    <span>{cta.label}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                  {secondaryCta && (
                    <Link
                      to={secondaryCta.href}
                      className="inline-flex items-center text-xs sm:text-sm font-semibold text-[#285A3C] hover:underline px-3 py-2"
                    >
                      {secondaryCta.label}
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
