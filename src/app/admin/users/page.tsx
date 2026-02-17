import { prisma } from "@/lib/prisma";
import UserTable from "./UserTable";

export const dynamic = 'force-dynamic';

type AdminUserSearchParams = {
  q?: string;
};

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<AdminUserSearchParams> }) {
  const { q } = await searchParams;
  const searchQuery = (q || "").trim();

  const whereClause: any = {};
  if (searchQuery) {
    whereClause.OR = [
      { email: { contains: searchQuery } },
      { name: { contains: searchQuery } },
    ];
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { listings: true, offers: true } }
    },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-1">Kullanıcıları görüntüle, yetkilendir veya sil.</p>
        {searchQuery && (
          <p className="text-xs text-gray-400 mt-1">
            Arama: <span className="font-mono">{searchQuery}</span>
          </p>
        )}
      </div>
      <UserTable users={users} />
    </div>
  );
}
