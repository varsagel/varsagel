"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Eye, Copy, RefreshCw, Search, AlertCircle, Server, Monitor, Globe, Activity, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";

interface ErrorLog {
  id: string;
  message: string;
  stack: string | null;
  source: string;
  url: string | null;
  method: string | null;
  userId: string | null;
  context: any;
  createdAt: string;
}

export default function DebugPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<ErrorLog | null>(null);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState<any>(null);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sourceFilter !== "all") params.append("source", sourceFilter);
      if (searchQuery) params.append("search", searchQuery);
      
      const res = await fetch(`/api/admin/logs?${params.toString()}`);
      if (!res.ok) throw new Error("Loglar yüklenemedi");
      
      const data = await res.json();
      setLogs(data.logs);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Loglar getirilirken bir sorun oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    setScanning(true);
    setScanResults(null);
    try {
      const res = await fetch('/api/admin/diagnose', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        setScanResults(data.results);
        toast({
          title: "Tarama Tamamlandı",
          description: "Sistem sağlık taraması tamamlandı.",
        });
        // Yeni bir hata bulunduysa listeyi yenile
        fetchLogs();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      toast({
        title: "Tarama Hatası",
        description: "Sistem taranırken bir sorun oluştu.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [sourceFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const copyToClipboard = (log: ErrorLog) => {
    const aiPrompt = `
Lütfen aşağıdaki hatayı analiz et ve çözüm öner:

Message: ${log.message}
Source: ${log.source}
URL: ${log.url || 'N/A'}
Method: ${log.method || 'N/A'}
User ID: ${log.userId || 'N/A'}
Time: ${log.createdAt}

Stack Trace:
${log.stack || 'No stack trace available'}

Context:
${JSON.stringify(log.context, null, 2)}
    `.trim();

    navigator.clipboard.writeText(aiPrompt);
    toast({
      title: "Kopyalandı",
      description: "Hata detayı AI formatında panoya kopyalandı.",
    });
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'frontend': return <Monitor className="w-4 h-4 text-blue-500" />;
      case 'backend': return <Server className="w-4 h-4 text-purple-500" />;
      default: return <Globe className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Debug & Hata Logları</h1>
          <p className="text-slate-500">Sistemdeki hataları izleyin ve AI ile analiz edin.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="default" onClick={handleScan} disabled={scanning || loading}>
            <Activity className={`w-4 h-4 mr-2 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Taranıyor...' : 'Sistemi Tara'}
          </Button>
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {scanResults && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(scanResults).map(([key, result]: [string, any]) => (
            <div key={key} className={`p-4 rounded-xl border ${result.status === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.status === 'ok' ? <CheckCircle className="w-5 h-5 text-green-600" /> : <XCircle className="w-5 h-5 text-red-600" />}
                <h3 className="font-semibold capitalize text-slate-900">{key === 'env' ? 'Environment' : key} Check</h3>
              </div>
              <p className={`text-sm ${result.status === 'ok' ? 'text-green-700' : 'text-red-700'}`}>{result.message}</p>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Hata mesajı, stack trace veya URL ara..." 
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="all">Tüm Kaynaklar</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="unknown">Bilinmeyen</option>
            </select>
          </div>
          <Button type="submit">Filtrele</Button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Kaynak</th>
                <th className="px-6 py-4">Mesaj</th>
                <th className="px-6 py-4">URL / Metod</th>
                <th className="px-6 py-4">Zaman</th>
                <th className="px-6 py-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <p>Kayıtlı hata bulunamadı.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(log.source)}
                        <span className="capitalize text-slate-700 font-medium">{log.source}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900 line-clamp-2 max-w-md" title={log.message}>
                        {log.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      <div className="flex flex-col gap-1">
                        {log.url && <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded w-fit max-w-[200px] truncate">{log.url}</span>}
                        {log.method && <span className="text-xs font-semibold text-slate-400">{log.method}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                      {format(new Date(log.createdAt), "d MMM yyyy HH:mm:ss", { locale: tr })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(log)} title="AI Formatında Kopyala">
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedLog(log)} title="Detaylar">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="text-red-500" />
              Hata Detayı
            </DialogTitle>
            <DialogDescription>
              {selectedLog?.createdAt && format(new Date(selectedLog.createdAt), "PPP p", { locale: tr })}
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 mb-1">Mesaj</h3>
                <p className="text-lg font-medium text-slate-900">{selectedLog.message}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500 mb-1">Kaynak</h3>
                  <p className="text-sm font-medium">{selectedLog.source}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500 mb-1">URL / Method</h3>
                  <p className="text-sm font-medium">{selectedLog.url || '-'} {selectedLog.method ? `(${selectedLog.method})` : ''}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500 mb-1">Kullanıcı ID</h3>
                  <p className="text-sm font-mono">{selectedLog.userId || '-'}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <h3 className="text-xs font-semibold text-slate-500 mb-1">Log ID</h3>
                  <p className="text-sm font-mono">{selectedLog.id}</p>
                </div>
              </div>

              {selectedLog.stack && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Stack Trace</h3>
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-xs font-mono leading-relaxed">
                    {selectedLog.stack}
                  </pre>
                </div>
              )}

              {selectedLog.context && Object.keys(selectedLog.context).length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-2">Context</h3>
                  <pre className="bg-slate-50 p-4 rounded-lg border border-slate-200 overflow-x-auto text-xs font-mono">
                    {JSON.stringify(selectedLog.context, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedLog(null)}>Kapat</Button>
                <Button onClick={() => copyToClipboard(selectedLog)}>
                  <Copy className="w-4 h-4 mr-2" />
                  AI Formatında Kopyala
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
