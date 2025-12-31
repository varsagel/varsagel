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
      description: 'Aradığınız kategori bulunamadı.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${category.name} Talepleri | Varsagel`;
  const description = `${category.name} kategorisindeki en güncel talepleri inceleyin. Varsagel ile güvenli alışveriş.`;
  const path = `/kategori/${category.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: path,
      siteName: 'Varsagel',
      locale: 'tr_TR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@varsagel',
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
