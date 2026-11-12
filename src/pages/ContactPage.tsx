import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { useStore } from '../context/StoreContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SITE_ORIGIN, buildBreadcrumbSchema, buildCanonicalUrl } from '../utils/seo';

export const ContactPage: React.FC = () => {
  const { showToast, siteSettings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.from('contact_messages').insert({
          full_name: name.trim(),
          email: email.trim().toLowerCase(),
          subject: subject.trim(),
          message: message.trim(),
        });
        if (error) {
          showToast('Could not send your message right now. Please try again.', 'error');
          return;
        }
      }
      showToast('Your message has been sent! Our heritage concierge will respond within 24 hours.');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  const contactJsonLd = useMemo(() => {
    const canonicalUrl = buildCanonicalUrl('/contact');
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'ContactPage',
          '@id': `${canonicalUrl}#webpage`,
          url: canonicalUrl,
          name: 'Contact DORASANI | Bridal Styling & Flagship Studio in Hyderabad',
          description: `Reach DORASANI Flagship Handloom Studio at ${siteSettings.storeAddress}, ${siteSettings.storeCityStatePin}. Studio hours: ${siteSettings.studioHours}. Email: ${siteSettings.supportEmail}.`,
          isPartOf: { '@id': `${SITE_ORIGIN}/#website` },
          mainEntity: { '@id': `${SITE_ORIGIN}/#organization` },
          breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
          inLanguage: 'en-IN',
        },
        buildBreadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Contact' }], canonicalUrl),
      ],
    };
  }, [siteSettings]);

  return (
    <div className="space-y-12 pb-16">
      <SeoHead
        title="Contact Us | Bridal Styling & Flagship Studio in Quthbullapur, Hyderabad | DORASANI"
        description={`Contact DORASANI at ${siteSettings.storeAddress}, ${siteSettings.storeCityStatePin}, call ${siteSettings.supportPhone || '+91 7780673360'}, or email ${siteSettings.supportEmail} for custom bridal saree orders, styling appointments, and support.`}
        canonicalPath="/contact"
        keywords="contact DORASANI, DORASANI Hyderabad studio, Quthbullapur handloom saree boutique, Shapur Road sarees, Medchal Dist silk boutique, bridal saree styling appointment"
        jsonLd={contactJsonLd}
      />
      {/* Header */}
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
                  Contact
                </span>
              </li>
            </ol>
          </nav>
          <span className="text-xs font-semibold tracking-[0.25em] text-[#285A3C] uppercase">
            ✦ REACH OUT TO US ✦
          </span>
          <h1 className="font-serif-royal text-3xl sm:text-4xl font-bold text-[#1A3B2B]">
            Contact DORASANI
          </h1>
          <p className="text-xs sm:text-sm text-[#4F6355]">
            Have questions about an upcoming bridal order, custom saree blouse styling, or shipping?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Info */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8C7B5] p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h2 className="font-cinzel-royal font-bold text-lg text-[#1A3B2B]">
                Flagship Studio
              </h2>
              <p className="text-xs text-[#4F6355] mt-1">
                Experience our curated silks in person.
              </p>
            </div>

            <div className="space-y-4 text-xs text-[#4F6355]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-[#285A3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A3B2B]">{siteSettings.storeName}</p>
                  <p>{siteSettings.storeAddress}</p>
                  <p>{siteSettings.storeCityStatePin}</p>
                </div>
              </div>

              {siteSettings.supportPhone && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4 text-[#285A3C]" />
                  </div>
                  <div>
                    <p className="font-bold text-[#1A3B2B]">Customer Care Phone</p>
                    <a
                      href={`tel:${siteSettings.supportPhone.replace(/[^+\d]/g, '')}`}
                      className="hover:text-[#1A3B2B] hover:underline font-medium"
                    >
                      {siteSettings.supportPhone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#285A3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A3B2B]">Email Assistance</p>
                  <p className="break-all">
                    <a
                      href={`mailto:${siteSettings.supportEmail}`}
                      className="hover:text-[#1A3B2B] hover:underline font-medium"
                    >
                      {siteSettings.supportEmail}
                    </a>
                    {siteSettings.conciergeEmail &&
                      siteSettings.conciergeEmail.toLowerCase() !==
                      siteSettings.supportEmail.toLowerCase() ? (
                      <>
                        {' / '}
                        <a
                          href={`mailto:${siteSettings.conciergeEmail}`}
                          className="hover:text-[#1A3B2B] hover:underline font-medium"
                        >
                          {siteSettings.conciergeEmail}
                        </a>
                      </>
                    ) : null}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#285A3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A3B2B]">Store Timings</p>
                  <p>{siteSettings.studioHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#D8C7B5] p-6 sm:p-8 shadow-xs">
            <h2 className="font-cinzel-royal font-bold text-lg text-[#1A3B2B] mb-4">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} method="POST" className="space-y-4 text-xs dorasani-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-[#1A3B2B] font-semibold mb-1">
                    Your Name *
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-[#1A3B2B] font-semibold mb-1">
                    Your Email *
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-[#1A3B2B] font-semibold mb-1">
                  Subject *
                </label>
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bridal Order Inquiry, Saree Customization"
                  className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[#1A3B2B] font-semibold mb-1">
                  Your Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our stylists assist you?"
                  className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="bg-[#285A3C] hover:bg-[#1E432D] disabled:opacity-60 text-white px-6 py-2.5 rounded font-semibold text-xs tracking-wide transition-colors flex items-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Sending...' : 'Send Message'}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Store Location Map */}
        <section className="below-fold-section bg-white rounded-xl border border-[#D8C7B5] overflow-hidden shadow-xs">
          <div className="px-6 py-4 sm:px-8 sm:py-5 border-b border-[#E8DCCF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="font-cinzel-royal font-bold text-lg text-[#1A3B2B]">
                Find Our Boutique
              </h2>
              <p className="text-xs text-[#4F6355] mt-0.5">
                Visit Dorasani Sarees — A Symbol of Tradition in Quthbullapur, Hyderabad.
              </p>
            </div>
            <a
              href="https://maps.google.com/?q=17.5078482,78.4628003"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#285A3C] hover:text-[#1A3B2B] hover:underline shrink-0"
            >
              <span>Open in Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
          <div className="w-full bg-[#FAF5EE]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3804.992987519357!2d78.46022537555304!3d17.507848183400256!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9166f892e9fd%3A0xd4b10eb11b889832!2sDorasani%20Sarees%20A%20Symbol%20of%20Tradition!5e0!3m2!1sen!2sin!4v1794463162758!5m2!1sen!2sin"
              title="Dorasani Sarees A Symbol of Tradition — Store Location Map"
              width={600}
              height={450}
              className="w-full h-[320px] sm:h-[400px] lg:h-[450px] border-0 block"
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </section>
      </div>
    </div>
  );
};

