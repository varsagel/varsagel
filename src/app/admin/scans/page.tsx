import { prisma } from "@/lib/prisma";
import ScanTable from "./ScanTable";

export const dynamic = "force-dynamic";

export default async function AdminScansPage() {
  let scans: any[] = [];
  let canQuery = true;
  try {
    const res: Array<{ name: string | null }> = await prisma.$queryRaw`
      SELECT to_regclass('public."UploadScan"') as name
    `;
    if (Array.isArray(res) && res.length > 0 && !res[0]?.name) {
      canQuery = false;
    }
  } catch {}

  if (canQuery) {
    try {
      scans = await prisma.uploadScan.findMany({
        orderBy: { createdAt: "desc" },
        include: { owner: { select: { name: true, email: true } } },
        take: 50,
      });
    } catch (err: any) {
      if (err?.code !== "P2021") {
        throw err;
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Virüs Tarama Yönetimi</h1>
        <p className="text-gray-500 text-sm mt-1">Yüklenen görsellerin tarama durumlarını incele ve yönet.</p>
      </div>
      <ScanTable scans={scans} />
    </div>
  );
}
