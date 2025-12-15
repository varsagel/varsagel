import { Metadata } from 'next';
import { Suspense } from 'react';
import { CATEGORIES } from '@/data/categories';
import CategoryClient from '@/components/category/CategoryClient';

type Props = {
  params: Promise<{ category: string; subcategory: string }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const category = CATEGORIES.find(c => c.slug === resolvedParams.category);
  const subcategory = category?.subcategories.find(s => s.slug === resolvedParams.subcategory);

  if (!category || !subcategory) {
    return {
      title: 'Kategori Bulunamadı | Varsagel',
      description: 'Aradığınız kategori bulunamadı.'
    };
  }

  const title = `${subcategory.name} Talepleri - ${category.name} | Varsagel`;
  const description = `${subcategory.name} kategorisindeki en güncel talepleri inceleyin. ${category.name} dünyasındaki fırsatları kaçırmayın. Varsagel ile güvenli alışveriş.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/kategori/${category.slug}/${subcategory.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'Varsagel',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  };
}

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-500">Yükleniyor...</div>}>
      <CategoryClient />
    </Suspense>
  );
}
