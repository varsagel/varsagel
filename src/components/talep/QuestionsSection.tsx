"use client";
import { useEffect, useState, useCallback } from "react";
import { MessageSquare, Reply, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";

interface Question {
  id: string;
  body: string;
  createdAt: string;
  user: { id: string | null; name: string };
  answer?: string;
  answeredAt?: string;
}

export default function QuestionsSection({ listingId, isOwner = false }: { listingId: string; isOwner?: boolean }) {
  const session = useSession();
  const status = session?.status || "loading";
  const { toast } = useToast();
  const [items, setItems] = useState<Question[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const isAdmin = String(session?.data?.user?.role || "").toUpperCase() === "ADMIN" || String(session?.data?.user?.email || "").toLowerCase() === "varsagel.com@gmail.com";

  const load = useCallback(async () => {
    try {
      const r = await fetch(`/api/talepler/${listingId}/questions`, { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setItems(data);
      }
    } catch {}
  }, [listingId]);

  useEffect(() => {
    load();
  }, [load]);

  const submitQuestion = async () => {
    if (!text.trim()) return;
    if (isOwner) {
       toast({ title: "Hata", description: "Kendi talebinize soru soramazsınız.", variant: "destructive" });
       return;
    }

    setLoading(true);
    try {
      const r = await fetch(`/api/talepler/${listingId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text.trim() })
      });
      if (r.ok) {
        setText("");
        await load();
        toast({ title: "Başarılı", description: "Sorunuz gönderildi.", variant: "success" });
      } else {
        const data = await r.json();
        toast({ title: "Hata", description: data.error || "Bir hata oluştu", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitAnswer = async (questionId: string) => {
    const answerText = replyTexts[questionId];
    if (!answerText?.trim()) return;

    setReplyingId(questionId);
    try {
      const r = await fetch(`/api/talepler/${listingId}/questions`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, answer: answerText.trim() })
      });

      if (r.ok) {
        setReplyTexts(prev => {
            const next = { ...prev };
            delete next[questionId];
            return next;
        });
        await load();
        toast({ title: "Başarılı", description: "Cevabınız gönderildi.", variant: "success" });
      } else {
        const data = await r.json();
        toast({ title: "Hata", description: data.error || "Bir hata oluştu", variant: "destructive" });
      }
    } catch {
       toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    } finally {
       setReplyingId(null);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
    try {
      const r = await fetch(`/api/talepler/${listingId}/questions?questionId=${encodeURIComponent(questionId)}`, {
        method: "DELETE"
      });
      if (r.ok) {
        await load();
        toast({ title: "Başarılı", description: "Soru silindi.", variant: "success" });
      } else {
        const data = await r.json();
        toast({ title: "Hata", description: data.error || "Bir hata oluştu", variant: "destructive" });
      }
    } catch {
      toast({ title: "Hata", description: "Bir hata oluştu", variant: "destructive" });
    }
  };

  return (
    <div id="questions-section" className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mt-8">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-5 h-5 text-cyan-600" />
        <h3 className="font-bold text-gray-900">Talep Hakkında Sorular</h3>
      </div>
      <p className="text-xs text-gray-600 mb-4">Bu alanda sadece talep ile ilgili sorular yazılabilir. Numara paylaşımı ve teklif verme bu kısımdan yasaktır.</p>

      <div className="space-y-4 mb-6">
        {items.length === 0 ? (
          <div className="text-sm text-gray-500">Henüz soru yok. {isOwner ? "Talebinizle ilgili sorular burada görünecek." : "İlk soruyu sen sor."}</div>
        ) : items.map((q) => (
          <div key={q.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50">
            <div className="flex justify-between items-start gap-3">
              <div>
                <div className="text-sm font-semibold text-gray-900">{q.user?.name || "Misafir"}</div>
                <div className="text-sm text-gray-700 mt-1">{q.body}</div>
                <div className="text-xs text-gray-400 mt-1">{new Date(q.createdAt).toLocaleString("tr-TR")}</div>
              </div>
              {isAdmin && (
                <button
                  onClick={() => deleteQuestion(q.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  title="Soruyu sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {q.answer && (
                <div className="mt-3 ml-4 pl-3 border-l-2 border-cyan-200">
                    <div className="text-sm font-semibold text-cyan-800 flex items-center gap-1">
                        <Reply className="w-3 h-3" /> Talep Sahibi Cevabı
                    </div>
                    <div className="text-sm text-gray-700 mt-1">{q.answer}</div>
                    <div className="text-xs text-gray-400 mt-1">{q.answeredAt ? new Date(q.answeredAt).toLocaleString("tr-TR") : ""}</div>
                </div>
            )}

            {isOwner && !q.answer && (
                <div className="mt-3 flex gap-2">
                    <input 
                        value={replyTexts[q.id] || ""}
                        onChange={(e) => setReplyTexts(prev => ({ ...prev, [q.id]: e.target.value }))}
                        placeholder="Cevabınızı yazın..."
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button 
                        onClick={() => submitAnswer(q.id)}
                        disabled={replyingId === q.id || !replyTexts[q.id]?.trim()}
                        className="px-3 py-1 bg-cyan-600 text-white text-sm rounded-lg hover:bg-cyan-700 disabled:opacity-50"
                    >
                        {replyingId === q.id ? "..." : "Yanıtla"}
                    </button>
                </div>
            )}
          </div>
        ))}
      </div>

      {!isOwner && (
          <div className="flex gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Sorunuzu yazın"
              className="flex-1 border border-gray-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <button
              onClick={submitQuestion}
              disabled={loading || status === "unauthenticated"}
              className="px-4 py-2 rounded-xl bg-cyan-600 text-white font-medium disabled:opacity-50"
            >Gönder</button>
          </div>
      )}
    </div>
  );
}
