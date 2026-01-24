"use client";

import { useState, useEffect, useRef } from "react";
import { AlertCircle, Terminal, Play, RefreshCw } from "lucide-react";

export default function DeployPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState("");
  const [status, setStatus] = useState<"idle" | "deploying" | "success" | "error">("idle");
  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/deploy/status");
      const data = await res.json();
      if (data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleDeploy = async () => {
    if (!confirm("Sistemi güncellemek ve yeniden başlatmak istediğinize emin misiniz? Site kısa bir süre erişilemez olabilir.")) {
      return;
    }

    setLoading(true);
    setStatus("deploying");
    try {
      const res = await fetch("/api/admin/deploy", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        // Just wait and watch logs
      } else {
        setStatus("error");
        alert("Hata: " + data.error);
      }
    } catch {
      setStatus("error");
      alert("Bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Dağıtımı (Deploy)</h1>
          <p className="text-gray-500 mt-1">Sistemi en son versiyona güncelle ve yeniden başlat.</p>
        </div>
        
        <button
          onClick={handleDeploy}
          disabled={loading || status === "deploying"}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors ${
            loading || status === "deploying"
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-cyan-600 hover:bg-cyan-700"
          }`}
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          {status === "deploying" ? "Dağıtılıyor..." : "Deploy Başlat"}
        </button>
      </div>

      <div className="bg-slate-900 rounded-lg shadow-lg overflow-hidden border border-slate-700">
        <div className="bg-slate-800 px-4 py-2 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-2 text-slate-300">
            <Terminal className="w-4 h-4" />
            <span className="text-sm font-mono">deploy.log</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${status === 'deploying' ? 'bg-yellow-400 animate-pulse' : 'bg-gray-500'}`}></span>
            <span className="text-xs text-slate-400">Canlı İzleme</span>
          </div>
        </div>
        
        <div 
          ref={logContainerRef}
          className="p-4 h-[500px] overflow-y-auto font-mono text-sm text-green-400 whitespace-pre-wrap"
        >
          {logs || "Henüz log kaydı yok..."}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold mb-1">Bilgilendirme</p>
          <ul className="list-disc list-inside space-y-1 text-blue-700">
            <li>Deploy işlemi Git üzerinden son değişiklikleri çeker (git pull).</li>
            <li>Paket bağımlılıklarını günceller (npm install).</li>
            <li>Projeyi derler (npm run build).</li>
            <li>PM2 kullanılıyorsa servisi yeniden başlatır.</li>
            <li>İşlem sırasında site kısa süreliğine erişilemez olabilir.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
