"use client";
import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

interface SignOutLinkProps {
  className?: string;
  children: React.ReactNode;
}

export default function SignOutLink({ className, children }: SignOutLinkProps) {
  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    signOut({ callbackUrl: '/' });
  };

  return (
    <a href="#" onClick={handleSignOut} className={className}>
      {children}
    </a>
  );
}