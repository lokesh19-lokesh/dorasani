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
      <div className="bg-[#FAF2EB] border-b border-[#EEDCD1] py-10 sm:py-16 px-4 sm:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold tracking-[0.25em] text-[#C99632] uppercase">
            ✦ REACH OUT TO US ✦
          </span>
          <h1 className="font-serif-royal text-3xl sm:text-4xl font-bold text-[#2D141A]">
            Contact DORASANI
          </h1>
          <p className="text-xs sm:text-sm text-[#74565D]">
            Have questions about an upcoming bridal order, custom saree blouse styling, or shipping?
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Info */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-[#EEDCD1] p-6 sm:p-8 space-y-6 shadow-xs">
            <div>
              <h3 className="font-cinzel-royal font-bold text-lg text-[#2D141A]">
                Flagship Studio
              </h3>
              <p className="text-xs text-[#74565D] mt-1">
                Experience our curated silks in person.
              </p>
            </div>

            <div className="space-y-4 text-xs text-[#74565D]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#AC1443] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D141A]">DORASANI Flagship</p>
                  <p>Road No. 10, Banjara Hills</p>
                  <p>Hyderabad, Telangana - 500034</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-[#AC1443] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D141A]">Customer Care Phone</p>
                  <p>+91 98765 43210 (Mon - Sat, 9:30 AM - 7:30 PM)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#AC1443] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D141A]">Email Assistance</p>
                  <p>support@dorasani.com / concierge@dorasani.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#AC1443] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#2D141A]">Studio Timings</p>
                  <p>Monday – Sunday: 10:30 AM – 8:30 PM IST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-[#EEDCD1] p-6 sm:p-8 shadow-xs">
            <h3 className="font-cinzel-royal font-bold text-lg text-[#2D141A] mb-4">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
                <div>
                  <label className="block text-[#2D141A] font-semibold mb-1">Your Email *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#2D141A] font-semibold mb-1">Subject *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Bridal Order Inquiry, Saree Customization"
                  className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                />
              </div>

              <div>
                <label className="block text-[#2D141A] font-semibold mb-1">Your Message *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can our stylists assist you?"
                  className="w-full bg-[#FCF5EE] border border-[#DEC3B4] rounded p-2.5 text-[#2D141A] focus:outline-none focus:border-[#AC1443]"
                />
              </div>

              <button
                type="submit"
                className="bg-[#AC1443] hover:bg-[#860E33] text-white px-6 py-2.5 rounded font-semibold text-xs tracking-wide transition-colors flex items-center gap-2"
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
