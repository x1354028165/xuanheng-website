import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";

export default function HomePage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = useTranslations("home");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold font-display text-brand-blue">
        {t("heroTitle")}
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        {t("heroSubtitle")}
      </p>
    </main>
  );
}
