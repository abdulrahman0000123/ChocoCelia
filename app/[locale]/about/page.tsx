import { pageMetadata } from "@/app/lib/seo";
import React from "react";
import { AboutClient } from "../../components/AboutClient";
import { getSettings } from "@/app/lib/products";
import type { Metadata } from "next";
import { storyCopy } from "@/app/lib/story";

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: AboutPageProps): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === "ar" ? "قصتنا | شوكو سيليا" : "Our Story | Choco Celia";
  const description = storyCopy[locale === "ar" ? "ar" : "en"].description;
  return pageMetadata({
    locale,
    path: "/about",
    entityType: "page",
    entityId: "about",
    title,
    description,
    image: "/images/story/chocolate-gift.webp",
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  const settings = await getSettings();

  return (
    <AboutClient
      settings={{ facebook: settings.facebook, instagram: settings.instagram }}
      locale={locale}
    />
  );
}
