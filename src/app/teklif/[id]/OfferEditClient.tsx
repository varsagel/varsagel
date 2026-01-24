"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Pencil, Loader2, Upload, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

type Props = {
  offerId: string;
  initialPrice: number;
  initialMessage: string;
  initialImages: string[];
};

async function safeJson(res: Response) {
  const raw = await res.text();
  try {
    return { ok: res.ok, status: res.status, json: JSON.parse(raw), raw };
  } catch {
    return { ok: res.ok, status: res.status, json: null as any, raw };
  }
}

export default function OfferEditClient({ offerId, initialPrice, initialMessage, initialImages }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isS3Image = (src: string) => {
    if (!/^https?:\/\//i.test(src)) return false;
    try {
      return new URL(src).hostname.toLowerCase().includes(".s3.");
    } catch {
      return false;
    }
  };
  const isCloudFrontImage = (src: string) => {
    if (!/^https?:\/\//i.test(src)) return false;
    try {
      return new URL(src).hostname.toLowerCase().includes(".cloudfront.net");
    } catch {
      return false;
    }
  };
  const toProxyImageSrc = (src: string) => {
    const raw = String(src || '').trim();
    if (!raw) return raw;
    if (!/^https?:\/\//i.test(raw)) return raw;
    try {
      const parsed = new URL(raw);
      const host = parsed.hostname.toLowerCase();
      if (host.includes(".s3.") || host.includes(".cloudfront.net")) {
        return `/api/upload?url=${encodeURIComponent(raw)}`;
      }
    } catch {}
    return raw;
  };

  const [price, setPrice] = useState(String(initialPrice || ""));
  const [message, setMessage] = useState(initialMessage || "");
  const [images, setImages] = useState<string[]>(Array.isArray(initialImages) ? initialImages : []);

  const canSave = useMemo(() => {
    const p = Number(price);
    return !saving && !uploading && Number.isFinite(p) && p > 0 && message.trim().length > 0;
  }, [price, message, saving, uploading]);

  const uploadOne = async (file: File) => {
    const fd = new FormData();
    const ext = file.name.split(".").pop() || "jpg";
    const safeName = `image-${Date.now()}.${ext}`;
    fd.append("file", file, safeName);
    const res = await fetch("/api/upload", { method: "POST", body: fd, cache: "no-store" });
    const data = await safeJson(res);
    if (!data.ok || !data.json?.success || !data.json?.url) {
      throw new Error(data.json?.error || data.raw || "Yükleme başarısız");
    }
    const scanStatus = String(data.json?.scan?.status || "").toUpperCase();
    if (scanStatus && scanStatus !== "CLEAN") {
      toast({ title: "Tarama Bekleniyor", description: "Görsel yüklendi, güvenlik taraması bekleniyor.", variant: "warning" });
    }
    return String(data.json.url);
  };

  const onPickFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length >= 10) {
      toast({ title: "Limit", description: "En fazla 10 görsel ekleyebilirsiniz.", variant: "warning" });
      return;
    }
    setUploading(true);
    try {
      const next = [...images];
      const startedWith = next.length;
      for (let i = 0; i < files.length; i++) {
        if (next.length >= 10) break;
        const f = files[i];
        if (!f) continue;
        const url = await uploadOne(f);
        next.push(url);
      }
      setImages(next);
      const added = Math.max(0, next.length - startedWith);
      if (added > 0) {
        toast({ title: "Yüklendi", description: `${added} görsel eklendi.`, variant: "success" });
      } else {
        toast({ title: "Limit", description: "En fazla 10 görsel ekleyebilirsiniz.", variant: "warning" });
      }
    } catch (e: any) {
      toast({ title: "Hata", description: e?.message || "Yükleme başarısız", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const res = await fetch("/api/offers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId,
          action: "update",
          price: Number(price),
          message,
          images,
        }),
      });
      const data = await safeJson(res);
      if (!data.ok || !data.json?.ok) {
        throw new Error(data.json?.error || data.raw || "Güncelleme başarısız");
      }
      toast({ title: "Güncellendi", description: "Teklifiniz güncellendi." });
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      toast({ title: "Hata", description: e?.message || "Güncelleme başarısız", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-900 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-colors"
      >
        <Pencil className="w-4 h-4 text-cyan-700" />
        Teklifi Düzenle
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-xl bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="font-extrabold text-gray-900">Teklifi Güncelle</div>
              <button type="button" onClick={() => setOpen(false)} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Teklif Tutarı</label>
                <input
                  type="number"
                  min={1}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-bold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Mesaj</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-transparent font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="block text-sm font-bold text-gray-700">Görseller</label>
                  <label className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold border transition-colors ${uploading || images.length >= 10 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-cyan-700 border-cyan-200 hover:bg-cyan-50 cursor-pointer'}`}>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Görsel Ekle
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      disabled={uploading || images.length >= 10}
                      onChange={(e) => {
                        const files = e.target.files;
                        e.target.value = "";
                        onPickFiles(files);
                      }}
                    />
                  </label>
                </div>

                {images.length > 0 ? (
                  <div className="grid grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={`${img}-${idx}`} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                        {(() => {
                          const displaySrc = toProxyImageSrc(img);
                          const unoptimized =
                            displaySrc.startsWith('/api/upload') ||
                            img.startsWith('/uploads/') ||
                            /\.jfif($|\?)/i.test(img) ||
                            /\.jif($|\?)/i.test(img) ||
                            isS3Image(img) ||
                            isCloudFrontImage(img);
                          return (
                            <Image src={displaySrc} alt={`Görsel ${idx + 1}`} fill className="object-cover" unoptimized={unoptimized} />
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-white/90 hover:bg-white border border-gray-200"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    Görsel eklemek opsiyonel.
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Vazgeç
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!canSave}
                className={`px-4 py-2.5 rounded-xl font-extrabold text-white transition-colors inline-flex items-center gap-2 ${
                  canSave ? "bg-cyan-600 hover:bg-cyan-700" : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
