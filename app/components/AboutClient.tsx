"use client";

import Image from "next/image";
import { ArrowDown, ArrowUpRight, Facebook, Instagram } from "lucide-react";
import { Link } from "@/i18n/routing";
import { storyCopy } from "@/app/lib/story";
import styles from "./AboutClient.module.css";

interface AboutClientProps {
  settings: { facebook?: string | null; instagram?: string | null };
  locale: string;
}

export function AboutClient({ settings, locale }: AboutClientProps) {
  const isAr = locale === "ar";
  const copy = storyCopy[isAr ? "ar" : "en"];
  return (
    <article className={styles.page} dir={isAr ? "rtl" : "ltr"}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h1>
            {copy.title}
            <span>{copy.titleAccent}</span>
          </h1>
          <p className={styles.intro}>{copy.intro}</p>
          <a className={styles.readStory} href="#the-beginning">
            {copy.readStory}
            <ArrowDown size={18} aria-hidden="true" />
          </a>
          <div className={styles.heroNote}>
            <span className="brand-mark" aria-hidden="true" />
            <p>{copy.note}</p>
          </div>
        </div>
        <figure className={styles.heroImage}>
          <Image
            src="/images/story/chocolate-gift.webp"
            alt={copy.imageAlt}
            fill
            priority
            sizes="(max-width: 760px) 100vw, (max-width: 1240px) 48vw, 580px"
          />
          <figcaption>{copy.imageCaption}</figcaption>
        </figure>
      </header>
      <section
        className={styles.beginning}
        id="the-beginning"
        aria-labelledby="beginning-title"
      >
        <div className={styles.chapterHeading}>
          <span className={styles.chapterNumber} aria-hidden="true">
            01
          </span>
          <h2 id="beginning-title">{copy.beginningTitle}</h2>
          <p>{copy.beginningAside}</p>
        </div>
        <div className={styles.prose}>
          <p className={styles.lead}>{copy.beginningLead}</p>
          <p>{copy.beginningBody}</p>
          <p>{copy.beginningEnd}</p>
        </div>
      </section>
      <section className={styles.quoteSection} aria-label={copy.quoteLabel}>
        <span className={styles.quoteMark} aria-hidden="true">
          “
        </span>
        <blockquote>{copy.quote}</blockquote>
        <p>{copy.quoteNote}</p>
        <svg
          className={styles.heart}
          width="60"
          height="54"
          viewBox="0 0 60 54"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M30 49C25 44 5 31 5 17C5 3 24 0 30 13C36 0 55 3 55 17C55 31 35 44 30 49Z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>
      </section>
      <section className={styles.sharing} aria-labelledby="sharing-title">
        <div className={styles.chapterHeading}>
          <span className={styles.chapterNumber} aria-hidden="true">
            02
          </span>
          <h2 id="sharing-title">{copy.sharingTitle}</h2>
          <p>{copy.sharingAside}</p>
        </div>
        <div className={styles.prose}>
          <p className={styles.lead}>{copy.sharingLead}</p>
          <p>{copy.sharingBody}</p>
          <p>{copy.sharingEnd}</p>
          <p className={styles.signature}>
            <span dir="ltr">Choco Celia</span>
            <span>{copy.signature}</span>
          </p>
        </div>
      </section>
      <section className={styles.invitation} aria-labelledby="invitation-title">
        <div>
          <h2 id="invitation-title">{copy.invitationTitle}</h2>
          <p>{copy.invitationBody}</p>
          <Link href="/menu" className={styles.collectionLink}>
            {copy.collection}
            <ArrowUpRight size={20} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.social}>
          <p>{copy.socialIntro}</p>
          <div className={styles.socialLinks}>
            <a
              href={
                settings.facebook ||
                "https://www.facebook.com/profile.php?id=61582630209700"
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.facebookLabel}
            >
              <Facebook size={19} aria-hidden="true" />
              {copy.facebook}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a
              href={
                settings.instagram ||
                "https://www.instagram.com/chococelia2025/"
              }
              target="_blank"
              rel="noopener noreferrer"
              aria-label={copy.instagramLabel}
            >
              <Instagram size={19} aria-hidden="true" />
              {copy.instagram}
              <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
    </article>
  );
}
