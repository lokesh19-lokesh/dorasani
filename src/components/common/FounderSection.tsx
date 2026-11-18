import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HeartHandshake, Award, ArrowRight } from 'lucide-react';
import { OptimizedPicture } from './OptimizedPicture';

interface FounderSectionProps {
  variant?: 'home' | 'about';
}

export const FounderSection: React.FC<FounderSectionProps> = ({ variant = 'home' }) => {
  const isHome = variant === 'home';

  return (
    <section
      aria-labelledby="founder-section-heading"
      className={
        isHome
          ? 'below-fold-section max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16'
          : 'below-fold-section max-w-7xl mx-auto px-4 sm:px-8'
      }
    >
      <div className="bg-white rounded-2xl border border-[#D8C7B5] shadow-xs overflow-hidden">
        {/* Section Header Strip */}
        <div className="bg-gradient-to-r from-[#FAF5EE] via-[#D0E9C0]/35 to-[#FAF5EE] border-b border-[#E8DCCF] px-4 sm:px-10 py-5 sm:py-8 text-center">
          <div className="inline-flex items-center gap-2 text-[10.5px] sm:text-xs font-bold tracking-[0.2em] sm:tracking-[0.22em] text-[#285A3C] uppercase">
            <span className="text-[#C29336]">✦</span>
            <span>Meet Our Founder</span>
            <span className="text-[#C29336]">✦</span>
          </div>
          <h2
            id="founder-section-heading"
            className="font-serif-royal text-xl sm:text-3xl lg:text-[34px] font-bold text-[#1A3B2B] mt-2 leading-tight tracking-tight max-w-3xl mx-auto"
          >
            The Heart Behind Dorasani Collections: Jyothi’s Journey
          </h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-10 sm:w-14 h-px bg-[#C29336]/70" />
            <Sparkles className="w-3.5 h-3.5 text-[#C29336]" aria-hidden="true" />
            <div className="w-10 sm:w-14 h-px bg-[#C29336]/70" />
          </div>
        </div>

        {/* Main Editorial Split */}
        <div className="p-4 sm:p-8 lg:p-10 xl:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
            {/* Founder Portrait & Highlights */}
            <div className="lg:col-span-5 lg:sticky lg:top-28 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-[#D8C7B5] shadow-md bg-[#FAF5EE] max-w-[440px] mx-auto aspect-[3/4]">
                <OptimizedPicture
                  src="/assets/jyothi.jpeg"
                  alt="Jyothi, Founder of Dorasani Collections, wearing a traditional magenta and gold zari silk saree"
                  width={960}
                  height={1280}
                  sizes="(max-width: 640px) 92vw, (max-width: 1024px) 440px, 420px"
                  loading="lazy"
                  pictureClassName="w-full h-full block"
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-[#1A3B2B]/95 via-[#1A3B2B]/55 to-transparent flex flex-col justify-end p-5 sm:p-6 text-white">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-[#D0E9C0] font-semibold">
                    Founder &amp; Visionary
                  </span>
                  <p className="font-serif-royal text-2xl sm:text-[26px] font-bold text-[#FFF9F3] mt-0.5 leading-tight">
                    Jyothi
                  </p>
                  <p className="text-xs text-[#E3EFE0] mt-1">
                    Engineer Turned Entrepreneur • 10+ Years in Textiles
                  </p>
                </div>
              </div>

              {/* Key Pillars Strip */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 max-w-[440px] mx-auto">
                <div className="rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] p-3 sm:p-3.5 flex flex-col sm:flex-row items-start gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A3B2B] break-words">Affordability</p>
                    <p className="text-[11px] text-[#4F6355] leading-snug mt-0.5 break-words">
                      Elegant sarees &amp; custom frocks at pocket-friendly prices
                    </p>
                  </div>
                </div>
                <div className="rounded-xl bg-[#FAF5EE] border border-[#E8DCCF] p-3 sm:p-3.5 flex flex-col sm:flex-row items-start gap-2 sm:gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center shrink-0">
                    <HeartHandshake className="w-4 h-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#1A3B2B] break-words">Empowerment</p>
                    <p className="text-[11px] text-[#4F6355] leading-snug mt-0.5 break-words">
                      Training &amp; dignified livelihoods for women
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Story Narrative */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-5 text-sm sm:text-[15px] text-[#3A443D] leading-relaxed font-roboto-slab">
              <p className="text-[#1A3B2B] font-medium text-[15px] sm:text-base leading-relaxed">
                Every thread at Dorasani Collections carries a story of resilience, passion, and a
                dream woven with purpose. Behind this venture is our founder, Jyothi—an engineer
                turned entrepreneur whose journey from the corporate tech world to building a
                community-driven fashion brand is truly inspiring.
              </p>

              <p>
                Jyothi’s story began in the classrooms of Zilla Parishad High School, where she
                developed a strong foundation of discipline and determination. She went on to pursue
                her passion for science and engineering, graduating in Aeronautics from Pulla Reddy
                Institute of Technology. After her marriage, her drive to keep learning led her into
                the IT sector, where she trained in Software Testing, became a Certified Automation
                Engineer, and worked at Syntel for nearly a year.
              </p>

              <p>
                However, life took a beautiful turn when she was blessed with her first baby boy.
                Stepping away from her corporate career to embrace motherhood, Jyothi discovered a
                new calling—one that allowed her to channel her creativity, business acumen, and
                desire to make a meaningful difference. Over the past 10 years, she has poured her
                heart into successfully running Bhavani Matching Center, a trusted local destination
                offering everything from fabrics, jewelry, bangles, and cosmetics to tailoring
                materials at both retail and wholesale prices. A decade of listening to women’s
                fashion needs gave her deep insight into quality, affordability, and style.
              </p>

              <p>
                Dorasani Collections is the next chapter of that dream. Built on two core
                pillars—affordability and empowerment—Jyothi envisioned a space where every woman
                can enjoy elegant, budget-friendly sarees without compromising on quality.
                Understanding modern tastes, she is also expanding the brand to transform beautiful
                sarees into custom, designer-style frocks at pocket-friendly prices.
              </p>

              <p>
                More than just a business, Dorasani Collections is Jyothi’s way of giving back. Her
                mission is to recruit and train women who are looking to support their families,
                giving them dignified livelihood opportunities and a space to grow.
              </p>

              <blockquote className="rounded-xl border-l-4 border-[#C29336] bg-[#FAF5EE] p-4 sm:p-5 text-[#1A3B2B] italic text-sm sm:text-[15px] leading-relaxed">
                “When you shop at Dorasani Collections, you aren’t just buying a saree or a custom
                outfit—you are supporting a mother’s dream, a decade of textile expertise, and a
                growing community of empowered women.”
              </blockquote>

              <div className="pt-2 flex flex-wrap items-center gap-3 font-poppins">
                {isHome ? (
                  <>
                    <Link
                      to="/about"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#18482C] hover:bg-[#113520] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                    >
                      <span>Our Full Story</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/shop"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#D8C7B5] bg-[#FAF5EE] hover:bg-[#D0E9C0]/40 hover:border-[#285A3C] text-[#1A3B2B] text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <span>Explore Collections</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/collections/sarees"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#285A3C] hover:bg-[#1E432D] text-white text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                    >
                      <span>Shop Our Sarees</span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#BCD8AA] bg-[#D0E9C0]/40 hover:bg-[#D0E9C0] text-[#1A3B2B] text-xs sm:text-sm font-semibold transition-colors"
                    >
                      <span>Connect With Our Boutique</span>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
