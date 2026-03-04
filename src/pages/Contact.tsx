import React, { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC' }}>
      {/* Hero Header */}
      <div style={{ backgroundColor: '#0B1C4D', paddingTop: '80px', paddingBottom: '60px' }}>
        <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold mb-4" style={{ color: '#FFFFFF' }}>
            Contact Us
          </h1>
          <p className="text-xl" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Get in touch with the Ditech Asia Journal team. We're here to help.
          </p>
        </div>
      </div>

      <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email */}
            <div 
              className="bg-white transition-all hover:shadow-xl"
              style={{
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)'
              }}
            >
              <div className="flex items-start">
                <div 
                  className="flex items-center justify-center mr-4 flex-shrink-0"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#EFF6FF',
                    borderRadius: '8px'
                  }}
                >
                  <Mail style={{ color: '#2563EB' }} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Email</h3>
                  <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                    For general inquiries and support
                  </p>
                  <a
                    href="mailto:contact@ditechasia.org"
                    className="hover:underline"
                    style={{ color: '#2563EB' }}
                  >
                    contact@ditechasia.org
                  </a>
                </div>
              </div>
            </div>

            {/* Editorial Office */}
            <div 
              className="bg-white transition-all hover:shadow-xl"
              style={{
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)'
              }}
            >
              <div className="flex items-start">
                <div 
                  className="flex items-center justify-center mr-4 flex-shrink-0"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#F3E8FF',
                    borderRadius: '8px'
                  }}
                >
                  <Mail style={{ color: '#9333EA' }} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Editorial Office</h3>
                  <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                    For manuscript and editorial matters
                  </p>
                  <a
                    href="mailto:editor@ditechasia.org"
                    className="hover:underline"
                    style={{ color: '#2563EB' }}
                  >
                    editor@ditechasia.org
                  </a>
                </div>
              </div>
            </div>

            {/* Address */}
            <div 
              className="bg-white transition-all hover:shadow-xl"
              style={{
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)'
              }}
            >
              <div className="flex items-start">
                <div 
                  className="flex items-center justify-center mr-4 flex-shrink-0"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#DCFCE7',
                    borderRadius: '8px'
                  }}
                >
                  <MapPin style={{ color: '#10B981' }} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Address</h3>
                  <p className="text-sm" style={{ color: '#64748B' }}>
                    Ditech Asia Publishing<br />
                    123 Research Boulevard, Suite 400<br />
                    Tech City, TC 12345<br />
                    United States
                  </p>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div 
              className="bg-white transition-all hover:shadow-xl"
              style={{
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)'
              }}
            >
              <div className="flex items-start">
                <div 
                  className="flex items-center justify-center mr-4 flex-shrink-0"
                  style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#FEF3C7',
                    borderRadius: '8px'
                  }}
                >
                  <Phone style={{ color: '#F59E0B' }} size={20} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#0B1C4D' }}>Phone</h3>
                  <p className="text-sm mb-2" style={{ color: '#64748B' }}>
                    Monday - Friday, 9:00 AM - 5:00 PM EST
                  </p>
                  <a
                    href="tel:+15551234567"
                    className="hover:underline"
                    style={{ color: '#2563EB' }}
                  >
                    +1 (555) 123-4567
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div 
              className="rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #EFF6FF 0%, #F3E8FF 100%)',
                border: '2px solid #93C5FD',
                padding: '24px'
              }}
            >
              <h3 className="font-semibold mb-4" style={{ color: '#0B1C4D' }}>Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="/submit" className="hover:underline" style={{ color: '#2563EB' }}>
                    → Submit a Manuscript
                  </a>
                </li>
                <li>
                  <a href="/guidelines" className="hover:underline" style={{ color: '#2563EB' }}>
                    → Author Guidelines
                  </a>
                </li>
                <li>
                  <a href="/editorial-board" className="hover:underline" style={{ color: '#2563EB' }}>
                    → Editorial Board
                  </a>
                </li>
                <li>
                  <a href="/policies" className="hover:underline" style={{ color: '#2563EB' }}>
                    → Journal Policies
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div 
              className="bg-white transition-all hover:shadow-xl"
              style={{
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
                borderLeft: '4px solid #2563EB'
              }}
            >
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Send Us a Message</h2>

              {submitted ? (
                <div className="text-center py-12">
                  <div 
                    className="rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      backgroundColor: '#DCFCE7'
                    }}
                  >
                    <CheckCircle style={{ color: '#10B981' }} size={40} />
                  </div>
                  <h3 className="text-2xl font-bold mb-2" style={{ color: '#0B1C4D' }}>Message Sent!</h3>
                  <p style={{ color: '#64748B' }}>
                    Thank you for contacting us. We'll get back to you within 1-2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2" style={{ color: '#0B1C4D' }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ borderColor: '#CBD5E1' }}
                        placeholder="Dr. Jane Smith"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#0B1C4D' }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        style={{ borderColor: '#CBD5E1' }}
                        placeholder="jane.smith@university.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2" style={{ color: '#0B1C4D' }}>
                      Subject *
                    </label>
                    <select
                      id="subject"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ borderColor: '#CBD5E1' }}
                    >
                      <option value="">Select a subject</option>
                      <option value="submission">Manuscript Submission Inquiry</option>
                      <option value="review">Review Status Question</option>
                      <option value="editorial">Join Editorial Board</option>
                      <option value="reviewer">Become a Reviewer</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership Opportunities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2" style={{ color: '#0B1C4D' }}>
                      Message *
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={8}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      style={{ borderColor: '#CBD5E1' }}
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <div 
                    className="rounded-lg"
                    style={{
                      backgroundColor: '#EFF6FF',
                      border: '2px solid #93C5FD',
                      padding: '16px'
                    }}
                  >
                    <p className="text-sm" style={{ color: '#1E3A8A' }}>
                      <strong>Note:</strong> This is a UI demo. In production, form submissions would 
                      be processed through Supabase and you would receive email notifications.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full px-6 py-4 font-medium rounded-lg transition-all hover:shadow-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, #0B1C4D 0%, #2563EB 100%)',
                      color: '#FFFFFF',
                      boxShadow: '0 10px 30px rgba(11, 28, 77, 0.2)'
                    }}
                  >
                    <Send size={20} className="mr-2" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Section */}
            <div 
              className="mt-8 bg-white transition-all hover:shadow-xl"
              style={{
                borderRadius: '16px',
                padding: '32px',
                boxShadow: '0 10px 30px rgba(11, 28, 77, 0.08)',
                borderLeft: '4px solid #2563EB'
              }}
            >
              <h3 className="text-2xl font-bold mb-6" style={{ color: '#0B1C4D' }}>Frequently Asked Questions</h3>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>
                    How long does the review process take?
                  </h4>
                  <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>
                    Our target is 7-14 days for initial editorial screening, followed by 4-6 weeks 
                    for peer review. Authors receive regular updates throughout the process.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>
                    Are there any publication fees?
                  </h4>
                  <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>
                    During our MVP phase, Ditech Asia Journal does not charge article processing charges (APCs). 
                    Any future fee structure will be announced well in advance.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>
                    Can I track my submission status?
                  </h4>
                  <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>
                    Yes! Authors receive email updates at each stage. We're also building an author 
                    dashboard that will allow real-time tracking (coming soon).
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>
                    How can I become a reviewer?
                  </h4>
                  <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>
                    We welcome qualified researchers to join our reviewer pool. Please use the contact 
                    form above with subject "Become a Reviewer" and include your CV and areas of expertise.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2" style={{ color: '#0B1C4D' }}>
                    What file formats do you accept?
                  </h4>
                  <p className="text-sm" style={{ color: '#475569', lineHeight: '1.7' }}>
                    For initial submission, we accept PDF files. Upon acceptance, we may request 
                    source files in LaTeX or Microsoft Word format for final production.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}