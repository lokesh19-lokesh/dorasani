import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { useStore } from '../context/StoreContext';
import { SITE_ORIGIN, buildBreadcrumbSchema, buildCanonicalUrl } from '../utils/seo';

interface FaqGroup {
  category: string;
  items: { q: string; a: string }[];
}

export const FAQPage: React.FC = () => {
  const { siteSettings } = useStore();

  const faqGroups: FaqGroup[] = useMemo(
    () => [
      {
        category: 'Handloom Authenticity & Craft',
        items: [
          {
            q: 'Are all DORASANI sarees certified pure handloom silk?',
            a: 'Yes, 100% of our silk sarees are crafted with pure mulberry silk and authentic zari, sourced directly from generational weaving clusters in Kanchipuram, Varanasi, Chanderi, and South India with quality inspection for weave integrity.',
          },
          {
            q: 'Does each saree come with an unstitched blouse piece?',
            a: 'Yes! Our handloom silk and woven sarees include an unstitched blouse fabric (approx. 80 cm) featuring matching zari work and borders tailored to coordinate seamlessly with the saree pallu.',
          },
          {
            q: 'How should I care for and wash my handloom silk saree?',
            a: 'We strictly recommend Dry Clean Only. Store your silk sarees individually wrapped in breathable unbleached muslin or cotton cloth away from moisture and direct sunlight, and refold every few months to prevent permanent creases along zari threads.',
          },
        ],
      },
      {
        category: 'Shipping & Delivery',
        items: [
          {
            q: 'What are the delivery timelines and shipping charges across India?',
            a: `DORASANI offers free standard pan-India shipping on orders of ₹${siteSettings.freeShippingThreshold.toLocaleString(
              'en-IN'
            )} or above. Orders below that threshold carry ₹${siteSettings.standardShippingFee} standard shipping (3–5 business days for metro cities, 5–7 days rest of India) or ₹${siteSettings.expressShippingFee} express priority air dispatch (1–2 business days in select metros).`,
          },
          {
            q: 'Do you offer international shipping outside India?',
            a: 'Yes, we ship worldwide including the United States, United Kingdom, Canada, Australia, UAE, and Singapore via express international courier partners. Contact our concierge for custom bridal dispatch quotes.',
          },
          {
            q: 'How can I track my DORASANI order after checkout?',
            a: 'As soon as your order dispatches, you receive tracking details via email and SMS. You can also check live status anytime on our Track Order page using your DORASANI order number.',
          },
        ],
      },
      {
        category: 'Payments, Returns & Exchanges',
        items: [
          {
            q: 'What is your return and exchange policy?',
            a: 'We offer a 7-day hassle-free return and exchange policy on eligible unworn, unwashed, and unaltered products with original packaging and security tags intact. Complimentary reverse pickup is arranged across major pin codes.',
          },
          {
            q: 'What payment methods are accepted on dorasanicollections.com?',
            a: siteSettings.codEnabled
              ? 'We accept UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, Digital Wallets via Razorpay 256-bit SSL encrypted checkout, as well as Cash on Delivery (COD) for eligible orders.'
              : 'We accept UPI (GPay, PhonePe, Paytm), Credit & Debit Cards, Net Banking, and Digital Wallets via Razorpay 256-bit SSL encrypted checkout. Cash on Delivery (COD) is currently unavailable.',
          },
          {
            q: 'Where is the DORASANI studio located for in-person bridal styling?',
            a: `Our studio is at ${siteSettings.storeAddress}, ${siteSettings.storeCityStatePin}, open ${siteSettings.studioHours}. Call ${siteSettings.supportPhone || '+91 7780673360'} or email ${siteSettings.supportEmail} for private bridal consultations.`,
          },
        ],
      },
    ],
    [siteSettings]
  );

  const flatFaqs = useMemo(() => faqGroups.flatMap((g) => g.items), [faqGroups]);

  const faqJsonLd = useMemo(() => {
    const canonicalUrl = buildCanonicalUrl('/faq');
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: 'Frequently Asked Questions | DORASANI',
          description:
            'Answers to common questions on DORASANI handloom silk authenticity, unstitched blouse pieces, shipping fees, international delivery, payments, and 7-day returns.',
          isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
          breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
          inLanguage: 'en-IN',
          mainEntity: flatFaqs.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        },
        buildBreadcrumbSchema(
          [{ name: 'Home', path: '/' }, { name: 'Frequently Asked Questions' }],
          canonicalUrl
        ),
      ],
    };
  }, [flatFaqs]);

  return (
    <div className="space-y-10 pb-16">
      <SeoHead
        title="Frequently Asked Questions (FAQ) | Handloom Care, Shipping & Returns | DORASANI"
        description="Find answers about DORASANI pure silk authenticity, Kanchipuram & Banarasi care, unstitched blouse pieces, pan-India shipping fees, Razorpay payments, and 7-day returns."
        canonicalPath="/faq"
        keywords="DORASANI FAQ, silk saree care instructions, Kanchipuram saree blouse piece, pan India saree shipping, 7 day saree return policy"
        jsonLd={faqJsonLd}
      />

      <div className="bg-[#D0E9C0]/40 border-b border-[#BCD8AA] py-10 sm:py-16 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <nav aria-label="Breadcrumb" className="flex justify-center mb-3">
            <ol className="flex items-center space-x-1.5 text-xs text-[#4F6355]">
              <li>
                <Link to="/" className="hover:text-[#285A3C]">
                  Home
                </Link>
              </li>
              <li className="inline-flex items-center gap-1.5">
                <ChevronRight className="w-3.5 h-3.5 text-[#C99632]" aria-hidden="true" />
                <span aria-current="page" className="font-semibold text-[#285A3C]">
                  FAQ
                </span>
              </li>
            </ol>
          </nav>

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

      <div className="max-w-3xl mx-auto px-4 sm:px-8 space-y-8">
        {faqGroups.map((group, groupIdx) => (
          <section key={group.category} className="space-y-3">
            <h2 className="font-cinzel-royal text-base sm:text-lg font-bold text-[#1A3B2B] border-b border-[#D8C7B5] pb-2">
              {group.category}
            </h2>
            <div className="space-y-3">
              {group.items.map((item, itemIdx) => (
                <details
                  key={item.q}
                  open={groupIdx === 0 && itemIdx === 0}
                  className="group bg-white rounded-xl border border-[#D8C7B5] overflow-hidden shadow-xs transition-colors hover:border-[#BCD8AA]"
                >
                  <summary className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left text-xs sm:text-sm font-semibold text-[#1A3B2B] hover:text-[#285A3C] cursor-pointer list-none transition-colors">
                    <span>{item.q}</span>
                    <ChevronDown
                      className="w-4 h-4 text-[#285A3C] shrink-0 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-[#4F6355] leading-relaxed border-t border-[#E8DCCF] pt-3">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
