import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/common/SeoHead';
import { SITE_NAME, SITE_ORIGIN, buildBreadcrumbSchema, buildCanonicalUrl } from '../utils/seo';

export const ShippingPolicyPage: React.FC = () => {
  const { siteSettings } = useStore();
  const canonicalUrl = buildCanonicalUrl('/shipping-policy');
  const pageTitle = `Shipping Policy — Free Pan-India Delivery | ${SITE_NAME}`;
  const pageDescription = `DORASANI dispatches handloom sarees and ethnic wear within 24–48 hours with free Pan-India delivery above ₹${siteSettings.freeShippingThreshold.toLocaleString('en-IN')}. Standard (3–5 days) and express air options via Delhivery, Blue Dart, and DTDC.`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: pageTitle,
        description: pageDescription,
        isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
        about: { '@id': `${SITE_ORIGIN}/#organization` },
        breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
        inLanguage: 'en-IN',
      },
      buildBreadcrumbSchema(
        [
          { name: 'Home', path: '/' },
          { name: 'Shipping Policy' },
        ],
        canonicalUrl
      ),
    ],
  };

  return (
    <div className="space-y-10 pb-16">
      <SeoHead
        title={pageTitle}
        description={pageDescription}
        canonicalPath="/shipping-policy"
        keywords="DORASANI shipping policy, free saree delivery India, Hyderabad handloom dispatch, express delivery"
        jsonLd={jsonLd}
      />

      <div className="bg-[#FAF5EE] border-b border-[#D8C7B5] py-3 px-4 sm:px-8">
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto">
          <ol className="flex items-center space-x-1.5 text-xs text-[#4F6355]">
            <li>
              <Link to="/" className="hover:text-[#285A3C]">Home</Link>
            </li>
            <li aria-hidden="true">
              <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" />
            </li>
            <li>
              <span aria-current="page" className="font-semibold text-[#285A3C]">Shipping Policy</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-[#D0E9C0]/40 border-b border-[#BCD8AA] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#1A3B2B]">Shipping Policy</h1>
        <p className="text-xs text-[#4F6355] mt-1">Reliable, insured delivery across India and worldwide.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#D8C7B5] shadow-xs text-xs sm:text-sm text-[#4F6355] space-y-6 leading-relaxed">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-[#E8DCCF]">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#285A3C]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-[#1A3B2B]">Free Pan-India Delivery</h2>
              <p className="text-xs">
                Applicable on standard orders above ₹
                {siteSettings.freeShippingThreshold.toLocaleString('en-IN')} (Standard shipping below
                threshold: ₹{siteSettings.standardShippingFee.toLocaleString('en-IN')}; Express air
                dispatch: ₹{siteSettings.expressShippingFee.toLocaleString('en-IN')}).
              </p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-[#285A3C]" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-[#1A3B2B]">Fast Dispatch</h2>
              <p className="text-xs">Dispatched within 24-48 hours from our central studios in Hyderabad.</p>
            </div>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF5EE] border border-[#E8DCCF] rounded-xl p-4 text-xs">
          <div>
            <dt className="font-semibold text-[#1A3B2B]">Handling Time</dt>
            <dd className="text-[#4F6355]">1–2 Business Days</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1A3B2B]">Standard Transit (India)</dt>
            <dd className="text-[#4F6355]">3–5 Business Days</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1A3B2B]">Express Air Transit</dt>
            <dd className="text-[#4F6355]">1–2 Business Days</dd>
          </div>
        </dl>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#1A3B2B]">1. Domestic Shipping within India</h2>
          <p>We partner with premier logistics providers including Delhivery, Blue Dart, and DTDC to guarantee safe and insured delivery. Standard shipping takes 3-5 business days depending on location.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#1A3B2B]">2. Tracking & SMS Updates</h2>
          <p>Upon dispatch, you will receive real-time tracking details via email and WhatsApp. You can also track your consignment anytime on our website under the Track Order tab.</p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#1A3B2B]">3. Tamper-Proof Packaging</h2>
          <p>Every handloom saree and lehenga is packed in waterproof, tamper-evident royal DORASANI cloth cases to safeguard precious fabrics from transit damage.</p>
        </section>
      </div>
    </div>
  );
};

