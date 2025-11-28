"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function GirisPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [googleEnabled, setGoogleEnabled] = useState(false);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const res = await fetch("/api/auth/providers", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setGoogleEnabled(!!data?.google);
      } catch (_) {
        setGoogleEnabled(false);
      }
    };
    fetchProviders();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("E-posta veya şifre hatalı");
      return;
    }
    window.location.href = "/profil";
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold">Giriş Yap</h1>
      <p className="mt-2 text-sm text-slate-600">{googleEnabled ? "Hesabına giriş yap veya Google ile devam et." : "Hesabına giriş yap."}</p>

      <div className="mt-6 rounded-xl border bg-white p-6">
        {googleEnabled && (
          <>
            <button
              className="w-full rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
              onClick={() => signIn("google", { callbackUrl: "/profil" })}
            >
              Google ile devam et
            </button>

            <div className="relative my-6">
              <div className="border-t" />
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-xs text-slate-500">veya e-posta</span>
            </div>
          </>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
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
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full rounded-md bg-black text-white px-4 py-2"
            disabled={loading}
          >
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <div className="mt-4 text-sm text-slate-600">
          Hesabın yok mu? {" "}
          <Link href="/kayit" className="text-blue-600 hover:text-blue-700">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
}