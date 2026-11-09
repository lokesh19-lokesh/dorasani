import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { SITE_NAME, SITE_ORIGIN, buildBreadcrumbSchema, buildCanonicalUrl } from '../utils/seo';

export const TermsPage: React.FC = () => {
  const canonicalUrl = buildCanonicalUrl('/terms');
  const pageTitle = `Terms & Conditions | ${SITE_NAME}`;
  const pageDescription =
    'Read DORASANI Terms & Conditions covering handloom silk authenticity, INR GST-inclusive pricing, intellectual property, and use of dorasanicollections.com.';

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
          { name: 'Terms & Conditions' },
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
        canonicalPath="/terms"
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
              <span aria-current="page" className="font-semibold text-[#285A3C]">Terms & Conditions</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 px-4 sm:px-8 text-center">
        <h1 className="font-serif-royal text-3xl font-bold text-[#2D141A]">Terms & Conditions</h1>
        <p className="text-xs text-[#74565D] mt-1">Guidelines governing your usage of the DORASANI platform.</p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 bg-white p-6 sm:p-10 rounded-2xl border border-[#EEDCD1] shadow-xs text-xs sm:text-sm text-[#74565D] space-y-5 leading-relaxed">
        <p>
          Welcome to DORASANI (dorasanicollections.com). By accessing our website, browsing our collections, or placing orders, you agree to comply with and be bound by the following terms and conditions.
        </p>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#2D141A]">1. Handloom Product Authenticity & Variations</h2>
          <p>
            Due to the organic hand-weaving process of pure silks and zari yarns, subtle irregularities in weaving texture or color slubs are not flaws; rather, they are the hallmarks of genuine handloom artistry.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#2D141A]">2. Pricing & Currency</h2>
          <p>
            All prices listed on DORASANI are in Indian Rupees (INR) and are inclusive of Goods and Services Tax (GST). Delivery charges, if applicable, are clearly specified at checkout.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-serif-royal font-bold text-base text-[#2D141A]">3. Intellectual Property</h2>
          <p>
            All motifs, visual illustrations, logos, South Indian temple artworks, and photography featured on this website are the proprietary intellectual property of DORASANI.
          </p>
        </section>
      </div>
    </div>
  );
};
