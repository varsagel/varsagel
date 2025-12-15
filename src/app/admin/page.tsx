import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, FileText, Tag, Eye, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');
  
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, role: true } });
  const SUPER_EMAIL = 'varsagel.com@gmail.com';
  const isSuper = me?.email === SUPER_EMAIL;
  const isAdmin = (me?.role || '').toUpperCase() === 'ADMIN';
  
  if (isSuper && !isAdmin) {
    await prisma.user.update({ where: { id: me!.id }, data: { role: 'ADMIN' } }).catch(() => {});
  }
  if (!(isAdmin || isSuper)) redirect('/');

  let userCount = 0;
  let listingCount = 0;
  let offerCount = 0;
  let visitCount = 0;
  let pendingCount = 0;

  let userLast7 = 0;
  let userPrev7 = 0;
  let listingLast7 = 0;
  let listingPrev7 = 0;
  let offerLast7 = 0;
  let offerPrev7 = 0;
  let visitsLast7 = 0;
  let visitsPrev7 = 0;

  let botTotal = 0;
  let botLast7 = 0;
  let guestTotalRaw = 0;
  let guestLast7Raw = 0;
  let botGuestTotal = 0;
  let botGuestLast7 = 0;
  let memberTotal = 0;
  let memberLast7 = 0;

  let topPaths: { path: string; count: number }[] = [];
  let lastVisits: any[] = [];

  const now = new Date();
  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const fourteenDaysAgo = new Date(now);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const botPatterns = ['bot', 'spider', 'crawl', 'slurp', 'mediapartners-google', 'bingpreview', 'facebookexternalhit'];
  const botUserAgentWhere: any = {
    OR: botPatterns.map((p) => ({
      userAgent: {
        contains: p,
        mode: 'insensitive',
      },
    })),
  };

  try {
    const [
      userCountTotal,
      listingCountTotal,
      offerCountTotal,
      visitCountTotal,
      pendingCountTotal,
      userLast7Count,
      userPrev7Count,
      listingLast7Count,
      listingPrev7Count,
      offerLast7Count,
      offerPrev7Count,
      visitsLast7Count,
      visitsPrev7Count,
      groupedTopPaths,
      lastVisitsData,
      botTotalCount,
      botLast7Count,
      guestTotalCount,
      guestLast7Count,
      botGuestTotalCount,
      botGuestLast7Count,
      memberTotalCount,
      memberLast7Count,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.offer.count(),
      prisma.visit.count(),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      prisma.listing.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.listing.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      prisma.offer.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.offer.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      prisma.visit.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.visit.count({ where: { createdAt: { gte: fourteenDaysAgo, lt: sevenDaysAgo } } }),
      prisma.visit.groupBy({
        by: ['path'],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: { _all: true },
        orderBy: { _count: { path: 'desc' } },
        take: 5,
      }),
      prisma.visit.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
      prisma.visit.count({ where: botUserAgentWhere }),
      prisma.visit.count({ where: { createdAt: { gte: sevenDaysAgo }, ...botUserAgentWhere } }),
      prisma.visit.count({ where: { userId: null } }),
      prisma.visit.count({ where: { createdAt: { gte: sevenDaysAgo }, userId: null } }),
      prisma.visit.count({ where: { userId: null, ...botUserAgentWhere } }),
      prisma.visit.count({ where: { createdAt: { gte: sevenDaysAgo }, userId: null, ...botUserAgentWhere } }),
      prisma.visit.count({ where: { userId: { not: null } } }),
      prisma.visit.count({ where: { createdAt: { gte: sevenDaysAgo }, userId: { not: null } } }),
    ]);

    userCount = userCountTotal;
    listingCount = listingCountTotal;
    offerCount = offerCountTotal;
    visitCount = visitCountTotal;
    pendingCount = pendingCountTotal;

    userLast7 = userLast7Count;
    userPrev7 = userPrev7Count;
    listingLast7 = listingLast7Count;
    listingPrev7 = listingPrev7Count;
    offerLast7 = offerLast7Count;
    offerPrev7 = offerPrev7Count;
    visitsLast7 = visitsLast7Count;
    visitsPrev7 = visitsPrev7Count;
    topPaths = (groupedTopPaths as any[]).map((g) => ({ path: g.path as string, count: g._count._all as number }));
    lastVisits = lastVisitsData;

    botTotal = botTotalCount;
    botLast7 = botLast7Count;
    guestTotalRaw = guestTotalCount;
    guestLast7Raw = guestLast7Count;
    botGuestTotal = botGuestTotalCount;
    botGuestLast7 = botGuestLast7Count;
    memberTotal = memberTotalCount;
    memberLast7 = memberLast7Count;
  } catch (e) { console.error(e); }

  const calcTrend = (current: number, previous: number) => {
    if (previous === 0 && current === 0) return { label: "0%", up: true };
    if (previous === 0) return { label: "+100%", up: true };
    const diff = current - previous;
    const percent = Math.round((Math.abs(diff) / previous) * 100);
    const sign = diff >= 0 ? "+" : "-";
    return { label: `${sign}${percent}%`, up: diff >= 0 };
  };

  const userTrend = calcTrend(userLast7, userPrev7);
  const listingTrend = calcTrend(listingLast7, listingPrev7);
  const offerTrend = calcTrend(offerLast7, offerPrev7);
  const visitTrend = calcTrend(visitsLast7, visitsPrev7);

  const guestHumanTotal = Math.max(guestTotalRaw - botGuestTotal, 0);
  const guestHumanLast7 = Math.max(guestLast7Raw - botGuestLast7, 0);

  const visitLast7Safe = visitsLast7 || 1;
  const botLast7Percent = Math.round((botLast7 * 100) / visitLast7Safe);
  const guestLast7Percent = Math.round((guestHumanLast7 * 100) / visitLast7Safe);
  const memberLast7Percent = Math.round((memberLast7 * 100) / visitLast7Safe);

  const stats = [
    { label: "Toplam Kullanıcı", value: userCount, icon: Users, color: "blue", trend: userTrend.label, trendUp: userTrend.up },
    { label: "Toplam Talep", value: listingCount, icon: FileText, color: "green", trend: listingTrend.label, trendUp: listingTrend.up },
    { label: "Toplam Teklif", value: offerCount, icon: Tag, color: "purple", trend: offerTrend.label, trendUp: offerTrend.up },
    { label: "Toplam Ziyaret", value: visitCount, icon: Eye, color: "orange", trend: visitTrend.label, trendUp: visitTrend.up },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Genel Bakış</h1>
          <p className="text-gray-500 mt-1">Sistemin anlık durumu ve performans metrikleri.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-2 group-hover:text-cyan-600 transition-colors">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className={`flex items-center font-medium ${stat.trendUp ? 'text-lime-600' : 'text-red-600'}`}>
                {stat.trendUp ? <ArrowUpRight className="w-4 h-4 mr-1" /> : <ArrowDownRight className="w-4 h-4 mr-1" />}
                {stat.trend}
              </span>
              <span className="text-gray-400">önceki 7 güne göre</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">SEO Botları</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{botLast7}</span>
            <span className="text-sm text-gray-500">son 7 gün</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{botLast7Percent}%</span> trafiğin bot
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Toplam: <span className="font-semibold text-gray-700">{botTotal}</span> ziyaret
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Üyesiz Ziyaretçiler</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{guestHumanLast7}</span>
            <span className="text-sm text-gray-500">son 7 gün</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{guestLast7Percent}%</span> trafiğin üyesiz
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Toplam: <span className="font-semibold text-gray-700">{guestHumanTotal}</span> ziyaret
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Üye Olarak Girenler</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{memberLast7}</span>
            <span className="text-sm text-gray-500">son 7 gün</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{memberLast7Percent}%</span> trafiğin üye
          </div>
          <div className="mt-3 text-xs text-gray-400">
            Toplam: <span className="font-semibold text-gray-700">{memberTotal}</span> ziyaret
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              Son Ziyaretler
            </h3>
            <button className="text-sm text-cyan-600 font-medium hover:underline">Tümünü Gör</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th className="px-6 py-3">Zaman</th>
                  <th className="px-6 py-3">Yol</th>
                  <th className="px-6 py-3">Kullanıcı</th>
                  <th className="px-6 py-3">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lastVisits.map((v: any) => (
                  <tr key={v.id} className="hover:bg-cyan-50/30 transition-colors">
                    <td className="px-6 py-3 text-gray-900 font-medium whitespace-nowrap">{new Date(v.createdAt).toLocaleTimeString('tr-TR')}</td>
                    <td className="px-6 py-3 text-cyan-600 font-medium max-w-[200px] truncate">{v.path}</td>
                    <td className="px-6 py-3 text-gray-600">{v.userId ? 'Üye' : 'Misafir'}</td>
                    <td className="px-6 py-3 text-gray-400 font-mono text-xs">{v.ip || 'Gizli'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {topPaths.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Son 7 günde en çok ziyaret edilen sayfalar
                </h4>
                <div className="flex flex-wrap gap-3">
                  {topPaths.map((p) => (
                    <div
                      key={p.path}
                      className="px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs text-gray-700 flex items-center gap-2"
                    >
                      <span className="font-mono text-[11px] text-cyan-600 max-w-[180px] truncate">{p.path}</span>
                      <span className="text-gray-400">•</span>
                      <span className="font-medium text-gray-900">{p.count} ziyaret</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl shadow-lg p-6 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-bold mb-1">Onay Bekleyen Talepler</h3>
            <p className="text-cyan-100 text-sm opacity-90">Kullanıcılar tarafından eklenen ve onay bekleyen yeni talepler.</p>
            <div className="mt-6">
              <span className="text-5xl font-extrabold tracking-tight">{pendingCount}</span>
              <span className="text-xl ml-2 font-medium opacity-80">talep</span>
            </div>
          </div>
          <div className="mt-8 relative z-10">
            <a href="/admin/talepler?status=PENDING" className="block w-full bg-white text-cyan-600 text-center py-3 rounded-xl font-bold hover:bg-cyan-50 transition-colors shadow-sm">
              Talepleri İncele
            </a>
          </div>
          
          {/* Decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-10 -left-10 w-32 h-32 bg-cyan-400 opacity-20 rounded-full blur-xl"></div>
        </div>
      </div>
    </div>
  );
}
