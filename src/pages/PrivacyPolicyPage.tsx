import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="space-y-10 pb-16">
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#2D141A]">Privacy Policy</h1>
        <p className="text-xs text-[#74565D] mt-1">Your trust and data security are sacred to DORASANI.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#EEDCD1] shadow-xs text-xs sm:text-sm text-[#74565D] space-y-5 leading-relaxed">
        <p>
          This Privacy Policy describes how DORASANI Luxury Fashion ("we", "our", or "us") collects, uses, and safeguards your personal information when you visit or make a purchase from our platform.
        </p>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">1. Information We Collect</h3>
          <p>
            When you purchase from DORASANI, we collect essential details such as your name, billing address, shipping address, payment confirmation identifiers, email address, and phone number.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">2. Payment Data Security</h3>
          <p>
            We do not store your complete credit card, debit card, or net banking credentials. All transactions are securely processed through RBI-authorized payment gateways utilizing 256-bit SSL encryption.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-serif-royal font-bold text-base text-[#2D141A]">3. Communications & WhatsApp Updates</h3>
          <p>
            With your consent, we send transactional updates regarding dispatch, shipment transit, and delivery via SMS and WhatsApp. You may opt out of promotional messages at any time.
          </p>
        </section>
      </div>
    </div>
  );
};
