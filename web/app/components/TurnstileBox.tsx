"use client";

import { useEffect, useRef } from "react";

// Cloudflare Turnstile — hanya aktif bila NEXT_PUBLIC_TURNSTILE_SITE_KEY diset.
// Bila kosong: tidak render apa-apa (server tetap aman via honeypot + CSRF +
// rate-limit + timing). Token diteruskan via onToken untuk dikirim ke API.
declare global {
  interface Window {
    __kolaseTurnstileCb?: (token: string) => void;
    turnstile?: { reset: (id?: string) => void };
  }
}

export default function TurnstileBox({ onToken }: { onToken: (token: string) => void }) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!siteKey) return;
    window.__kolaseTurnstileCb = (token: string) => onToken(token);
    const scriptId = "cf-turnstile-script";
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    }
    return () => {
      window.__kolaseTurnstileCb = undefined;
    };
  }, [siteKey, onToken]);

  if (!siteKey) return null;
  return (
    <div className="mt-2">
      <div
        ref={ref}
        className="cf-turnstile"
        data-sitekey={siteKey}
        data-callback="__kolaseTurnstileCb"
      />
    </div>
  );
}
