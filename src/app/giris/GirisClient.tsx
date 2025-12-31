"use client";
import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, LogIn } from "lucide-react";

export default function GirisClient() {
  const searchParams = useSearchParams();
  const sanitizeCallbackUrl = (value: string | null) => {
    const raw = (value || "/").trim();
    if (!raw) return "/";
    if (raw.includes("://")) return "/";
    if (!raw.startsWith("/")) return "/";
    if (raw === "/api/auth" || raw.startsWith("/api/auth/")) return "/";
    return raw;
  };

  const callbackUrl = sanitizeCallbackUrl(searchParams.get("callbackUrl"));
  const registered = searchParams.get("registered") === "true";
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (res.error.includes("doğrulama") || res.error.includes("verify")) {
        setError(res.error);
      } else {
        setError("E-posta veya şifre hatalı");
      }
      return;
    }
    // Başarılı giriş sonrası yönlendirme
    window.location.href = callbackUrl;
  };

  return (
    <div className="min-h-[80dvh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-cyan-100 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-6 w-6 text-cyan-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Giriş Yap</h2>
          <p className="mt-2 text-sm text-gray-600">
            Hesabınıza giriş yapın veya Google ile devam edin.
          </p>
        </div>

        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 rounded-xl sm:px-10">
          <button
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex justify-center items-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all"
          >
            <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google ile devam et
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">veya e-posta ile</span>
            </div>
          </div>

            {registered && (
              <div className="rounded-md bg-green-50 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Kayıt Başarılı!</h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>Hesabınız oluşturuldu. Lütfen e-posta adresinize gönderilen doğrulama bağlantısına tıklayarak hesabınızı etkinleştirin.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
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
              <div className="flex justify-end mt-1">
                <Link href="/sifremi-unuttum" className="text-sm text-cyan-600 hover:text-cyan-500 font-medium">
                  Şifremi unuttum
                </Link>
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
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
                    Giriş Yapılıyor...
                  </>
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Hesabınız yok mu?{" "}
                  <Link 
                    href={`/kayit${callbackUrl !== "/" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                    className="font-medium text-cyan-600 hover:text-cyan-500 hover:underline"
                  >
                    Hemen kayıt olun
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
