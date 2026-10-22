import React from 'react';

export const TermsPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-16">
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#2D141A]">Terms & Conditions</h1>
        <p className="text-xs text-[#74565D] mt-1">Guidelines governing your usage of the DORASANI platform.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#EEDCD1] shadow-xs text-xs sm:text-sm text-[#74565D] space-y-5 leading-relaxed">
        <p>
          Welcome to DORASANI. By accessing our website, browsing our collections, or placing orders, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">1. Handloom Product Authenticity & Variations</h3>
          <p>
            Due to the organic hand-weaving process of pure silks and zari yarns, subtle irregularities in weaving texture or color slubs are not flaws; rather, they are the hallmarks of genuine handloom artistry.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">2. Pricing & Currency</h3>
          <p>
            All prices listed on DORASANI are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). Delivery charges, if applicable, are clearly specified at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">3. Intellectual Property</h3>
          <p>
            All motifs, visual illustrations, logos, South Indian temple artworks, and photography featured on this website are the proprietary intellectual property of DORASANI.
          </p>
        </section>
      </div>
    </div>
  );
};
