'use client';

import React, { useState } from 'react';

interface QuickContactMenuProps {
  phone?: string;
  facebook?: string;
  instagram?: string;
  locale: string;
}

export function QuickContactMenu({
  phone = '201000000000',
  facebook = '',
  instagram = '',
  locale,
}: QuickContactMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const whatsappMessage = locale === 'ar'
    ? encodeURIComponent('مرحباً شوكو سيليا، أود الاستفسار عن منتجات الشوكولاتة المتوفرة.')
    : encodeURIComponent('Hello Choco-Celia, I would like to inquire about your handmade chocolates.');

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${whatsappMessage}`;

  const getMessengerUrl = (fbUrl: string) => {
    if (!fbUrl) return 'https://m.me/chococelia2025';
    try {
      if (fbUrl.includes('profile.php')) {
        const urlObj = new URL(fbUrl);
        const id = urlObj.searchParams.get('id');
        if (id) return `https://m.me/${id}`;
      }
      const cleaned = fbUrl.replace(/\/$/, '');
      const parts = cleaned.split('/');
      const pageName = parts[parts.length - 1];
      if (pageName) return `https://m.me/${pageName}`;
    } catch (e) { /* ignore */ }
    return 'https://m.me/chococelia2025';
  };

  const messengerUrl = getMessengerUrl(facebook);
  const instagramUrl = instagram || 'https://www.instagram.com/chococelia2025/';

  const isRtl = locale === 'ar';

  return (
    <>
      {/* Keyframes for ping animation */}
      <style>{`
        @keyframes qcm-ping {
          0% { transform: scale(1); opacity: 0.7; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>

      {/* Fixed wrapper — anchored to bottom corner */}
      <div
        style={{
          position: 'fixed',
          bottom: '24px',
          ...(isRtl ? { left: '24px' } : { right: '24px' }),
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: isRtl ? 'flex-start' : 'flex-end',
          gap: '10px',
          pointerEvents: 'none', // container is non-interactive
        }}
      >
        {/* Contact links — shown above button when open */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            alignItems: isRtl ? 'flex-start' : 'flex-end',
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            opacity: isOpen ? 1 : 0,
            transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.85)',
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
        >
          {/* WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: '#25D366',
              color: '#fff',
              borderRadius: '50px',
              boxShadow: '0 4px 15px rgba(37,211,102,0.5)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: 'sans-serif',
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
            }}
          >
            <svg style={{ width: 22, height: 22, fill: '#fff', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.967C16.59 2.023 14.12 1.001 11.49 1c-5.444 0-9.866 4.372-9.87 9.802 0 1.714.502 3.39 1.45 4.884l-.988 3.606 3.733-.967zm12.316-5.836c-.33-.162-1.952-.951-2.253-1.059-.3-.109-.519-.163-.74.162-.22.324-.85.162-1.042.378-.19.216-.382.243-.71.081-.328-.162-1.385-.505-2.64-1.611-.976-.86-1.635-1.927-1.826-2.252-.19-.325-.02-.501.144-.663.15-.147.33-.378.496-.568.167-.189.222-.324.33-.54.11-.217.055-.405-.027-.568-.082-.162-.74-1.758-1.014-2.406-.267-.648-.561-.56-.771-.571-.2-.01-.428-.012-.656-.012-.228 0-.6-.086-.913.243-.314.33-1.196 1.15-.196 3.208 1 2.057 2.22 4.037 2.413 4.298.192.262 4.328 6.534 10.485 9.124 1.464.615 2.61.983 3.504 1.263 1.472.463 2.813.398 3.874.241 1.18-.176 2.253-.918 2.56-1.81.306-.893.306-1.658.214-1.81-.09-.163-.33-.27-.66-.432z"/>
            </svg>
            WhatsApp
          </a>

          {/* Messenger */}
          <a
            href={messengerUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Messenger"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #006AFF 0%, #00B2FF 100%)',
              color: '#fff',
              borderRadius: '50px',
              boxShadow: '0 4px 15px rgba(0,106,255,0.5)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: 'sans-serif',
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
            }}
          >
            <svg style={{ width: 22, height: 22, fill: '#fff', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.085.297 2.24.457 3.443.457 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.258 14.886l-3.09-3.297-6.027 3.297 6.627-7.037 3.153 3.297 5.964-3.297-6.627 7.037z"/>
            </svg>
            Messenger
          </a>

          {/* Instagram */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #405DE6 0%, #E1306C 50%, #FFDC80 100%)',
              color: '#fff',
              borderRadius: '50px',
              boxShadow: '0 4px 15px rgba(225,48,108,0.5)',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: 'sans-serif',
              whiteSpace: 'nowrap',
              pointerEvents: 'auto',
            }}
          >
            <svg style={{ width: 22, height: 22, fill: '#fff', flexShrink: 0 }} viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            Instagram
          </a>
        </div>

        {/* Main FAB Toggle Button */}
        <div style={{ position: 'relative', pointerEvents: 'auto' }}>
          {/* Ping ring */}
          {!isOpen && (
            <span
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                backgroundColor: '#F0C060',
                opacity: 0.6,
                animation: 'qcm-ping 1.8s ease-out infinite',
              }}
            />
          )}
          <button
            onClick={() => setIsOpen(o => !o)}
            aria-label={isRtl ? 'تواصل معنا' : 'Contact Us'}
            title={isRtl ? 'تواصل معنا' : 'Contact Us'}
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '58px',
              height: '58px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #B8860B 0%, #F0C060 50%, #C9973A 100%)',
              boxShadow: '0 6px 20px rgba(180,130,30,0.7)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              zIndex: 1,
            }}
          >
            {isOpen ? (
              /* X icon */
              <svg style={{ width: 26, height: 26, stroke: '#3B1A00', fill: 'none', strokeWidth: 2.5, strokeLinecap: 'round' }} viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              /* Chat icon */
              <svg style={{ width: 26, height: 26, fill: '#3B1A00' }} viewBox="0 0 24 24">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
