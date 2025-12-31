import { prisma } from "@/lib/prisma";
import OfferTable from "./OfferTable";

export const dynamic = 'force-dynamic';

export default async function AdminOffersPage() {
  const offers = await prisma.offer.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      seller: { select: { name: true, email: true } },
      listing: { select: { id: true, title: true } }
    },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Teklif Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-1">Verilen teklifleri incele ve yönet.</p>
      </div>
      <OfferTable offers={offers} />
    </div>
  );
}
