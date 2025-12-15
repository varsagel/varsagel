import { prisma } from "@/lib/prisma";
import ReportTable from "./ReportTable";

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const reports = await prisma.report.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      listing: { select: { id: true, title: true } }
    },
    take: 50
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Şikayet Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-1">Kullanıcı şikayetlerini incele ve çözüme kavuştur.</p>
      </div>
      <ReportTable reports={reports} />
    </div>
  );
}
