import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CATEGORIES } from '@/data/categories';
import CategoryClient from '@/components/category/CategoryClient';
import { Suspense } from 'react';
import { metadataBase, siteUrl } from '@/lib/metadata-base';
import { titleCaseTR } from '@/lib/title-case-tr';

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
      metadataBase: metadataBase,
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const categoryName = titleCaseTR(category.name);
  const title = `${categoryName} Talepleri | Varsagel`;
  const description = `${categoryName} kategorisindeki en güncel talepleri inceleyin. Varsagel ile güvenli alışveriş.`;
  const path = `/kategori/${category.slug}`;

  return {
    title,
    description,
    metadataBase: metadataBase,
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${siteUrl}${path}`,
      siteName: 'Varsagel',
      locale: 'tr_TR',
      images: [`${siteUrl}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      creator: '@varsagel',
      images: [`${siteUrl}/twitter-image`],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const category = CATEGORIES.find(c => c.slug === resolvedParams.category);

  if (!category) {
    notFound();
  }

  const categoryName = titleCaseTR(category.name);
  const path = `/kategori/${category.slug}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: categoryName,
        item: `${siteUrl}${path}`,
      },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} Talepleri`,
    url: `${siteUrl}${path}`,
    about: {
      "@type": "Thing",
      name: categoryName,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Yükleniyor...</div>}>
        <CategoryClient />
      </Suspense>
    </>
  );
}
