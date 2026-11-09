import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

  return (
    <div className="space-y-12 pb-16">
      {/* Header */}
      <div className="bg-[#D0E9C0]/40 border-b border-[#BCD8AA] py-10 sm:py-16 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Info */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#D8C7B5] p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="font-cinzel-royal font-bold text-lg text-[#1A3B2B]">
                Flagship Studio
              </h3>
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
                    <p>{siteSettings.supportPhone}</p>
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
                    {siteSettings.supportEmail}
                    {siteSettings.conciergeEmail &&
                    siteSettings.conciergeEmail.toLowerCase() !==
                      siteSettings.supportEmail.toLowerCase()
                      ? ` / ${siteSettings.conciergeEmail}`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#285A3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A3B2B]">Studio Timings</p>
                  <p>{siteSettings.studioHours}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#D8C7B5] p-6 sm:p-8 shadow-xs">
            <h3 className="font-cinzel-royal font-bold text-lg text-[#1A3B2B] mb-4">
              Send Us a Message
            </h3>

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
      </div>
    </div>
  );
};

