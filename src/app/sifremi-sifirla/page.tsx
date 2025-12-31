"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, AlertCircle, CheckCircle, KeyRound } from "lucide-react";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  if (!token) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Geçersiz Bağlantı</h2>
        <p className="text-gray-600 mt-2">Şifre sıfırlama bağlantısı geçersiz veya eksik.</p>
        <Link
          href="/sifremi-unuttum"
          className="mt-6 inline-block px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
        >
          Tekrar Dene
        </Link>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setMessage("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Bir hata oluştu");
      }

      setStatus("success");
      setMessage(data.message);
      setTimeout(() => {
        router.push("/giris");
      }, 3000);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-lime-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Şifreniz Güncellendi!</h2>
        <p className="text-gray-600 mt-2">{message}</p>
        <p className="text-sm text-gray-500 mt-4">Giriş sayfasına yönlendiriliyorsunuz...</p>
        <Link
          href="/giris"
          className="mt-6 inline-block px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
        >
          Hemen Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full">
      <div className="text-center mb-8">
        <div className="mx-auto h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
          <KeyRound className="h-6 w-6 text-cyan-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Yeni Şifre Belirle</h2>
        <p className="mt-2 text-sm text-gray-600">
          Lütfen hesabınız için yeni bir şifre belirleyin.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors"
              placeholder="••••••••"
            />
          </div>
        </div>

        {status === "error" && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{message}</h3>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Güncelleniyor...
            </>
          ) : (
            "Şifreyi Güncelle"
          )}
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
           <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto" />
           <p className="mt-4 text-gray-500">Yükleniyor...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}

