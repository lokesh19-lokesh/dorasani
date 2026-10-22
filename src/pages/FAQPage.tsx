import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

export const FAQPage: React.FC = () => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Are all DORASANI sarees certified pure handloom silk?',
      a: 'Yes, 100% of our silk collection is certified pure mulberry silk with authentic zari weaving, sourced directly from generational weaving clusters in Kanchipuram, Banaras, and Chanderi with Silk Mark certification.',
    },
    {
      q: 'Does each saree come with an unstitched blouse piece?',
      a: 'Yes! All our sarees include an unstitched blouse fabric (approx. 80 cm) featuring matching zari work and borders tailored to coordinate seamlessly with the saree pallu.',
    },
    {
      q: 'What are the delivery timelines across India?',
      a: 'We offer standard pan-India delivery within 3-5 business days. Express air shipping is available at checkout for 1-2 business day arrival.',
    },
    {
      q: 'What is your return and exchange policy?',
      a: 'We offer a 7-day hassle-free return and exchange policy on all unworn, unaltered products in original packaging with intact security tags.',
    },
    {
      q: 'Do you offer international shipping?',
      a: 'Yes, we ship globally to the US, UK, Canada, Australia, UAE, and Singapore via DHL Express.',
    },
    {
      q: 'How should I care for and wash my handloom silk saree?',
      a: 'We strictly recommend Dry Clean Only. Store your silk sarees wrapped in soft muslin or cotton cloth away from moisture and direct sunlight. Refold periodically to avoid permanent creases along zari weaves.',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      <div className="bg-[#D0E9C0]/40 border-b border-[#BCD8AA] py-10 sm:py-16 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#285A3C] uppercase">
            ✦ COMMON QUERIES ✦
          </span>
          <h1 className="font-serif-royal text-3xl sm:text-4xl font-bold text-[#1A3B2B]">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#4F6355]">
            Everything you need to know about our handlooms, shipping, and care.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-3">
        {faqs.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-[#D8C7B5] overflow-hidden shadow-xs transition-colors hover:border-[#BCD8AA]"
          >
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-[#1A3B2B] hover:text-[#285A3C] transition-colors"
            >
              <span>{item.q}</span>
              {openIdx === i ? (
                <div className="w-6 h-6 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <Minus className="w-4 h-4 text-[#285A3C]" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-[#FAF5EE] flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 text-[#4F6355]" />
                </div>
              )}
            </button>
            {openIdx === i && (
              <div className="px-4 sm:px-5 pb-5 text-xs text-[#4F6355] leading-relaxed border-t border-[#E8DCCF] pt-3">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

