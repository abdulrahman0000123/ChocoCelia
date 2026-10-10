'use client';

import Image from 'next/image';
import { ArrowUpRight, MapPin, Instagram, Facebook, Twitter, Phone, MessageCircle, Music2 } from 'lucide-react';
import { useState, useEffect, use } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { trackWhatsAppClick } from '@/app/lib/analytics';
import styles from './Contact.module.css';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const tiktokUrl = 'https://www.tiktok.com/@choco.celia?_r=1&_t=ZS-9ARpTtL8ICK';

export default function ContactPage({ params }: PageProps) {
  const { locale } = use(params);
  const t = useTranslations();
  const isAr = locale === 'ar';
  const [settings, setSettings] = useState({ facebook: '', instagram: '', twitter: '', phone: '' });

  useEffect(() => {
    let active = true;
    fetch('/api/settings')
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          if (active) setSettings(data);
        }
      })
      .catch(() => console.error('Failed to load contact details'));
    return () => { active = false; };
  }, []);

  const phone = (settings.phone || '201111913570').replace(/[^0-9]/g, '');
  const socials = [
    { name: 'Instagram', href: settings.instagram, Icon: Instagram, description: isAr ? 'لحظاتنا الحلوة بالصور' : 'Our sweet moments in pictures' },
    { name: 'Facebook', href: settings.facebook, Icon: Facebook, description: isAr ? 'أخبارنا وأحدث المنتجات' : 'Our news and latest products' },
    { name: 'TikTok', href: tiktokUrl, Icon: Music2, description: isAr ? 'شوف كواليس شوكو سيليا' : 'Go behind the scenes with Choco Celia' },
    { name: 'Twitter', href: settings.twitter, Icon: Twitter, description: isAr ? 'تابع جديدنا' : 'Keep up with us' },
  ].filter(social => social.href);

  return (
    <div className={styles.page} dir={isAr ? 'rtl' : 'ltr'}>
      <section className={styles.hero} aria-labelledby="contact-title">
        <div className={styles.copy}>
          <p className={styles.eyebrow}>CHOCO CELIA · {isAr ? 'خلّينا على تواصل' : 'LET’S KEEP IN TOUCH'}</p>
          <h1 id="contact-title">{t('getInTouch')}<span>{isAr ? 'لكل لحظة حلوة.' : 'For every sweet moment.'}</span></h1>
          <p className={styles.intro}>{t('contactSubtitle')}</p>
          <div className={styles.actions}>
            <a href={`https://api.whatsapp.com/send?phone=${phone}`} target="_blank" rel="noopener noreferrer" onClick={trackWhatsAppClick} className={styles.whatsapp}>
              <MessageCircle size={21} aria-hidden="true" />{isAr ? 'تواصل على واتساب' : 'Chat on WhatsApp'}<ArrowUpRight size={18} aria-hidden="true" />
            </a>
            <a href={`tel:+${phone}`} className={styles.call}><Phone size={19} aria-hidden="true" />{isAr ? 'اتصل بنا' : 'Call us'}</a>
          </div>
          <div className={styles.location}>
            <MapPin size={22} aria-hidden="true" />
            <div><h2>{t('location')}</h2><p>{isAr ? 'محافظة بني سويف، جمهورية مصر العربية' : 'Beni-Suef Governorate, Egypt'}</p></div>
          </div>
        </div>
        <figure className={styles.photo}>
          <Image src="/images/story/chocolate-gift.webp" alt={isAr ? 'شوكولاتة شوكو سيليا مغلفة كهدية' : 'Choco Celia chocolates wrapped as a gift'} fill sizes="(max-width: 899px) 100vw, 46vw" priority />
          <figcaption>{isAr ? 'حكايتنا تبدأ بالشوكولاتة، وتكمل معاك.' : 'Our story starts with chocolate, and continues with you.'}</figcaption>
        </figure>
      </section>
      <section className={styles.socialSection} aria-labelledby="social-title">
        <div className={styles.socialIntro}><h2 id="social-title">{t('followUs')}</h2><p>{isAr ? 'منتجات جديدة، أفكار هدايا، وكواليس من عالمنا.' : 'New chocolates, gift ideas, and a glimpse into our world.'}</p></div>
        <div className={styles.socials}>
          {socials.map(({ name, href, Icon, description }) => (
            <a key={name} href={href} target="_blank" rel="noopener noreferrer" className={styles.social} aria-label={name}>
              <Icon size={25} strokeWidth={1.6} aria-hidden="true" />
              <div><span dir="ltr">{name}</span><p>{description}</p></div>
              <ArrowUpRight size={20} className={styles.arrow} aria-hidden="true" />
            </a>
          ))}
        </div>
      </section>
      <div className={styles.menuLink}><p>{isAr ? 'لسه بتختار لحظتك الحلوة؟' : 'Still choosing your sweet moment?'}</p><Link href="/menu">{t('browseMenu')}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    </div>
  );
}
