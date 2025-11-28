"use client";
import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function KayitPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Kayıt başarısız");
      }
      await signIn("credentials", { email, password, callbackUrl: "/profil" });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Kayıt Ol</h1>
      <p className="mt-2 text-sm text-slate-600">E-posta ile hesap oluştur veya Google ile kayıt ol.</p>

      <div className="mt-6 rounded-xl border bg-white p-6">
        <button
          className="w-full rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
          onClick={() => signIn("google", { callbackUrl: "/profil" })}
        >
          Google ile kayıt ol
        </button>

        <div className="relative my-6">
          <div className="border-t" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-slate-500">veya e-posta</span>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Ad</label>
            <input
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">E-posta</label>
            <input
              type="email"
              className="mt-1 w-full rounded-md border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@eposta.com"
              required
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Şifre</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Şifre (Tekrar)</label>
              <input
                type="password"
                className="mt-1 w-full rounded-md border px-3 py-2"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-md bg-black text-white px-4 py-2"
            disabled={loading}
          >
            {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Zaten hesabın var mı? {" "}
          <Link href="/giris" className="text-blue-600 hover:text-blue-700">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
}