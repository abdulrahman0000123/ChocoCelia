'use client';

import React from 'react';
import { Phone } from 'lucide-react';

interface WhatsAppButtonProps {
  phone?: string;
  locale: string;
}

export function WhatsAppButton({ phone = '201XXXXXXXXX', locale }: WhatsAppButtonProps) {
  // Pre-filled messages for WhatsApp
  const message = locale === 'ar' 
    ? encodeURIComponent('مرحباً شوكو سيليا، أود الاستفسار عن منتجات الشوكولاتة المتوفرة ولدي بعض الأسئلة.')
    : encodeURIComponent('Hello Choco-Celia, I would like to inquire about your handmade chocolates.');

  // Clean phone number (remove +, spaces, dashes)
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  
  // WhatsApp URL (using api.whatsapp.com for best cross-platform compatibility)
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full shadow-2xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-4 focus:ring-green-300 active:scale-95 group ${
        locale === 'ar' ? 'left-6' : 'right-6'
      }`}
      aria-label={locale === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contact us on WhatsApp'}
      title={locale === 'ar' ? 'تواصل معنا عبر واتساب' : 'Contact us on WhatsApp'}
    >
      {/* Pulse effect */}
      <span className="absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-75 animate-ping group-hover:hidden" style={{ animationDuration: '2s' }} />
      
      {/* WhatsApp SVG Icon */}
      <svg
        className="w-8 h-8 fill-current relative z-10"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.59 2.023 14.12 1.001 11.49 1c-5.444 0-9.866 4.372-9.87 9.802 0 1.714.502 3.39 1.45 4.884l-.988 3.606 3.733-.967zm12.316-5.836c-.33-.162-1.952-.951-2.253-1.059-.3-.109-.519-.163-.74.162-.22.324-.85.162-1.042.378-.19.216-.382.243-.71.081-.328-.162-1.385-.505-2.64-1.611-.976-.86-1.635-1.927-1.826-2.252-.19-.325-.02-.501.144-.663.15-.147.33-.378.496-.568.167-.189.222-.324.33-.54.11-.217.055-.405-.027-.568-.082-.162-.74-1.758-1.014-2.406-.267-.648-.561-.56-.771-.571-.2-.01-.428-.012-.656-.012-.228 0-.6-.086-.913.243-.314.33-1.196 1.15-.196 3.208 1 2.057 2.22 4.037 2.413 4.298.192.262 4.328 6.534 10.485 9.124 1.464.615 2.61.983 3.504 1.263 1.472.463 2.813.398 3.874.241 1.18-.176 2.253-.918 2.56-1.81.306-.893.306-1.658.214-1.81-.09-.163-.33-.27-.66-.432z" />
      </svg>
    </a>
  );
}
