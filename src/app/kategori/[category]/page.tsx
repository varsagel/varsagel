import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import CategoryClient from '@/components/category/CategoryClient';
import { Suspense } from 'react';

type Props = {
  params: Promise<{ category: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const category = CATEGORIES.find(c => c.slug === resolvedParams.category);

  if (!category) {
    return {
      title: 'Kategori Bulunamadı | Varsagel',
    };
  }

  return {
    title: `${category.name} Talepleri | Varsagel`,
    description: `${category.name} kategorisindeki en güncel talepleri inceleyin. Varsagel ile güvenli alışveriş.`,
    alternates: {
      canonical: `/kategori/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = CATEGORIES.find(c => c.slug === resolvedParams.category);

  if (!category) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Yükleniyor...</div>}>
      <CategoryClient />
    </Suspense>
  );
}
