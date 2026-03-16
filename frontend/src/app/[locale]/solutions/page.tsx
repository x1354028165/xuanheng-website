import { redirect } from 'next/navigation';

// 需求文档：无解决方案总览页，直接跳转到第一个场景页
export default async function SolutionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/solutions/hems`);
}
