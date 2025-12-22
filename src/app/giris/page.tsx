import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import GirisClient from "./GirisClient";

export default function GirisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
      </div>
    }>
      <GirisClient />
    </Suspense>
  );
}
