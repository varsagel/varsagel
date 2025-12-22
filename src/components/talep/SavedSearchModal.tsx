"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SavedSearchModalProps {
  searchParams: {
    query?: string;
    categorySlug?: string;
    subcategorySlug?: string;
    minPrice?: number;
    maxPrice?: number;
    city?: string;
    district?: string;
    filtersJson?: any;
  };
  onSave?: () => void;
  trigger?: React.ReactNode;
}

export function SavedSearchModal({ searchParams, onSave, trigger }: SavedSearchModalProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [isAlarm, setIsAlarm] = useState(true);
  const [emailNotification, setEmailNotification] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...searchParams,
          name: name || undefined,
          isAlarm,
          emailNotification,
          siteNotification: true, // Always enable site notification
          frequency: "INSTANT"
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Bir hata oluştu");
      }

      toast({
        title: "Başarılı",
        description: "Arama kaydedildi ve alarm kuruldu.",
      });
      setOpen(false);
      onSave?.();
    } catch (error: any) {
      toast({
        title: "Hata",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full gap-2">
            <Bell className="w-4 h-4" />
            Aramayı Kaydet / Alarm Kur
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Aramayı Kaydet</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Arama Adı (Opsiyonel)</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: İstanbul BMW 3.20"
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
            <div className="space-y-0.5">
              <Label className="text-base">Alarm Bildirimi</Label>
              <div className="text-sm text-muted-foreground">
                Yeni ilan eklendiğinde bildirim al
              </div>
            </div>
            <Switch
              checked={isAlarm}
              onCheckedChange={setIsAlarm}
            />
          </div>

          {isAlarm && (
            <div className="flex items-center justify-between space-x-2 border p-3 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-base">E-posta Bildirimi</Label>
                <div className="text-sm text-muted-foreground">
                  Bildirimleri e-posta ile de al
                </div>
              </div>
              <Switch
                checked={emailNotification}
                onCheckedChange={setEmailNotification}
              />
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Kaydet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
