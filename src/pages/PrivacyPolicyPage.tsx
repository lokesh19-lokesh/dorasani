import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/common/SeoHead';
import { SITE_NAME, SITE_ORIGIN, buildBreadcrumbSchema, buildCanonicalUrl } from '../utils/seo';

export const PrivacyPolicyPage: React.FC = () => {
  const { siteSettings } = useStore();
  const canonicalUrl = buildCanonicalUrl('/privacy-policy');
  const pageTitle = `Privacy Policy | ${SITE_NAME}`;
  const pageDescription =
    'Read how DORASANI (dorasanicollections.com) collects, secures, and protects your order, address, and payment information with SSL encryption and RBI-authorized gateways.';

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
          { name: 'Privacy Policy' },
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
        canonicalPath="/privacy-policy"
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
              <span aria-current="page" className="font-semibold text-[#285A3C]">Privacy Policy</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#2D141A]">Privacy Policy</h1>
        <p className="text-xs text-[#74565D] mt-1">Your trust and data security are sacred to DORASANI.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#EEDCD1] shadow-xs text-xs sm:text-sm text-[#74565D] space-y-5 leading-relaxed">
        <p>
          This Privacy Policy describes how DORASANI Luxury Fashion (dorasanicollections.com) collects, uses, and safeguards your personal information when you visit or make a purchase from our platform.
        </p>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#2D141A]">1. Information We Collect</h2>
          <p>
            When you purchase from DORASANI, we collect essential details such as your name, billing address, shipping address, payment confirmation identifiers, email address, and phone number.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#2D141A]">2. Payment Data Security</h2>
          <p>
            We do not store your complete credit card, debit card, or net banking credentials. All transactions are securely processed through RBI-authorized payment gateways utilizing 256-bit SSL encryption.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#2D141A]">3. Communications & WhatsApp Updates</h2>
          <p>
            With your consent, we send transactional updates regarding dispatch, shipment transit, and delivery via SMS and WhatsApp. You may opt out of promotional messages at any time by writing to{' '}
            <a
              href={`mailto:${siteSettings.supportEmail}`}
              className="text-[#285A3C] font-semibold hover:underline"
            >
              {siteSettings.supportEmail}
            </a>.
          </p>
        </section>
      </div>
    </div>
  );
};
