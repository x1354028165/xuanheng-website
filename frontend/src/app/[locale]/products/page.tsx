import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { getStrapiMedia } from '@/lib/strapi';
import { getProducts } from '@/lib/api';
import type { StrapiProduct } from '@/types/strapi';

const MOCK_PRODUCTS: Pick<StrapiProduct, 'documentId' | 'title' | 'slug' | 'tagline' | 'cover'>[] = [
  { documentId: '1', title: 'AC-GW1000 智能网关', slug: 'ac-gw1000', tagline: '高性能多协议物联网关，支持Modbus/MQTT/HTTP', cover: null },
  { documentId: '2', title: 'AC-GW2000 工业网关', slug: 'ac-gw2000', tagline: '工业级智能数据采集网关，IP67防护等级', cover: null },
  { documentId: '3', title: 'AC-GW3000 边缘计算网关', slug: 'ac-gw3000', tagline: '内置边缘计算能力的新一代智能网关', cover: null },
  { documentId: '4', title: 'AC-EM100 智能电表', slug: 'ac-em100', tagline: '多功能智能电力仪表，0.5S级精度', cover: null },
  { documentId: '5', title: 'AC-EM200 三相电表', slug: 'ac-em200', tagline: '三相多回路电力监测仪表', cover: null },
  { documentId: '6', title: 'AC-CT200 电流传感器', slug: 'ac-ct200', tagline: '高精度开合式电流互感器', cover: null },
  { documentId: '7', title: 'AC-WS100 气象站', slug: 'ac-ws100', tagline: '光伏电站专用智能气象监测站', cover: null },
  { documentId: '8', title: 'AC-Cloud 云平台', slug: 'ac-cloud', tagline: 'SaaS化能源管理云平台，多租户架构', cover: null },
];

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'products' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  let products = await getProducts(locale);
  if (!products || products.length === 0) {
    products = MOCK_PRODUCTS as StrapiProduct[];
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-[#0C1829] pb-12 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl">{t('title')}</h1>
          <p className="mt-4 text-lg text-gray-400">{t('subtitle')}</p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="bg-[#0f1b2e] py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {products.length === 0 ? (
            <p className="text-center text-gray-400">{t('noProducts')}</p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.slice(0, 8).map((product) => (
                <Link
                  key={product.documentId}
                  href={`/products/${product.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#38C4E8]/30 hover:shadow-lg hover:shadow-[#1A3FAD]/10 hover:-translate-y-1"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-[#0C1829]">
                    <Image
                      src={getStrapiMedia(product.cover?.url)}
                      alt={product.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="text-base font-semibold text-white group-hover:text-[#38C4E8] transition-colors duration-300">
                      {product.title}
                    </h2>
                    {product.tagline && (
                      <p className="mt-2 text-sm text-gray-400 line-clamp-2">{product.tagline}</p>
                    )}
                    <span className="mt-3 inline-flex items-center text-sm font-medium text-[#38C4E8] transition-transform duration-300 group-hover:translate-x-1">
                      {tc('viewDetails')} &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
