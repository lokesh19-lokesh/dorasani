import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactPage: React.FC = () => {
  const { showToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Your message has been sent! Our heritage concierge will respond within 24 hours.');
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
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
                  <p className="font-bold text-[#1A3B2B]">DORASANI Flagship</p>
                  <p>Road No. 10, Banjara Hills</p>
                  <p>Hyderabad, Telangana - 500034</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-[#285A3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A3B2B]">Customer Care Phone</p>
                  <p>+91 98765 43210 (Mon - Sat, 9:30 AM - 7:30 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-[#285A3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A3B2B]">Email Assistance</p>
                  <p>support@dorasani.com / concierge@dorasani.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D0E9C0] flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-[#285A3C]" />
                </div>
                <div>
                  <p className="font-bold text-[#1A3B2B]">Studio Timings</p>
                  <p>Monday – Sunday: 10:30 AM – 8:30 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#D8C7B5] p-6 sm:p-8 shadow-xs">
            <h3 className="font-cinzel-royal font-bold text-lg text-[#1A3B2B] mb-4">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1A3B2B] font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
                <div>
                  <label className="block text-[#1A3B2B] font-semibold mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1A3B2B] font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bridal Order Inquiry, Saree Customization"
                  className="w-full bg-[#FAF5EE] border border-[#D8C7B5] rounded p-2.5 text-[#1A3B2B] focus:outline-none focus:border-[#285A3C]"
                />
              </div>

              <div>
                <label className="block text-[#1A3B2B] font-semibold mb-1">Your Message *</label>
                <textarea
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
                className="bg-[#285A3C] hover:bg-[#1E432D] text-white px-6 py-2.5 rounded font-semibold text-xs tracking-wide transition-colors flex items-center gap-2 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

