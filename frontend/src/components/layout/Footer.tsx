import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations("footer");
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0C1829] text-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold font-display">{t("company")}</h3>
            <p className="mt-2 text-sm text-white/60">{t("companyDesc")}</p>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              {t("products")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/products`}
                  className="text-sm text-white/60 hover:text-brand-cyan transition-colors"
                >
                  {t("products")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              {t("solutions")}
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href={`/${locale}/solutions`}
                  className="text-sm text-white/60 hover:text-brand-cyan transition-colors"
                >
                  {t("solutions")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80">
              {t("contact")}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-white/60">
              <li>{t("address")}</li>
              <li>{t("phone")}</li>
              <li>{t("email")}</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center text-sm text-white/40">
          {t("copyright", { year: currentYear })}
        </div>
      </div>
    </footer>
  );
}
