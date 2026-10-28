import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Landmark, Users, HeartHandshake } from 'lucide-react';
import { SubpageHero } from '../components/common/SubpageHero';

export const HeritagePage: React.FC = () => {
  const stories = [
    {
      title: 'Goddesses of Grace',
      description: 'Collections inspired by strength, beauty and divine feminine energy.',
      image: '/assets/hero/heritage/Goddesses_of_Grace.png',
      link: '/collections/sarees',
    },
    {
      title: 'Temple Architecture',
      description: 'Designs inspired by the intricate carvings of South Indian temples.',
      image: '/assets/hero/heritage/Temple_Architecture.png',
      link: '/collections/sarees',
    },
    {
      title: 'Classical Arts',
      description: 'Influenced by Bharatanatyam, music and cultural traditions.',
      image: '/assets/hero/heritage/Classical_Arts.png',
      link: '/collections/ethnic-wear',
    },
    {
      title: 'Nature & Heritage',
      description: 'Motifs from flora, fauna and the timeless beauty of our land.',
      image: '/assets/hero/heritage/Nature_Heritage.png',
      link: '/collections/lehengas',
    },
  ];

  const pillars = [
    {
      icon: Landmark,
      title: 'Inspired by Temples',
      desc: 'Designs influenced by South Indian temple art',
    },
    {
      icon: Sparkles,
      title: 'Rooted in Tradition',
      desc: 'Authentic weaves and age-old techniques',
    },
    {
      icon: Users,
      title: 'Crafted by Artisans',
      desc: 'Supporting skilled handloom weavers across India',
    },
    {
      icon: HeartHandshake,
      title: 'Made for Generations',
      desc: 'Timeless heirloom pieces for every sacred moment',
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Banner */}
      <SubpageHero
        desktopImage="/assets/hero/subpageshero/heritagedesktop.png"
        mobileImage="/assets/hero/subpageshero/heritagemobile.png"
        tag="Our Sacred Roots"
        title="Mythology & Heritage"
        subtitle="At DORASANI, every weave carries a story — inspired by divine heritage, Dravidian temple art and the living traditions of South Indian artisans."
        breadcrumbs={[
          { name: 'Home', path: '/' },
          { name: 'Mythology & Heritage' },
        ]}
        textPosition="right"
        highlights={['Temple Architecture Motifs', 'Living Handloom Traditions', 'Generations of Grace']}
        cta={{ label: 'Explore Our Story', href: '/about' }}
        secondaryCta={{ label: 'View Collection', href: '/shop' }}
      />

      {/* 2. Four Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <div
                key={i}
                className="bg-white p-5 rounded-xl border border-[#D8C7B5] text-center shadow-xs flex flex-col items-center hover:border-[#BCD8AA] transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-xs sm:text-sm text-[#1A3B2B]">
                  {p.title}
                </h3>
                <p className="text-[11px] text-[#4F6355] mt-1">
                  {p.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Our Heritage Story Feature with heritagebannersection2 background */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl border border-[#D8C7B5] overflow-hidden shadow-lg min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] flex items-center justify-end p-5 sm:p-8 lg:p-12">
          {/* Background Image */}
          <img
            src="/assets/hero/heritagebannersection2.png"
            alt="DORASANI Heritage - Land of Temples and Textiles"
            className="absolute inset-0 w-full h-full object-cover object-[18%_center] sm:object-left lg:object-center"
          />

          {/* Artistic Gradient Overlays for optimal contrast & depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF5EE]/95 via-[#FAF5EE]/75 to-black/20 sm:bg-gradient-to-r sm:from-transparent sm:via-[#FAF5EE]/30 sm:to-[#FAF5EE]/90" />

          {/* Frosted Royal Parchment Content Card (Positioned on the right so model on left shines) */}
          <div className="relative z-10 w-full max-w-xl lg:max-w-2xl bg-[#FAF5EE]/92 backdrop-blur-md border border-[#D8C7B5]/90 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-6 h-[1px] bg-[#C89D3C]" />
              <span className="text-[11px] sm:text-xs font-semibold tracking-[0.25em] text-[#285A3C] uppercase">
                ✦ A Living Legacy ✦
              </span>
              <span className="w-6 h-[1px] bg-[#C89D3C]" />
            </div>

            <h2 className="font-serif-royal text-2xl sm:text-3xl lg:text-3xl font-bold text-[#1A3B2B] leading-tight">
              Our Heritage: A Land of Temples, Textiles and Timeless Beauty
            </h2>

            <p className="text-xs sm:text-sm text-[#384C3F] leading-relaxed">
              South India's rich cultural heritage, magnificent temples, intricate art and classical traditions inspire every DORASANI creation. From the detailed carvings of temple gopurams to the elegance of classical dance and vibrant hues of festive celebrations, our designs reflect the soul of this sacred land.
            </p>

            <p className="text-xs sm:text-sm text-[#384C3F] leading-relaxed">
              We work directly with traditional weaving clusters across Kanchipuram, Banaras, Chanderi, and Pochampally to sustain authentic handloom heritage for modern generations.
            </p>

            {/* Highlights Chips */}
            <div className="pt-2 flex flex-wrap gap-2 sm:gap-2.5">
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#1A3B2B] bg-[#EAE2D5]/70 border border-[#D8C7B5] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C89D3C]" />
                Temple Gopuram Artistry
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#1A3B2B] bg-[#EAE2D5]/70 border border-[#D8C7B5] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C89D3C]" />
                Living Handloom Clusters
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#1A3B2B] bg-[#EAE2D5]/70 border border-[#D8C7B5] px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C89D3C]" />
                Heirloom Pure Silks
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Stories in Every Weave */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#285A3C] uppercase">
            ✦ Sacred Symbolism ✦
          </span>
          <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#1A3B2B] mt-1">
            Stories in Every Weave
          </h2>
          <p className="text-xs sm:text-sm text-[#4F6355] max-w-xl mx-auto mt-2">
            Each collection at DORASANI is inspired by a unique narrative from our rich mythology and cultural heritage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {stories.map((s, idx) => (
            <Link
              key={idx}
              to={s.link}
              className="group relative block transition-all duration-300 hover:-translate-y-1 focus:outline-none"
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(197, 160, 89, 0.16))',
              }}
            >
              {/* Outer Golden Notched Frame */}
              <div
                className="p-[1.5px] transition-all duration-300 group-hover:brightness-105"
                style={{
                  background: 'linear-gradient(135deg, #DEBA85 0%, #C89953 50%, #DEBA85 100%)',
                  clipPath: 'polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)',
                }}
              >
                {/* Inner Ivory Card Container */}
                <div
                  className="bg-[#FFFCF6] p-2 sm:p-2.5 pb-3 sm:pb-3.5 flex flex-col justify-between h-full"
                  style={{
                    clipPath: 'polygon(9px 0, calc(100% - 9px) 0, 100% 9px, 100% calc(100% - 9px), calc(100% - 9px) 100%, 9px 100%, 0 calc(100% - 9px), 0 9px)',
                  }}
                >
                  <div>
                    {/* Natural Ratio Artwork Image */}
                    <div className="aspect-[2.2/1] overflow-hidden rounded-md bg-[#FAF5EE]">
                      <img
                        src={s.image}
                        alt={s.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Content Section */}
                    <div className="pt-2.5 px-1">
                      <h3 className="font-serif-royal text-[15px] sm:text-base font-bold text-[#8B1D40] tracking-wide mb-1 leading-snug group-hover:text-[#6D1531] transition-colors">
                        {s.title}
                      </h3>
                      <div className="flex items-center justify-between gap-2.5">
                        <p className="text-xs text-[#42413B] leading-snug flex-1">
                          {s.description}
                        </p>
                        <div className="w-7 h-7 rounded-full border border-[#963451] flex items-center justify-center text-[#963451] group-hover:bg-[#8B1D40] group-hover:text-white group-hover:border-[#8B1D40] transition-all duration-200 shrink-0">
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Cultural Quote Callout */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 text-center pt-6">
        <div className="p-8 sm:p-10 rounded-2xl bg-[#D0E9C0]/50 border border-[#BCD8AA] relative shadow-xs">
          <p className="font-serif-royal text-base sm:text-xl font-medium text-[#1A3B2B] italic leading-relaxed">
            “More than just clothing, our collections are a celebration of history, culture and the timeless traditions of South India.”
          </p>
          <span className="block mt-3 text-xs tracking-widest uppercase font-semibold text-[#285A3C]">
            — DORASANI Brand Creed
          </span>
        </div>
      </section>
    </div>
  );
};

