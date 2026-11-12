import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Send, Clock, ChevronRight, ExternalLink } from 'lucide-react';
import { SeoHead } from '../components/common/SeoHead';
import { useStore } from '../context/StoreContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { SITE_ORIGIN, buildBreadcrumbSchema, buildCanonicalUrl } from '../utils/seo';

const CONTACT_RECIPIENT_EMAIL = 'dorasanisarees@gmail.com';

function buildContactMailtoUrl(params: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): string {
  const emailSubject = `[DORASANI Contact] ${params.subject} — ${params.name}`;
  const emailBody = [
    `Name: ${params.name}`,
    `Email: ${params.email}`,
    `Subject: ${params.subject}`,
    '',
    'Message:',
    params.message,
  ].join('\n');

  return `mailto:${CONTACT_RECIPIENT_EMAIL}?subject=${encodeURIComponent(
    emailSubject
  )}&body=${encodeURIComponent(emailBody)}`;
}

export const ContactPage: React.FC = () => {
  const { showToast, siteSettings } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<{
    emailSent: boolean;
    mailtoUrl: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanSubject = subject.trim();
    const cleanMessage = message.trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setSubmitting(true);
    setSubmittedNotice(null);
    const mailtoUrl = buildContactMailtoUrl({
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    try {
      let saved = false;
      let emailSent = false;

      if (isSupabaseConfigured) {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('submit-contact', {
          body: {
            fullName: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage,
          },
        });

        if (!fnError && fnData?.success) {
          saved = true;
          emailSent = Boolean(fnData.emailSent);
        } else {
          // Fallback to direct DB insert if the edge function is temporarily unavailable
          const { error: dbError } = await supabase.from('contact_messages').insert({
            full_name: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage,
          });
          if (dbError) {
            showToast('Could not send your message right now. Please try again.', 'error');
            return;
          }
          saved = true;
        }
      } else {
        saved = true;
      }

      if (!saved) {
        showToast('Could not send your message right now. Please try again.', 'error');
        return;
      }

      setSubmittedNotice({ emailSent, mailtoUrl });
      if (emailSent) {
        showToast(
          `Your message has been sent to ${CONTACT_RECIPIENT_EMAIL}! Our heritage concierge will respond within 24 hours.`
        );
      } else {
        showToast('Your inquiry has been saved! Use the email button below if you wish to send a copy directly.');
      }

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

              {(siteSettings.instagramUrl ||
                siteSettings.googleUrl ||
                siteSettings.youtubeUrl ||
                siteSettings.facebookUrl) && (
                <div className="pt-3 border-t border-[#E8DCCF] space-y-2.5">
                  <p className="font-bold text-[#1A3B2B]">Connect With Us</p>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {siteSettings.instagramUrl && (
                      <a
                        href={siteSettings.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#D8C7B5] text-[#1A3B2B] hover:border-[#285A3C] hover:bg-[#D0E9C0]/40 font-semibold transition-colors"
                        aria-label="Follow DORASANI on Instagram"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-[#285A3C]" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                        <span>Instagram</span>
                      </a>
                    )}
                    {siteSettings.googleUrl && (
                      <a
                        href={siteSettings.googleUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#D8C7B5] text-[#1A3B2B] hover:border-[#285A3C] hover:bg-[#D0E9C0]/40 font-semibold transition-colors"
                        aria-label="View DORASANI on Google"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-[#285A3C]" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        <span>Google</span>
                      </a>
                    )}
                    {siteSettings.youtubeUrl && (
                      <a
                        href={siteSettings.youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#D8C7B5] text-[#1A3B2B] hover:border-[#285A3C] hover:bg-[#D0E9C0]/40 font-semibold transition-colors"
                        aria-label="Watch DORASANI on YouTube"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-[#285A3C]" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        <span>YouTube</span>
                      </a>
                    )}
                    {siteSettings.facebookUrl && (
                      <a
                        href={siteSettings.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5EE] border border-[#D8C7B5] text-[#1A3B2B] hover:border-[#285A3C] hover:bg-[#D0E9C0]/40 font-semibold transition-colors"
                        aria-label="Follow DORASANI on Facebook"
                      >
                        <svg className="w-3.5 h-3.5 fill-current text-[#285A3C]" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        <span>Facebook</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
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

              {submittedNotice && (
                <div className="rounded-lg border border-[#BCD8AA] bg-[#F3F8F1] p-3.5 text-xs text-[#1A3B2B] space-y-2">
                  <p className="font-semibold">
                    {submittedNotice.emailSent
                      ? `Thank you! Your inquiry was sent to ${CONTACT_RECIPIENT_EMAIL}.`
                      : `Your inquiry has been saved for our team (${CONTACT_RECIPIENT_EMAIL}).`}
                  </p>
                  {!submittedNotice.emailSent && (
                    <a
                      href={submittedNotice.mailtoUrl}
                      className="inline-flex items-center gap-1.5 font-semibold text-[#285A3C] hover:text-[#1E432D] underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send via Email App to {CONTACT_RECIPIENT_EMAIL}</span>
                    </a>
                  )}
                </div>
              )}
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

