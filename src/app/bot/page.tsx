"use client";
import { useEffect, useState } from "react";

export default function BotPage() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [series, setSeries] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string>("");
  const [trims, setTrims] = useState<string[]>([]);
  const [tree, setTree] = useState<{ brand?: string; models?: { name: string; series: { name: string; trims: string[] }[] }[] }>({});
  const [openModels, setOpenModels] = useState<Record<string, boolean>>({});
  const [openSeries, setOpenSeries] = useState<Record<string, boolean>>({});
  const [rawRows, setRawRows] = useState<{category:string,brand:string,model:string,series:string,trim:string}[]>([]);
  const [watchHeadful, setWatchHeadful] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [wasRunning, setWasRunning] = useState(false);

  const loadStatus = async () => {
    setError(null);
    try {
      const res = await fetch("/api/scraper/status", { cache: "no-store" });
      const data = await res.json();
      setStatus(data);
    } catch (e) {
      setError("Durum alınamadı");
    }
  };

  const runScrape = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/scraper/run", { method: "POST", headers: watchHeadful ? { "Content-Type": "application/json" } : undefined, body: watchHeadful ? JSON.stringify({ headful: true }) : undefined });
      if (!res.ok) throw new Error("Çalıştırma hatası");
      await loadStatus();
    } catch (e) {
      setError("Bot çalıştırılamadı");
    } finally {
      setRunning(false);
    }
  };

  const runAllBrands = async () => {
    setRunning(true);
    setError(null);
    try {
      const resB = await fetch("/api/scraper/brands", { cache: "no-store" });
      const dataB = await resB.json();
      const all = Array.isArray(dataB?.brands) ? dataB.brands : [];
      const res = await fetch("/api/scraper/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brands: all, headful: watchHeadful }) });
      if (!res.ok) throw new Error("Çalıştırma hatası");
      setSelectedBrand("");
      setModels([]);
      setSeries([]);
      setTrims([]);
      await loadStatus();
      await loadLogs();
    } catch (e) {
      setError("Toplu çekme başlatılamadı");
    } finally {
      setRunning(false);
    }
  };

  const stopScrape = async () => {
    setError(null);
    try {
      const res = await fetch("/api/scraper/stop", { method: "POST" });
      const data = await res.json();
      if (!data?.ok) throw new Error("Durdurma hatası");
      await loadStatus();
      await loadLogs();
      try {
        const a = document.createElement("a");
        a.href = "/api/scraper/csv";
        a.download = "arabam-scraped.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {}
    } catch (e) {
      setError("Bot durdurulamadı");
    }
  };

  const loadLogs = async () => {
    try {
      const res = await fetch("/api/scraper/logs", { cache: "no-store" });
      const data = await res.json();
      setLogs(Array.isArray(data?.lines) ? data.lines : []);
    } catch {}
  };

  useEffect(() => {
    loadStatus();
    loadLogs();
    const id = setInterval(() => { loadLogs(); if (running) loadStatus(); }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    const currentRunning = !!(status?.running?.scrape || status?.running?.import);
    if (currentRunning) setWasRunning(true);
    if (wasRunning && !currentRunning) {
      try {
        const a = document.createElement("a");
        a.href = "/api/scraper/csv";
        a.download = "arabam-scraped.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch {}
      setWasRunning(false);
    }
  }, [status]);

  const loadBrands = async () => {
    try {
      const res = await fetch("/api/scraper/brands", { cache: "no-store" });
      const data = await res.json();
      const arr = Array.isArray(data?.brands) ? data.brands : [];
      setBrands(arr);
    } catch {}
  };

  const runBrand = async (brand: string) => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch("/api/scraper/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ brand }) });
      if (!res.ok) throw new Error("Çalıştırma hatası");
      setSelectedBrand(brand);
      setSelectedModel("");
      setSelectedSeries("");
      setModels([]);
      setSeries([]);
      setTrims([]);
      await loadStatus();
      await loadLogs();
      await loadModels(brand);
      await loadTree(brand);
      await loadRaw(brand);
    } catch (e) {
      setError("Bot çalıştırılamadı");
    } finally {
      setRunning(false);
    }
  };

  const loadModels = async (brand: string) => {
    try {
      const res = await fetch(`/api/scraper/data?brand=${encodeURIComponent(brand)}`, { cache: "no-store" });
      const data = await res.json();
      setModels(Array.isArray(data?.models) ? data.models : []);
    } catch {}
  };

  const pickModel = async (model: string) => {
    setSelectedModel(model);
    setSelectedSeries("");
    setSeries([]);
    setTrims([]);
    try {
      const res = await fetch(`/api/scraper/data?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(model)}`, { cache: "no-store" });
      const data = await res.json();
      setSeries(Array.isArray(data?.series) ? data.series : []);
      await loadTree(selectedBrand);
    } catch {}
  };

  const pickSeries = async (s: string) => {
    setSelectedSeries(s);
    setTrims([]);
    try {
      const res = await fetch(`/api/scraper/data?brand=${encodeURIComponent(selectedBrand)}&model=${encodeURIComponent(selectedModel)}&series=${encodeURIComponent(s)}`, { cache: "no-store" });
      const data = await res.json();
      setTrims(Array.isArray(data?.trims) ? data.trims : []);
      await loadTree(selectedBrand);
    } catch {}
  };

  const loadTree = async (brand: string) => {
    try {
      const res = await fetch(`/api/scraper/tree?brand=${encodeURIComponent(brand)}`, { cache: "no-store" });
      const data = await res.json();
      setTree(data || {});
    } catch {}
  };

  const loadRaw = async (brand: string) => {
    try {
      const res = await fetch(`/api/scraper/raw?brand=${encodeURIComponent(brand)}`, { cache: "no-store" });
      const data = await res.json();
      setRawRows(Array.isArray(data?.rows) ? data.rows : []);
    } catch {}
  };

  useEffect(() => { loadBrands(); }, []);

  const loadImages = async () => {
    try {
      const res = await fetch("/api/scraper/screenshots", { cache: "no-store" });
      const data = await res.json();
      setImages(Array.isArray(data?.images) ? data.images : []);
    } catch {}
  };

  useEffect(() => {
    const id = setInterval(() => { if (watchHeadful) loadImages(); }, 1500);
    return () => clearInterval(id);
  }, [watchHeadful]);

  useEffect(() => {
    if (!selectedBrand) return;
    const id = setInterval(() => {
      loadRaw(selectedBrand);
      loadTree(selectedBrand);
    }, 2000);
    return () => clearInterval(id);
  }, [selectedBrand]);

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center gap-4">
        <svg width="64" height="64" viewBox="0 0 64 64" className="text-cyan-600">
          <rect x="10" y="18" width="44" height="30" rx="6" fill="currentColor" opacity="0.15" />
          <circle cx="24" cy="33" r="5" fill="currentColor" />
          <circle cx="40" cy="33" r="5" fill="currentColor" />
          <rect x="28" y="8" width="8" height="10" rx="2" fill="currentColor" />
          <rect x="18" y="48" width="28" height="6" rx="3" fill="currentColor" opacity="0.25" />
        </svg>
        <div>
          <h1 className="text-2xl font-semibold">Veri Botu</h1>
          <p className="text-slate-600">Otomobil â†’ Marka â†’ Model â†’ Seri/Motor â†’ Donanım/Paket</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={runScrape} disabled={running} className="rounded-md bg-cyan-600 text-white px-4 py-2 hover:bg-cyan-700 disabled:opacity-50">
          {running ? "Bot çalışıyor..." : "Botu Çalıştır"}
        </button>
        <button onClick={stopScrape} className="rounded-md bg-red-600 text-white px-4 py-2 hover:bg-red-700">
          Botu Durdur
        </button>
        <button onClick={loadStatus} className="rounded-md bg-slate-900 text-white px-4 py-2 hover:bg-slate-800">
          Durumu Yenile
        </button>
        <button onClick={runAllBrands} className="rounded-md bg-indigo-600 text-white px-4 py-2 hover:bg-indigo-700">
          Bütün Markalar
        </button>
        <a href="/api/scraper/csv" className="rounded-md bg-teal-600 text-white px-4 py-2 text-center hover:bg-teal-700">CSVâ€™yi İndir</a>
        <a href="/api/scraper/xlsx" className="rounded-md bg-emerald-600 text-white px-4 py-2 text-center hover:bg-emerald-700">Excelâ€™i İndir</a>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={watchHeadful} onChange={(e)=> setWatchHeadful(e.target.checked)} />
          Adımları görsel izleme
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-medium">Durum</h2>
          <div className="mt-2 text-sm text-slate-700">
            <div>Marka sayısı: {status?.brands ?? 0}</div>
            <div>Model sayısı: {status?.models ?? 0}</div>
            <div>Seri sayısı: {status?.series ?? 0}</div>
            <div>Paket sayısı: {status?.trims ?? 0}</div>
            <div>Çalışma: {status?.running?.scrape || status?.running?.import ? "Aktif" : "â€”"}</div>
            <div>Son güncelleme: {status?.updatedAt ? new Date(status.updatedAt).toLocaleString() : "â€”"}</div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-medium">Log</h2>
          <div className="mt-2 text-xs text-slate-700 whitespace-pre-wrap h-64 overflow-auto">
            {logs.length ? logs.join("\n") : "Log yok"}
          </div>
        </div>
        {watchHeadful && (
          <div className="rounded-xl border bg-white p-6 md:col-span-2">
            <h2 className="text-lg font-medium">Görsel İzleme</h2>
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-auto">
              {images.map((n)=> (
                <img key={n} src={`/api/scraper/screenshot?name=${encodeURIComponent(n)}`} alt={n} className="w-full h-auto rounded-md border" />
              ))}
              {!images.length && <div className="text-sm text-slate-600">Henüz görsel yok</div>}
            </div>
          </div>
        )}
        <div className="rounded-xl border bg-white p-6">
          <h2 className="text-lg font-medium">Markalar</h2>
          <div className="mt-2">
            <input value={filter} onChange={(e)=> setFilter(e.target.value)} placeholder="Marka ara" className="w-full rounded-md border px-3 py-2" />
          </div>
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {brands.filter(b=> b.toLowerCase().includes(filter.toLowerCase())).map((b)=> (
              <button key={b} onClick={()=> { runBrand(b); loadRaw(b); }} className={`text-left rounded-md border px-3 py-2 hover:bg-slate-50 ${selectedBrand===b ? 'bg-cyan-50 border-cyan-200' : ''}`}>
                {b}
              </button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-white p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Çekilen Veriler</h2>
            {selectedBrand && <button onClick={()=> loadTree(selectedBrand)} className="rounded-md bg-slate-900 text-white px-3 py-1 text-sm">Verileri Yenile</button>}
          </div>
          {!tree?.brand && <div className="mt-2 text-sm text-slate-600">Bir marka seçin veya botu çalıştırın.</div>}
          {tree?.brand && (
            <div className="mt-4">
              <div className="text-sm text-slate-700">Marka: <span className="font-medium">{tree.brand}</span></div>
              <div className="mt-2 space-y-2">
                {(tree.models || []).map((m) => (
                  <div key={m.name}>
                    <button onClick={()=> setOpenModels(prev=> ({ ...prev, [m.name]: !prev[m.name] }))} className="w-full text-left rounded-md border px-3 py-2 hover:bg-slate-50">
                      <span className="font-medium">Model:</span> {m.name}
                    </button>
                    {openModels[m.name] && (
                      <div className="ml-4 mt-2 space-y-2">
                        {m.series.map((s) => (
                          <div key={s.name}>
                            <button onClick={()=> setOpenSeries(prev=> ({ ...prev, [m.name+":"+s.name]: !prev[m.name+":"+s.name] }))} className="w-full text-left rounded-md border px-3 py-2 hover:bg-slate-50">
                              <span className="font-medium">Seri/Motor:</span> {s.name}
                            </button>
                            {openSeries[m.name+":"+s.name] && (
                              <div className="ml-4 mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {s.trims.map((t) => (
                                  <div key={t} className="rounded-md border px-3 py-2">{t}</div>
                                ))}
                                {!s.trims.length && <div className="text-sm text-slate-600">Paket bulunamadı</div>}
                              </div>
                            )}
                          </div>
                        ))}
                        {!m.series.length && <div className="text-sm text-slate-600">Seri/Motor bulunamadı</div>}
                      </div>
                    )}
                  </div>
                ))}
                {!tree.models?.length && <div className="text-sm text-slate-600">Model bulunamadı</div>}
              </div>
            </div>
          )}
        </div>
        <div className="rounded-xl border bg-white p-6 md:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Ham CSV Satırları</h2>
            {selectedBrand && <button onClick={()=> loadRaw(selectedBrand)} className="rounded-md bg-slate-900 text-white px-3 py-1 text-sm">CSVâ€™yi Yenile</button>}
          </div>
          {selectedBrand && (
            <div className="mt-2 text-sm text-slate-700">Marka: <span className="font-medium">{selectedBrand}</span> â€¢ Satır: {rawRows.length}</div>
          )}
          <div className="mt-3 max-h-64 overflow-auto text-xs">
            {rawRows.length ? (
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="px-2 py-1">Model</th>
                    <th className="px-2 py-1">Seri</th>
                    <th className="px-2 py-1">Paket</th>
                  </tr>
                </thead>
                <tbody>
                  {rawRows.slice(0, 60).map((r, i)=> (
                    <tr key={`${r.model}-${r.series}-${r.trim}-${i}`} className="border-t">
                      <td className="px-2 py-1">{r.model}</td>
                      <td className="px-2 py-1">{r.series}</td>
                      <td className="px-2 py-1">{r.trim}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-slate-600">Bu marka için CSV satırı yok.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
