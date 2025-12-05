'use client';

import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [settings, setSettings] = useState({
    phone: '',
    email: '',
    address: '',
    city: '',
    workingHours: '',
    facebook: '',
    instagram: '',
    twitter: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    console.log('Contact form submitted:', formData);
    alert('Message sent! We will get back to you soon.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-chocolate-50/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold font-serif text-chocolate-900 mb-4"
          >
            Get in Touch
          </motion.h1>
          <p className="text-chocolate-600 text-lg max-w-2xl mx-auto">
            Have a question or want to place a custom order? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-8"
          >
            <div className="bg-white dark:bg-chocolate-900 p-8 rounded-2xl shadow-sm border border-chocolate-100 dark:border-chocolate-800">
              <h3 className="text-2xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-6 font-serif">Contact Information</h3>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-chocolate-50 dark:bg-chocolate-800 p-3 rounded-full text-chocolate-600 dark:text-chocolate-300">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-chocolate-800 dark:text-chocolate-200">Phone</h4>
                    <p className="text-chocolate-600 dark:text-chocolate-300">{settings.phone}</p>
                    {settings.workingHours && (
                      <p className="text-sm text-chocolate-400">{settings.workingHours}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-chocolate-50 dark:bg-chocolate-800 p-3 rounded-full text-chocolate-600 dark:text-chocolate-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-chocolate-800 dark:text-chocolate-200">Email</h4>
                    <p className="text-chocolate-600 dark:text-chocolate-300">{settings.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-chocolate-50 dark:bg-chocolate-800 p-3 rounded-full text-chocolate-600 dark:text-chocolate-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-chocolate-800 dark:text-chocolate-200">Location</h4>
                    <p className="text-chocolate-600 dark:text-chocolate-300">
                      {settings.address}<br />{settings.city}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-chocolate-100 dark:border-chocolate-800">
                <h4 className="font-bold text-chocolate-800 dark:text-chocolate-200 mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  {settings.instagram && (
                    <a 
                      href={settings.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-chocolate-600 text-white p-3 rounded-full hover:bg-chocolate-700 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {settings.facebook && (
                    <a 
                      href={settings.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-chocolate-600 text-white p-3 rounded-full hover:bg-chocolate-700 transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {settings.twitter && (
                    <a 
                      href={settings.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-chocolate-600 text-white p-3 rounded-full hover:bg-chocolate-700 transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-chocolate-900 p-8 rounded-2xl shadow-sm border border-chocolate-100 dark:border-chocolate-800"
          >
            <h3 className="text-2xl font-bold text-chocolate-900 dark:text-chocolate-100 mb-6 font-serif">Send us a Message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-chocolate-700 dark:text-chocolate-300 mb-1">Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-chocolate-200 dark:border-chocolate-700 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors bg-chocolate-50/30 dark:bg-chocolate-800/30 text-black dark:text-chocolate-100"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 dark:text-chocolate-300 mb-1">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-chocolate-200 dark:border-chocolate-700 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors bg-chocolate-50/30 dark:bg-chocolate-800/30 text-black dark:text-chocolate-100"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-chocolate-700 dark:text-chocolate-300 mb-1">Message</label>
                <textarea
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-chocolate-200 dark:border-chocolate-700 focus:border-chocolate-500 focus:ring-1 focus:ring-chocolate-500 outline-none transition-colors bg-chocolate-50/30 dark:bg-chocolate-800/30 text-black dark:text-chocolate-100"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-chocolate-600 dark:bg-chocolate-700 text-white py-4 rounded-full font-bold hover:bg-chocolate-700 dark:hover:bg-chocolate-600 transition-all shadow-lg"
              >
                Send Message
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
