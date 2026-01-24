"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token bulunamadı.");
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "E-posta başarıyla doğrulandı.");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/giris");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Doğrulama başarısız.");
        }
      } catch {
        setStatus("error");
        setMessage("Bir hata oluştu.");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
      {status === "loading" && (
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-cyan-600 animate-spin" />
          <h2 className="text-xl font-bold text-gray-900">Doğrulanıyor...</h2>
          <p className="text-gray-500">Lütfen bekleyiniz, e-posta adresiniz doğrulanıyor.</p>
        </div>
      )}

      {status === "success" && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-lime-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-lime-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Başarılı!</h2>
          <p className="text-gray-600">{message}</p>
          <p className="text-sm text-gray-500 mt-2">Giriş sayfasına yönlendiriliyorsunuz...</p>
          <Link
            href="/giris"
            className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium"
          >
            Hemen Giriş Yap
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-300">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Hata!</h2>
          <p className="text-gray-600">{message}</p>
          <Link
            href="/kayit"
            className="mt-4 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Tekrar Kayıt Ol
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full text-center">
           <Loader2 className="w-12 h-12 text-cyan-600 animate-spin mx-auto" />
           <p className="mt-4 text-gray-500">Yükleniyor...</p>
        </div>
      }>
        <VerifyContent />
      </Suspense>
    </div>
  );
}

