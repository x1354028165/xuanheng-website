"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const COOKIE_CONSENT_KEY = "cookie-consent";
const CONSENT_EXPIRY_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

type ConsentValue = "accepted" | "essential" | null;

function getStoredConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { value: string; expiry: number };
    if (Date.now() > parsed.expiry) {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
      return null;
    }
    return parsed.value as ConsentValue;
  } catch {
    return null;
  }
}

function setStoredConsent(value: "accepted" | "essential") {
  localStorage.setItem(
    COOKIE_CONSENT_KEY,
    JSON.stringify({ value, expiry: Date.now() + CONSENT_EXPIRY_MS })
  );
}

export function CookieBanner() {
  const t = useTranslations("cookie");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = getStoredConsent();
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    setStoredConsent("accepted");
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    setStoredConsent("essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[90] border-t border-white/10 bg-[#0C1829]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex-1 text-sm text-white/70">
          <p>
            {t("message")}{" "}
            <Link
              href="/privacy"
              className="text-brand-cyan underline underline-offset-2 hover:text-white transition-colors"
            >
              {t("learnMore")}
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleEssentialOnly}
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
          >
            {t("essentialOnly")}
          </button>
          <button
            onClick={handleAccept}
            className="rounded-md bg-[#1A3FAD] px-4 py-2 text-sm font-medium text-white hover:bg-[#1A3FAD]/80 transition-colors"
          >
            {t("acceptAll")}
          </button>
        </div>
      </div>
    </div>
  );
}
