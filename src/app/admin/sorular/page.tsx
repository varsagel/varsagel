import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      listing: { select: { id: true, title: true, owner: { select: { name: true, email: true } } } },
    },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sorular</h1>
        <p className="text-gray-500 text-sm mt-1">Tüm taleplere sorulan soruları görüntüle.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Soran</th>
                <th className="px-6 py-4">Talep</th>
                <th className="px-6 py-4">Soru</th>
                <th className="px-6 py-4">Cevap</th>
                <th className="px-6 py-4">Talep Sahibi</th>
                <th className="px-6 py-4">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{q.user?.name || "Misafir"}</div>
                    <div className="text-xs text-gray-500">{q.user?.email || ""}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/talep/${q.listing.id}`} target="_blank" className="text-cyan-600 hover:underline line-clamp-1">
                      {q.listing.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-700 max-w-sm">
                    <div className="line-clamp-3">{q.body}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-700 max-w-sm">
                    <div className="line-clamp-3">{q.answer || "-"}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{q.listing.owner?.name || "Anonim"}</div>
                    <div className="text-xs text-gray-500">{q.listing.owner?.email || ""}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(q.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
