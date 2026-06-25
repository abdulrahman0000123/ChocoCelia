'use client';

import React, { useEffect, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';

function TikTokPixelTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ttq && typeof (window as any).ttq.page === 'function') {
      (window as any).ttq.page();
    }
  }, [pathname]);

  return null;
}

export function TikTokPixelProvider() {
  const pixelId = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;

  if (!pixelId) return null;

  return (
    <>
      <Script
        id="tiktok-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function (w, d, t) {
              w.TiktokSdkObject = t;
              var ttq = w[t] = w[t] || [];
              ttq.methods = ["page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "track5", "trackSingle"];
              ttq.setAndDefer = function (t, e) {
                t.placeholder = true;
                t.on = function () {
                  var e = arguments;
                  e.placeholder = true;
                  t.queue.push({
                    m: "on",
                    p: e
                  })
                };
                t.off = function () {
                  var e = arguments;
                  e.placeholder = true;
                  t.queue.push({
                    m: "off",
                    p: e
                  })
                };
                t.once = function () {
                  var e = arguments;
                  e.placeholder = true;
                  t.queue.push({
                    m: "once",
                    p: e
                  })
                };
                t.queue = [];
                w.addEventListener("DOMContentLoaded", function () {
                  var s = d.createElement("script");
                  s.type = "text/javascript";
                  s.async = true;
                  s.src = "https://analytics.tiktok.com/i18n/pixel/sdk.js?sdkid=" + e;
                  var a = d.getElementsByTagName("script")[0];
                  a.parentNode.insertBefore(s, a)
                })
              };
              ttq.load = function (e) {
                var t = "TTQ_" + e;
                if (!w[t]) {
                  w[t] = {};
                  ttq.setAndDefer(w[t], e);
                  ttq.instances.push(w[t])
                }
              };
              ttq.instances = [];
              ttq.load('${pixelId}');
              ttq.page();
            }(window, document, 'ttq');
          `,
        }}
      />
      <Suspense fallback={null}>
        <TikTokPixelTracker />
      </Suspense>
    </>
  );
}
