import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("error");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-8 text-8xl font-bold font-display text-brand-cyan">404</div>
      <h1 className="mb-4 text-2xl font-bold text-white sm:text-3xl">
        {t("notFound")}
      </h1>
      <p className="mb-8 max-w-md text-white/60">{t("notFoundMessage")}</p>
      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-[#1A3FAD] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1A3FAD]/80"
      >
        {t("backToHome")}
      </Link>
    </div>
  );
}
