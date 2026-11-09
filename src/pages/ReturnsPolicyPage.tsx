import React from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { SeoHead } from '../components/common/SeoHead';
import { SITE_NAME, SITE_ORIGIN, buildBreadcrumbSchema, buildCanonicalUrl } from '../utils/seo';

export const ReturnsPolicyPage: React.FC = () => {
  const { siteSettings } = useStore();
  const canonicalUrl = buildCanonicalUrl('/returns-policy');
  const pageTitle = `Returns & Exchange Policy — 7-Day Doorstep Pickup | ${SITE_NAME}`;
  const pageDescription =
    'DORASANI offers an easy 7-day doorstep return and exchange guarantee on unworn sarees and ethnic wear with original Silk Mark and handloom tags intact. Refunds processed within 48 hours of inspection.';

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
          { name: 'Returns & Exchanges' },
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
        canonicalPath="/returns-policy"
        keywords="DORASANI returns policy, saree exchange India, 7-day return handloom saree, refund policy"
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
              <span aria-current="page" className="font-semibold text-[#285A3C]">Returns & Exchanges</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-[#D0E9C0]/40 border-b border-[#BCD8AA] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#1A3B2B]">Returns & Exchanges</h1>
        <p className="text-xs text-[#4F6355] mt-1">Easy 7-day doorstep return and replacement guarantee.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#D8C7B5] shadow-xs text-xs sm:text-sm text-[#4F6355] space-y-6 leading-relaxed">
        <div className="bg-[#D0E9C0] border border-[#BCD8AA] p-4 rounded-xl flex items-center gap-3 text-[#1A3B2B]">
          <RotateCcw className="w-6 h-6 text-[#285A3C] shrink-0" aria-hidden="true" />
          <p className="font-semibold text-xs text-[#1A3B2B]">
            We want you to be completely delighted with your DORASANI heritage purchase. If you are not satisfied, return it within 7 days of delivery.
          </p>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF5EE] border border-[#E8DCCF] rounded-xl p-4 text-xs">
          <div>
            <dt className="font-semibold text-[#1A3B2B]">Return Window</dt>
            <dd className="text-[#4F6355]">7 Days from Delivery</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1A3B2B]">Return Pickup Fee</dt>
            <dd className="text-[#4F6355]">Free Reverse Pickup</dd>
          </div>
          <div>
            <dt className="font-semibold text-[#1A3B2B]">Refund Turnaround</dt>
            <dd className="text-[#4F6355]">Within 48 Hours of QC</dd>
          </div>
        </dl>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#1A3B2B]">Eligibility Criteria</h2>
          <ul className="space-y-1.5 list-disc pl-5">
            <li>Item must be unworn, unwashed, unaltered, and without custom blouse stitching.</li>
            <li>Original tags, authentic handloom seals, and protective garment packaging must remain intact.</li>
            <li>Return requests must be initiated within 7 days from the delivery timestamp.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#1A3B2B]">Refund Timeline</h2>
          <p>
            Once our quality assurance team inspects the returned garment, your refund is credited within 48 hours to your original payment method{siteSettings.codEnabled ? ' (or bank account for COD orders)' : ''}. For assistance, email{' '}
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

