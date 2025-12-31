"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      Çıkış Yap
    </button>
  );
}