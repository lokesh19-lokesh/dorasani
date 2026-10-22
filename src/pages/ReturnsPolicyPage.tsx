import React from 'react';
import { RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';

export const ReturnsPolicyPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-16">
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#2D141A]">Returns & Exchanges</h1>
        <p className="text-xs text-[#74565D] mt-1">Easy 7-day doorstep return and replacement guarantee.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#EEDCD1] shadow-xs text-xs sm:text-sm text-[#74565D] space-y-6 leading-relaxed">
        <div className="bg-[#FBE5EB] p-4 rounded-xl flex items-center gap-3 text-[#AC1443]">
          <RotateCcw className="w-6 h-6 shrink-0" />
          <p className="font-semibold text-xs">
            We want you to be completely delighted with your DORASANI heritage purchase. If you are not satisfied, return it within 7 days of delivery.
          </p>
        </div>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">Eligibility Criteria</h3>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Item must be unworn, unwashed, unaltered, and without custom blouse stitching.</li>
            <li>Original tags, authentic handloom seals, and protective garment packaging must remain intact.</li>
            <li>Return requests must be initiated within 7 days from the delivery timestamp.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">Refund Timeline</h3>
          <p>
            Once our quality assurance team inspects the returned garment, your refund is credited within 48 hours to your original payment method (or bank account for COD orders).
          </p>
        </section>
      </div>
    </div>
  );
};
