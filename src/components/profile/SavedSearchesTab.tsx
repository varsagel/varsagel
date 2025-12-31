"use client";

import { useEffect, useState } from "react";
import { Trash2, Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface SavedSearch {
  id: string;
  name: string;
  query: string | null;
  categorySlug: string | null;
  subcategorySlug: string | null;
  isAlarm: boolean;
  emailNotification: boolean;
  frequency: string;
  createdAt: string;
}

export function SavedSearchesTab() {
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSearches = async () => {
    try {
      const res = await fetch("/api/saved-searches");
      if (res.ok) {
        const data = await res.json();
        setSearches(data);
      }
    } catch (error) {
      console.error("Error fetching saved searches:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu aramayı silmek istediğinize emin misiniz?')) return;
    
    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setSearches((prev) => prev.filter((s) => s.id !== id));
        toast({
          title: "Başarılı",
          description: "Kayıtlı arama silindi.",
        });
      } else {
        throw new Error("Silinemedi");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleToggleAlarm = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAlarm: !currentStatus }),
      });

      if (res.ok) {
        setSearches((prev) =>
          prev.map((s) => (s.id === id ? { ...s, isAlarm: !currentStatus } : s))
        );
        toast({
          title: "Başarılı",
          description: `Alarm ${!currentStatus ? "açıldı" : "kapatıldı"}.`,
        });
      } else {
        throw new Error("Güncellenemedi");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Alarm durumu değiştirilemedi.",
        variant: "destructive",
      });
    }
  };

  const handleToggleEmail = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/saved-searches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailNotification: !currentStatus }),
      });

      if (res.ok) {
        setSearches((prev) =>
          prev.map((s) => (s.id === id ? { ...s, emailNotification: !currentStatus } : s))
        );
        toast({
          title: "Başarılı",
          description: "Bildirim ayarı güncellendi.",
        });
      } else {
        throw new Error("Güncellenemedi");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem başarısız.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Kayıtlı Aramalarım ve Alarmlar</h2>
      </div>

      {searches.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <BellOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz kayıtlı aramanız yok</h3>
          <p className="text-gray-500 mb-6">
            İlgilendiğiniz kategorilerde arama yapıp "Alarm Kur" diyerek buraya ekleyebilirsiniz.
          </p>
          <Link href="/">
            <Button variant="outline">Arama Yapmaya Başla</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {searches.map((search) => (
            <div
              key={search.id}
              className="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{search.name}</h3>
                  {search.isAlarm && (
                    <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Bell className="w-3 h-3" />
                      Alarm Açık
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {search.categorySlug && <span className="capitalize">{search.categorySlug}</span>}
                  {search.subcategorySlug && <span className="capitalize"> / {search.subcategorySlug}</span>}
                  {search.query && <span> • "{search.query}"</span>}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>{new Date(search.createdAt).toLocaleDateString("tr-TR")}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="uppercase">{search.frequency === 'INSTANT' ? 'Anlık' : search.frequency === 'DAILY' ? 'Günlük' : 'Haftalık'}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 sm:border-l sm:pl-4 sm:border-gray-100">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 min-w-[140px]">
                        <span className="text-sm text-gray-600">Alarm</span>
                        <Switch 
                            checked={search.isAlarm}
                            onCheckedChange={() => handleToggleAlarm(search.id, search.isAlarm)}
                        />
                    </div>
                    {search.isAlarm && (
                        <div className="flex items-center justify-between gap-2 min-w-[140px]">
                            <span className="text-sm text-gray-600">E-posta</span>
                            <Switch 
                                checked={search.emailNotification}
                                onCheckedChange={() => handleToggleEmail(search.id, search.emailNotification)}
                            />
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 pl-2 border-l border-gray-100">
                    <Link 
                      href={`/kategori/${search.categorySlug || 'hepsi'}${search.subcategorySlug ? '/' + search.subcategorySlug : ''}?q=${search.query || ''}`}
                    >
                      <Button variant="ghost" size="icon" title="Aramaya Git">
                        <Bell className="w-4 h-4 text-cyan-600" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(search.id)}
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
