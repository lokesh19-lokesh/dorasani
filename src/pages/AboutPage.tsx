import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Store,
  Layers,
  Scissors,
  Crown,
  ChevronRight
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="font-poppins space-y-12 sm:space-y-16 pb-16">
      {/* 1. Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-8 pt-4 pb-0 text-xs text-[#647268] font-poppins"
      >
        <ol className="flex items-center gap-2">
          <li>
            <Link to="/" className="hover:text-[#285A3C] transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-[#8E9B92]" />
          </li>
          <li className="text-[#1A3B2B] font-semibold" aria-current="page">
            About Us
          </li>
        </ol>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#D0E9C0]/50 via-[#FAF5EE] to-[#FAF5EE] border-b border-[#BCD8AA]/60 py-12 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0E9C0] border border-[#BCD8AA] text-[#1A3B2B] text-xs font-semibold tracking-[0.25em] uppercase font-poppins">
            <Sparkles className="w-3.5 h-3.5 text-[#C29336]" />
            <span>A Symbol of Tradition</span>
            <Sparkles className="w-3.5 h-3.5 text-[#C29336]" />
          </div>

          <h1 className="font-golden text-3xl sm:text-5xl lg:text-6xl font-bold text-[#1A3B2B] leading-tight tracking-tight">
            Welcome to Dorasani Sarees
            <span className="block text-2xl sm:text-3xl lg:text-4xl font-normal text-[#C29336] mt-2 italic">
              – A Symbol of Tradition –
            </span>
          </h1>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#C29336] to-transparent mx-auto my-4" />

          <p className="font-roboto-slab text-base sm:text-lg text-[#3A443D] max-w-2xl mx-auto leading-relaxed">
            The name <span className="font-semibold text-[#1A3B2B]">Dorasani</span> carries the grace, dignity, and regal charm of timeless heritage. At Dorasani Sarees, we believe that true elegance lies in honoring traditions while celebrating the woman of today. Guided by our promise—<span className="italic text-[#285A3C] font-semibold">A Symbol of Tradition</span>—our mission is to bring you attire that reflects authenticity, craftsmanship, and pure celebration.
          </p>
        </div>
      </section>

      {/* 3. What We Bring to You Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Visual Showcase */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-2xl overflow-hidden border border-[#D8C7B5] shadow-lg bg-[#FAF5EE]">
              <img
                src="/assets/banners/legacy_beauty_banner.jpg"
                alt="Dorasani Sarees Heritage & Craftsmanship"
                className="w-full h-[380px] sm:h-[460px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1A3B2B]/85 via-[#1A3B2B]/20 to-transparent flex flex-col justify-end p-6 text-white">
                <span className="text-xs uppercase tracking-widest text-[#D0E9C0] font-semibold font-poppins">
                  Heritage Craftsmanship
                </span>
                <p className="font-golden text-xl sm:text-2xl font-bold mt-1 text-[#FFF9F3]">
                  Woven with Dignity & Grace
                </p>
              </div>
            </div>
          </div>

          {/* Narrative Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#285A3C] tracking-widest uppercase font-poppins">
                Our Curated Collections
              </span>
              <h2 className="font-golden text-2xl sm:text-4xl font-bold text-[#1A3B2B] tracking-tight">
                What We Bring to You
              </h2>
            </div>

            <p className="font-roboto-slab text-sm sm:text-base text-[#3A443D] leading-relaxed">
              From rich handlooms and exquisite festive sarees to beautifully tailored lehengas, charming frocks, and dependable, high-quality lining fabrics, our collection is curated to be a complete destination for every family celebration and everyday style.
            </p>

            {/* Collection Offerings Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <Link
                to="/collections/sarees"
                className="group p-4 rounded-xl border border-[#D8C7B5] bg-white hover:border-[#285A3C] hover:bg-[#D0E9C0]/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#D0E9C0] text-[#1A3B2B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Crown className="w-5 h-5 text-[#285A3C]" />
                </div>
                <div>
                  <h3 className="font-golden font-bold text-sm text-[#1A3B2B] group-hover:text-[#285A3C] flex items-center gap-1.5">
                    Rich Handlooms & Festive Sarees
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#285A3C]" />
                  </h3>
                  <p className="font-poppins text-xs text-[#647268] mt-1 leading-normal">
                    Timeless weaves crafted for auspicious occasions, weddings, and sacred festivities.
                  </p>
                </div>
              </Link>

              <Link
                to="/collections/lehengas"
                className="group p-4 rounded-xl border border-[#D8C7B5] bg-white hover:border-[#285A3C] hover:bg-[#D0E9C0]/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#D0E9C0] text-[#1A3B2B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Sparkles className="w-5 h-5 text-[#285A3C]" />
                </div>
                <div>
                  <h3 className="font-golden font-bold text-sm text-[#1A3B2B] group-hover:text-[#285A3C] flex items-center gap-1.5">
                    Beautifully Tailored Lehengas
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#285A3C]" />
                  </h3>
                  <p className="font-poppins text-xs text-[#647268] mt-1 leading-normal">
                    Regal flares, refined silhouettes, and intricate ornamentation for memorable ceremonies.
                  </p>
                </div>
              </Link>

              <Link
                to="/collections/kids-wear"
                className="group p-4 rounded-xl border border-[#D8C7B5] bg-white hover:border-[#285A3C] hover:bg-[#D0E9C0]/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#D0E9C0] text-[#1A3B2B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Scissors className="w-5 h-5 text-[#285A3C]" />
                </div>
                <div>
                  <h3 className="font-golden font-bold text-sm text-[#1A3B2B] group-hover:text-[#285A3C] flex items-center gap-1.5">
                    Charming Frocks & Kids Wear
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#285A3C]" />
                  </h3>
                  <p className="font-poppins text-xs text-[#647268] mt-1 leading-normal">
                    Comfortable, cheerful traditional wear thoughtfully designed for little royalty.
                  </p>
                </div>
              </Link>

              <Link
                to="/shop"
                className="group p-4 rounded-xl border border-[#D8C7B5] bg-white hover:border-[#285A3C] hover:bg-[#D0E9C0]/20 transition-all flex items-start gap-3.5 shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-[#D0E9C0] text-[#1A3B2B] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Layers className="w-5 h-5 text-[#285A3C]" />
                </div>
                <div>
                  <h3 className="font-golden font-bold text-sm text-[#1A3B2B] group-hover:text-[#285A3C] flex items-center gap-1.5">
                    High-Quality Lining Fabrics
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-[#285A3C]" />
                  </h3>
                  <p className="font-poppins text-xs text-[#647268] mt-1 leading-normal">
                    Dependable, durable, and skin-friendly textiles for perfect fits and everyday style.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Dorasani Promise of Trust & Care Section */}
      <section className="bg-gradient-to-b from-[#FAF5EE] to-[#D0E9C0]/30 py-12 sm:py-16 border-y border-[#BCD8AA]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#285A3C] tracking-widest uppercase font-poppins">
              Our Core Commitment
            </span>
            <h2 className="font-golden text-2xl sm:text-4xl font-bold text-[#1A3B2B] tracking-tight">
              The Dorasani Promise of Trust & Care
            </h2>
            <p className="font-roboto-slab text-sm sm:text-base text-[#3A443D] leading-relaxed pt-1">
              To us, you are not just a customer—you are part of our extended family. Trust is earned through honesty in fabric quality, fair pricing, and personal attention to detail. Whether you visit us in store or explore our designs online, we treat every interaction with warmth, respect, and dedicated guidance to ensure you find exactly what makes you feel graceful and confident.
            </p>
          </div>

          {/* 3 Pillars of Trust */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D8C7B5] shadow-xs hover:border-[#BCD8AA] transition-colors space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">
                Honesty in Fabric Quality
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#4F6355] leading-relaxed">
                We believe in genuine transparency. From authentic silk weaves to reliable everyday lining fabrics, every thread is inspected for enduring quality, texture, and lasting comfort.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#285A3C] font-poppins">
                <CheckCircle2 className="w-4 h-4" />
                <span>Pure Craftsmanship & Certified Weaves</span>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D8C7B5] shadow-xs hover:border-[#BCD8AA] transition-colors space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-[#C29336]" />
              </div>
              <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">
                Fair & Honest Pricing
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#4F6355] leading-relaxed">
                True heritage fashion should be accessible with integrity. We offer sensible, transparent pricing across all collections without inflated markups, honoring your investment.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#285A3C] font-poppins">
                <CheckCircle2 className="w-4 h-4" />
                <span>Value Rooted in Integrity</span>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D8C7B5] shadow-xs hover:border-[#BCD8AA] transition-colors space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#D0E9C0] text-[#285A3C] flex items-center justify-center">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-golden text-lg font-bold text-[#1A3B2B]">
                Personal Attention to Detail
              </h3>
              <p className="font-poppins text-xs sm:text-sm text-[#4F6355] leading-relaxed">
                Whether you walk into our store or consult with us online, our dedicated team guides you through drapes, matching fabrics, and personalized styling with genuine warmth and care.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#285A3C] font-poppins">
                <CheckCircle2 className="w-4 h-4" />
                <span>Warmth & Respect for Every Family</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. In-Store & Online Experience */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-white rounded-2xl border border-[#D8C7B5] p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D0E9C0]/60 text-[#285A3C] text-xs font-bold uppercase tracking-wider font-poppins">
                <Store className="w-3.5 h-3.5" />
                <span>The Dorasani Family Experience</span>
              </div>
              <h3 className="font-golden text-2xl sm:text-3xl font-bold text-[#1A3B2B] tracking-tight">
                Experience Our Heritage In Store & Online
              </h3>
              <p className="font-roboto-slab text-xs sm:text-sm text-[#4F6355] leading-relaxed">
                Whether you are picking an heirloom silk saree for a wedding, styling festive lehengas for your bridal party, choosing sweet frocks for your little ones, or sourcing dependable lining fabrics, we are here with dedicated personal guidance at every step.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 font-poppins">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#285A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#1E432D] transition-colors shadow-xs"
                >
                  <Store className="w-4 h-4" />
                  <span>Visit Our Store / Contact Us</span>
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#BCD8AA] bg-[#D0E9C0]/40 text-[#1A3B2B] text-xs sm:text-sm font-semibold hover:bg-[#D0E9C0] transition-colors"
                >
                  <span>Explore Online Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-[#D8C7B5] pt-6 md:pt-0 md:pl-8 space-y-4">
              <h4 className="font-golden text-lg font-bold text-[#1A3B2B]">
                A Complete Destination for Every Celebration
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-[#4F6355] font-poppins">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#285A3C] shrink-0 mt-0.5" />
                  <span>Rich handlooms & exquisite festive sarees for milestone occasions</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#285A3C] shrink-0 mt-0.5" />
                  <span>Beautifully tailored lehengas with royal craftsmanship</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#285A3C] shrink-0 mt-0.5" />
                  <span>Charming traditional frocks & ethnic wear for kids</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#285A3C] shrink-0 mt-0.5" />
                  <span>Dependable, high-grade lining fabrics & tailored essentials</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Closing Statement & Final CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 text-center space-y-6 pt-4">
        <div className="bg-[#D0E9C0]/45 border border-[#BCD8AA] rounded-2xl p-8 sm:p-12 shadow-sm space-y-4">
          <p className="font-golden text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A3B2B] leading-relaxed">
            “Step into the grace of tradition. Step into Dorasani.”
          </p>
          <p className="font-roboto-slab text-xs sm:text-sm text-[#4F6355] max-w-xl mx-auto">
            Discover a collection made with pride, dedicated to honoring timeless customs and celebrating the confidence of the woman of today.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3 font-poppins">
            <Link
              to="/collections/sarees"
              className="px-6 py-3 rounded-lg bg-[#285A3C] text-white text-xs sm:text-sm font-semibold hover:bg-[#1E432D] transition-colors shadow-sm"
            >
              Explore Saree Collection
            </Link>
            <Link
              to="/collections/lehengas"
              className="px-6 py-3 rounded-lg bg-white border border-[#BCD8AA] text-[#1A3B2B] text-xs sm:text-sm font-semibold hover:bg-[#FAF5EE] transition-colors shadow-xs"
            >
              View Festive Lehengas
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
