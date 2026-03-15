import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getProductBySlug } from '@/lib/api';
import { MOCK_PRODUCTS, MOCK_SOLUTIONS, getMockProduct, LOCALES } from '@/lib/mock-data';

export const dynamicParams = false;

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const product of MOCK_PRODUCTS) {
      params.push({ locale, slug: product.slug });
    }
  }
  return params;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  // Try Strapi first, fall back to mock
  let strapiProduct = await getProductBySlug(slug, locale);
  const mockProduct = getMockProduct(slug);

  const title = strapiProduct?.title ?? mockProduct?.title ?? slug;
  const tagline = strapiProduct?.tagline ?? mockProduct?.tagline ?? '';
  const description = strapiProduct?.description ?? mockProduct?.description ?? '';
  const specs = strapiProduct?.specs ? Object.entries(strapiProduct.specs) : Object.entries(mockProduct?.specs ?? {});
  const scenarioSlugs = mockProduct?.scenarios ?? [];
  const relatedSolutions = MOCK_SOLUTIONS.filter(s => scenarioSlugs.includes(s.slug));
  const category = mockProduct?.category ?? 'hardware';

  return (
    <>
      {/* Product Header */}
      <section className="bg-[#0C1829] pb-16 pt-32">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="mb-8 inline-flex items-center text-sm text-gray-400 hover:text-[#38C4E8] transition-colors"
          >
            &larr; {t('backToList')}
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-start">
            {/* Product Image Placeholder */}
            <div className="relative h-72 overflow-hidden rounded-xl bg-[#0f1b2e] flex items-center justify-center sm:h-96 border border-white/10">
              <div className="text-center">
                <div className="text-6xl mb-4">{category === 'hardware' ? '⚡' : '☁️'}</div>
                <p className="text-gray-500 text-sm">{title}</p>
              </div>
            </div>

            {/* Product Info */}
            <div>
              <span className="inline-block rounded-full bg-[#1A3FAD]/20 px-3 py-1 text-xs font-medium text-[#38C4E8] mb-4">
                {category === 'hardware' ? '智能网关' : '云平台'}
              </span>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                {title}
              </h1>
              {tagline && (
                <p className="mt-4 text-lg text-[#38C4E8]">{tagline}</p>
              )}
              {description && (
                <div className="mt-6 text-gray-300 leading-relaxed">
                  {description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className="mt-3 first:mt-0">{paragraph}</p>
                  ))}
                </div>
              )}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center rounded-lg bg-[#1A3FAD] px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-300 hover:bg-[#1A3FAD]/90 hover:shadow-xl hover:shadow-[#1A3FAD]/20"
                >
                  联系销售
                </Link>
                <a
                  href="#specs"
                  className="inline-flex items-center rounded-lg border border-[#38C4E8]/30 px-6 py-3 text-base font-semibold text-[#38C4E8] transition-all duration-300 hover:bg-[#38C4E8]/10"
                >
                  查看规格 ↓
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specs Table */}
      {specs.length > 0 && (
        <section id="specs" className="bg-[#0f1b2e] py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">{t('specifications')}</h2>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full">
                <tbody>
                  {specs.map(([key, value], idx) => (
                    <tr
                      key={key}
                      className={idx % 2 === 0 ? 'bg-white/5' : 'bg-white/[0.02]'}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-300 w-1/3 border-r border-white/10">
                        {key}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* Related Solutions */}
      {relatedSolutions.length > 0 && (
        <section className="bg-[#0C1829] py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <h2 className="mb-8 text-2xl font-bold text-white">适用场景</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSolutions.map((solution) => (
                <Link
                  key={solution.slug}
                  href={`/solutions/${solution.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/5 p-6 transition-all duration-300 hover:border-[#38C4E8]/30 hover:-translate-y-1"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-[#38C4E8] transition-colors">
                    {solution.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">{solution.tagline}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-[#38C4E8]">
                    查看解决方案 →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Downloads */}
      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-bold text-white">资源下载</h2>
          <div className="space-y-3">
            {[
              { name: `${title} 用户手册`, format: 'PDF', size: '3.2MB' },
              { name: `${title} 安装指南`, format: 'PDF', size: '1.5MB' },
              { name: `${title} 数据手册`, format: 'PDF', size: '0.8MB' },
            ].map((doc) => (
              <div
                key={doc.name}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-6 py-4 transition-all hover:border-[#38C4E8]/30"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1A3FAD]/20 text-[#38C4E8]">
                    📄
                  </div>
                  <div>
                    <p className="font-medium text-white">{doc.name}</p>
                    <p className="text-xs text-gray-500">{doc.format} · {doc.size}</p>
                  </div>
                </div>
                <button className="rounded-md bg-[#38C4E8]/10 px-4 py-2 text-sm font-medium text-[#38C4E8] hover:bg-[#38C4E8]/20 transition-colors">
                  下载
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-[#1A3FAD] to-[#0C1829] py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            对 {title} 感兴趣？
          </h2>
          <p className="mt-4 text-gray-300">联系我们的销售团队，获取产品报价和技术方案</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center rounded-lg bg-[#38C4E8] px-8 py-3.5 text-base font-semibold text-[#0C1829] shadow-lg transition-all duration-300 hover:bg-[#38C4E8]/90 hover:shadow-xl"
            >
              联系销售
            </Link>
            <Link
              href="/ecosystem"
              className="inline-flex items-center rounded-lg border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:bg-white/10"
            >
              查看兼容品牌
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
