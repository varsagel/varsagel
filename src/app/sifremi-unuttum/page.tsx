"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, Loader2, AlertCircle, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Bir hata oluştu");
      }

      setStatus("success");
      setMessage(data.message);
    } catch (error: any) {
      setStatus("error");
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === "success") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-md w-full text-center bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div className="mx-auto h-16 w-16 bg-lime-100 rounded-full flex items-center justify-center mb-6">
             <Mail className="h-8 w-8 text-lime-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">E-posta Gönderildi</h2>
          <p className="text-gray-600 mb-8">
            {message}
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/giris"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700"
            >
              Giriş Yap
            </Link>
            <button
              onClick={() => setStatus("idle")}
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              Farklı bir e-posta adresi dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
            <KeyRound className="h-6 w-6 text-cyan-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Şifremi Unuttum</h2>
          <p className="mt-2 text-sm text-gray-600">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-posta Adresi</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm transition-colors"
                  placeholder="ornek@email.com"
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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    Sıfırlama Bağlantısı Gönder
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <Link href="/giris" className="font-medium text-cyan-600 hover:text-cyan-500 hover:underline flex items-center gap-1">
                  ← Giriş sayfasına dön
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
