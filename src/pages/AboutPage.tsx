import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, HeartHandshake, ShieldCheck, Award } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero */}
      <section className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-12 sm:py-20 px-4 sm:px-8 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C99632] uppercase">
            ✦ THE DORASANI SAGA ✦
          </span>
          <h1 className="font-serif-royal text-3xl sm:text-5xl font-bold text-[#2D141A]">
            A Spirit of Tradition.<br />A Legacy of Royal Beauty.
          </h1>
          <p className="text-xs sm:text-sm text-[#74565D] max-w-2xl mx-auto leading-relaxed pt-2">
            Founded with a vision to preserve the soul of South Indian handlooms, DORASANI brings centuries of Dravidian architectural art, mythological narratives, and regal weaves into modern celebrations.
          </p>
        </div>
      </section>

      {/* 2. Story Feature */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 rounded-2xl overflow-hidden border border-[#EEDCD1] shadow-lg">
            <img
              src="/assets/banners/legacy_beauty_banner.jpg"
              alt="DORASANI Master Weaver & Heritage"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-4">
            <span className="text-xs font-bold text-[#AC1443] tracking-widest uppercase">
              Our Genesis
            </span>
            <h2 className="font-serif-royal text-2xl sm:text-3xl font-bold text-[#2D141A]">
              Where Ancient Gopurams Meet Contemporary Silhouettes
            </h2>
            <p className="text-xs sm:text-sm text-[#74565D] leading-relaxed">
              In Telugu and classical South Indian lexicon, “Dorasani” evokes dignity, grace, and royal reverence. Every saree and lehenga in our collection is an ode to the magnificent temples of Thanjavur, Madurai, Kanchipuram, and Lepakshi.
            </p>
            <p className="text-xs sm:text-sm text-[#74565D] leading-relaxed">
              We work with over 300 hereditary master weaving families across Tamil Nadu, Andhra Pradesh, Telangana, Karnataka, and Varanasi, ensuring their time-honored craft receives fair recognition and living wages.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Core Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#EEDCD1] text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FBE5EB] text-[#AC1443] flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#2D141A]">100% Certified Handloom</h3>
            <p className="text-xs text-[#74565D]">Pure mulberry silk, authentic zari, and certified organic natural fibers.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#EEDCD1] text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FBE5EB] text-[#AC1443] flex items-center justify-center mx-auto mb-3">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#2D141A]">Artisan First</h3>
            <p className="text-xs text-[#74565D]">Direct ethical sourcing with zero middlemen margins returned to weavers.</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#EEDCD1] text-center space-y-2 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FBE5EB] text-[#AC1443] flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#2D141A]">Timeless Longevity</h3>
            <p className="text-xs text-[#74565D]">Heirloom garments meant to be cherished across daughters and generations.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
