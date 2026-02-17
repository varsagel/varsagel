import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Users, FileText, Tag, Eye, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, BarChart2, UserCheck, UserX, Bot } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function AdminPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/giris');
  
  const me = await prisma.user.findUnique({ where: { id: session.user.id }, select: { id: true, email: true, role: true } });
  const SUPER_EMAIL = 'varsagel.com@gmail.com';
  const isSuper = (me?.email || '').toLowerCase() === SUPER_EMAIL;
  const isAdmin = (me?.role || '').toUpperCase() === 'ADMIN';
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

  const activeTab = searchParams?.tab === "istatistik" ? "istatistik" : "genel";

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

  let periodMetrics: Array<{
    key: string;
    label: string;
    totalVisits: number;
    botVisits: number;
    memberVisits: number;
    guestVisits: number;
    newUsers: number;
    newListings: number;
    newOffers: number;
  }> = [];
  let statsTopPaths: { path: string; count: number }[] = [];
  let statsLastVisits: any[] = [];
  let totalVisitsAll = 0;

  if (activeTab === "istatistik") {
    const dayAgo = new Date(now);
    dayAgo.setDate(dayAgo.getDate() - 1);
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const periods = [
      { key: "day", label: "Günlük (son 24 saat)", since: dayAgo },
      { key: "week", label: "Haftalık (son 7 gün)", since: weekAgo },
      { key: "month", label: "Aylık (son 30 gün)", since: monthAgo },
    ];

    const metrics = await Promise.all(
      periods.map(async (p) => {
        const baseWhere = { createdAt: { gte: p.since } };
        const [
          totalVisits,
          botVisits,
          memberVisits,
          guestVisitsRaw,
          botGuestVisits,
          newUsers,
          newListings,
          newOffers,
        ] = await Promise.all([
          prisma.visit.count({ where: baseWhere }),
          prisma.visit.count({ where: { ...baseWhere, ...botUserAgentWhere } }),
          prisma.visit.count({ where: { ...baseWhere, userId: { not: null } } }),
          prisma.visit.count({ where: { ...baseWhere, userId: null } }),
          prisma.visit.count({ where: { ...baseWhere, userId: null, ...botUserAgentWhere } }),
          prisma.user.count({ where: baseWhere }),
          prisma.listing.count({ where: baseWhere }),
          prisma.offer.count({ where: baseWhere }),
        ]);

        const guestVisits = Math.max(guestVisitsRaw - botGuestVisits, 0);

        return {
          key: p.key,
          label: p.label,
          totalVisits,
          botVisits,
          memberVisits,
          guestVisits,
          newUsers,
          newListings,
          newOffers,
        };
      })
    );
    periodMetrics = metrics;

    const [groupedTopPaths, lastVisitsData, totalVisitsCount] = await Promise.all([
      prisma.visit.groupBy({
        by: ["path"],
        where: { createdAt: { gte: monthAgo } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
      prisma.visit.findMany({ orderBy: { createdAt: "desc" }, take: 15 }),
      prisma.visit.count(),
    ]);
    statsTopPaths = (groupedTopPaths as any[]).map((g) => ({ path: g.path as string, count: g._count._all as number }));
    statsLastVisits = lastVisitsData;
    totalVisitsAll = totalVisitsCount;
  }

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

  const isBotUserAgent = (ua: string | null) => {
    const lower = (ua || "").toLowerCase();
    return botPatterns.some((p) => lower.includes(p));
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Paneli</h1>
          <p className="text-gray-500 mt-1">Sistemin anlık durumu ve performans metrikleri.</p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 shadow-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <Link
          href="/admin"
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "genel" ? "bg-cyan-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          Genel Bakış
        </Link>
        <Link
          href="/admin?tab=istatistik"
          className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeTab === "istatistik" ? "bg-cyan-600 text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          İstatistikler
        </Link>
      </div>

      {activeTab === "genel" ? (
        <>
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
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-10 -left-10 w-32 h-32 bg-cyan-400 opacity-20 rounded-full blur-xl"></div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {periodMetrics.map((p) => (
              <div key={p.key} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <BarChart2 className="w-4 h-4 text-cyan-600" />
                  {p.label}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">Toplam Ziyaret</div>
                    <div className="text-lg font-bold text-gray-900">{p.totalVisits}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">Bot Ziyaret</div>
                    <div className="text-lg font-bold text-gray-900">{p.botVisits}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">Üye Ziyaret</div>
                    <div className="text-lg font-bold text-gray-900">{p.memberVisits}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">Üye Olmayan</div>
                    <div className="text-lg font-bold text-gray-900">{p.guestVisits}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">Yeni Üyeler</div>
                    <div className="text-lg font-bold text-gray-900">{p.newUsers}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                    <div className="text-xs text-gray-500">Yeni Talepler</div>
                    <div className="text-lg font-bold text-gray-900">{p.newListings}</div>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 border border-gray-100 col-span-2">
                    <div className="text-xs text-gray-500">Yeni Teklifler</div>
                    <div className="text-lg font-bold text-gray-900">{p.newOffers}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">En Çok Ziyaret Edilen Sayfalar</h2>
                <p className="text-xs text-gray-500 mt-1">Son 30 gün</p>
              </div>
              <div className="divide-y divide-gray-100">
                {statsTopPaths.map((p) => (
                  <div key={p.path} className="px-6 py-3 flex items-center justify-between">
                    <div className="text-sm text-gray-700 truncate">{p.path}</div>
                    <div className="text-sm font-semibold text-gray-900">{p.count}</div>
                  </div>
                ))}
                {statsTopPaths.length === 0 && (
                  <div className="px-6 py-6 text-sm text-gray-500">Veri bulunamadı.</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Son Ziyaretler</h2>
                <p className="text-xs text-gray-500 mt-1">Son 15 kayıt</p>
              </div>
              <div className="divide-y divide-gray-100">
                {statsLastVisits.map((v) => {
                  const bot = isBotUserAgent(v.userAgent);
                  const member = !!v.userId;
                  return (
                    <div key={v.id} className="px-6 py-3 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-sm text-gray-700 truncate">{v.path}</div>
                        <div className="text-xs text-gray-500">{new Date(v.createdAt).toLocaleString("tr-TR")}</div>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold">
                        {bot ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 px-2 py-1">
                            <Bot className="w-3.5 h-3.5" />
                            Bot
                          </span>
                        ) : member ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-1">
                            <UserCheck className="w-3.5 h-3.5" />
                            Üye
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 px-2 py-1">
                            <UserX className="w-3.5 h-3.5" />
                            Üyesiz
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {statsLastVisits.length === 0 && (
                  <div className="px-6 py-6 text-sm text-gray-500">Veri bulunamadı.</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Toplam Ziyaret</div>
                <div className="text-lg font-bold text-gray-900">{totalVisitsAll}</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Son 30 Gün Yeni Talep</div>
                <div className="text-lg font-bold text-gray-900">{periodMetrics.find((p) => p.key === "month")?.newListings ?? 0}</div>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500">Son 30 Gün Yeni Teklif</div>
                <div className="text-lg font-bold text-gray-900">{periodMetrics.find((p) => p.key === "month")?.newOffers ?? 0}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
