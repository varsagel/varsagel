"use client";
import { signOut } from "next-auth/react";

interface SignOutLinkProps {
  className?: string;
  children: React.ReactNode;
  onBeforeSignOut?: () => void;
}

export default function SignOutLink({ className, children, onBeforeSignOut }: SignOutLinkProps) {
  const handleSignOut = (e: React.MouseEvent) => {
    e.preventDefault();
    onBeforeSignOut?.();
    signOut({ callbackUrl: '/' });
  };

  return (
    <a href="#" onClick={handleSignOut} className={className}>
      {children}
    </a>
  );
}
