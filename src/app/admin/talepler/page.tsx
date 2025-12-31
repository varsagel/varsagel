import { prisma } from "@/lib/prisma";
import ListingTable from "./ListingTable";
import Link from "next/link";

export const dynamic = 'force-dynamic';

type AdminListingSearchParams = {
  status?: string;
  q?: string;
};

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<AdminListingSearchParams> }) {
  const { status, q } = await searchParams;
  const currentStatus = status || 'PENDING';
  const searchQuery = (q || "").trim();

  const whereClause: any = {};
  if (currentStatus !== "ALL") {
    whereClause.status = currentStatus;
  }
  if (searchQuery) {
    whereClause.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { owner: { email: { contains: searchQuery, mode: "insensitive" } } },
    ];
  }

  const listings = await prisma.listing.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      subCategory: true,
      owner: { select: { name: true, email: true } }
    },
    take: 50
  });

  const counts = await prisma.listing.groupBy({
    by: ['status'],
    _count: true
  });

  const getCount = (s: string) => counts.find(c => c.status === s)?._count || 0;
  const total = counts.reduce((acc, c) => acc + c._count, 0);

  const tabs = [
    { id: 'PENDING', label: 'Onay Bekleyen', count: getCount('PENDING') },
    { id: 'OPEN', label: 'Yayında', count: getCount('OPEN') },
    { id: 'REJECTED', label: 'Reddedilen', count: getCount('REJECTED') },
    { id: 'ALL', label: 'Tümü', count: total },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Talep Yönetimi</h1>
          <p className="text-gray-500 text-sm mt-1">Talepleri onayla, reddet veya düzenle.</p>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(tab => {
          const params = new URLSearchParams();
          params.set("status", tab.id);
          if (searchQuery) params.set("q", searchQuery);
          return (
            <Link
              key={tab.id}
              href={`/admin/talepler?${params.toString()}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2
              ${currentStatus === tab.id 
                ? 'bg-cyan-600 text-white shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              {tab.label}
              <span className={`px-1.5 py-0.5 rounded-full text-xs ${currentStatus === tab.id ? 'bg-white/20' : 'bg-gray-100'}`}>
                {tab.count}
              </span>
            </Link>
          );
        })}
      </div>

      <ListingTable listings={listings} statusFilter={currentStatus} />
    </div>
  );
}

