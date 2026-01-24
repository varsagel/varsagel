import { notFound, permanentRedirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { buildListingSlug, parseListingIdentifier } from '@/lib/listing-url';
import { generateMetadata } from '@/app/talep/[id]/page';

export { generateMetadata };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = await params;
  const ident = parseListingIdentifier(raw);

  const listing = await prisma.listing.findFirst({
    where: ident.code ? { code: ident.code } : ident.id ? { id: ident.id } : undefined,
    select: {
      id: true,
      code: true,
      title: true,
      category: { select: { slug: true } },
      subCategory: { select: { slug: true } },
    },
  });

  if (!listing) return notFound();

  const canonicalSlug = buildListingSlug({
    id: listing.id,
    code: listing.code,
    title: listing.title,
    category: listing.category,
    subCategory: listing.subCategory,
  });

  permanentRedirect(`/talep/${canonicalSlug}`);
}
