import React from 'react';
import { Truck, Clock, ShieldCheck, Globe } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-16">
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#2D141A]">Shipping Policy</h1>
        <p className="text-xs text-[#74565D] mt-1">Reliable, insured delivery across India and worldwide.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#EEDCD1] shadow-xs text-xs sm:text-sm text-[#74565D] space-y-6 leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-[#EEDCD1]">
          <div className="flex gap-3 items-start">
            <Truck className="w-5 h-5 text-[#AC1443] shrink-0" />
            <div>
              <h4 className="font-bold text-[#2D141A]">Free Pan-India Delivery</h4>
              <p className="text-xs">Applicable on all orders above ₹999.</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Clock className="w-5 h-5 text-[#AC1443] shrink-0" />
            <div>
              <h4 className="font-bold text-[#2D141A]">Fast Dispatch</h4>
              <p className="text-xs">Dispatched within 24-48 hours from our central studios.</p>
            </div>
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">1. Domestic Shipping within India</h3>
          <p>We partner with premier logistics providers including Delhivery, Blue Dart, and DTDC to guarantee safe and insured delivery. Standard shipping takes 3-5 business days depending on location.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">2. Tracking & SMS Updates</h3>
          <p>Upon dispatch, you will receive real-time tracking details via email and WhatsApp. You can also track your consignment anytime on our website under the Track Order tab.</p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">3. Tamper-Proof Packaging</h3>
          <p>Every handloom saree and lehenga is packed in waterproof, tamper-evident royal DORASANI cloth cases to safeguard precious fabrics from transit damage.</p>
        </section>
      </div>
    </div>
  );
};
