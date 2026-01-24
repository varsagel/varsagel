import { Metadata } from 'next';
import { Suspense } from 'react';
import { CATEGORIES } from '@/data/categories';
import CategoryClient from '@/components/category/CategoryClient';
import { metadataBase, siteUrl } from '@/lib/metadata-base';
import { titleCaseTR } from '@/lib/title-case-tr';

type Props = {
  params: Promise<{ category: string; subcategory: string[] }>
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category;
  const subcategorySlugArray = resolvedParams.subcategory;
  const slugParts = (Array.isArray(subcategorySlugArray) ? subcategorySlugArray : [subcategorySlugArray])
    .map((p) => decodeURIComponent(p).trim())
    .filter(Boolean);

  const category = CATEGORIES.find(c => c.slug === categorySlug);
  
  const findByPath = (cats: any[], path: string[]): any | undefined => {
    let current = cats;
    let found: any | undefined;
    for (const slug of path) {
      found = current.find((c) => c.slug === slug);
      if (!found) return undefined;
      current = Array.isArray(found.subcategories) ? found.subcategories : [];
    }
    return found;
  };

  const findBySlug = (cats: any[], slug: string): any | undefined => {
    for (const c of cats) {
      if (c.slug === slug) return c;
      if (c.subcategories) {
        const found = findBySlug(c.subcategories, slug);
        if (found) return found;
      }
    }
    return undefined;
  };

  const subcategory =
    category && slugParts.length > 0
      ? (findByPath(category.subcategories, slugParts) || findBySlug(category.subcategories, slugParts[slugParts.length - 1]))
      : undefined;

  if (!category || !subcategory) {
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
  const subcategoryName = titleCaseTR(subcategory.name);
  const title = `${subcategoryName} Talepleri - ${categoryName} | Varsagel`;
  const description = `${subcategoryName} kategorisindeki en güncel talepleri inceleyin. ${categoryName} dünyasındaki fırsatları kaçırmayın. Varsagel ile güvenli alışveriş.`;
  const path = slugParts.length > 0
    ? `/kategori/${category.slug}/${slugParts.join('/')}`
    : `/kategori/${category.slug}`;

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
    }
  };
}

export default async function Page({ params }: Props) {
  const resolvedParams = await params;
  const categorySlug = resolvedParams.category;
  const subcategorySlugArray = resolvedParams.subcategory;
  const slugParts = (Array.isArray(subcategorySlugArray) ? subcategorySlugArray : [subcategorySlugArray])
    .map((p) => decodeURIComponent(p).trim())
    .filter(Boolean);

  const category = CATEGORIES.find(c => c.slug === categorySlug);

  const findByPath = (cats: any[], path: string[]): any | undefined => {
    let current = cats;
    let found: any | undefined;
    for (const slug of path) {
      found = current.find((c) => c.slug === slug);
      if (!found) return undefined;
      current = Array.isArray(found.subcategories) ? found.subcategories : [];
    }
    return found;
  };

  const findBySlug = (cats: any[], slug: string): any | undefined => {
    for (const c of cats) {
      if (c.slug === slug) return c;
      if (c.subcategories) {
        const found = findBySlug(c.subcategories, slug);
        if (found) return found;
      }
    }
    return undefined;
  };

  const subcategory =
    category && slugParts.length > 0
      ? (findByPath(category.subcategories, slugParts) || findBySlug(category.subcategories, slugParts[slugParts.length - 1]))
      : undefined;

  const path = slugParts.length > 0
    ? `/kategori/${categorySlug}/${slugParts.join('/')}`
    : `/kategori/${categorySlug}`;

  const categoryName = category ? titleCaseTR(category.name) : "";
  const subcategoryName = subcategory ? titleCaseTR(subcategory.name) : "";

  const breadcrumbJsonLd = category && subcategory ? {
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
        item: `${siteUrl}/kategori/${category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: subcategoryName,
        item: `${siteUrl}${path}`,
      },
    ],
  } : null;

  const collectionJsonLd = category && subcategory ? {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${subcategoryName} Talepleri`,
    url: `${siteUrl}${path}`,
    about: {
      "@type": "Thing",
      name: `${subcategoryName} / ${categoryName}`,
    },
  } : null;

  return (
    <>
      {breadcrumbJsonLd && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
      )}
      {collectionJsonLd && (
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
        />
      )}
      <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-gray-500">Yükleniyor...</div>}>
        <CategoryClient />
      </Suspense>
    </>
  );
}
