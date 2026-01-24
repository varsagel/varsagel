"use client"

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { AlertTriangle, Bell, CheckCircle2, Info, XCircle } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const Icon =
          variant === "destructive"
            ? XCircle
            : variant === "success"
              ? CheckCircle2
              : variant === "warning"
                ? AlertTriangle
                : variant === "info"
                  ? Info
                  : Bell

        const iconWrapClass =
          variant === "destructive"
            ? "bg-white border border-rose-200"
            : variant === "success"
              ? "bg-white border border-lime-200"
              : variant === "warning"
                ? "bg-white border border-amber-200"
                : variant === "info"
                  ? "bg-white border border-sky-200"
                  : "bg-white border border-cyan-200"

        const iconClass =
          variant === "destructive"
            ? "text-rose-700"
            : variant === "success"
              ? "text-lime-700"
              : variant === "warning"
                ? "text-amber-700"
                : variant === "info"
                  ? "text-sky-700"
                  : "text-cyan-700"

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-sm ${iconWrapClass}`}>
                <Icon className={`h-5 w-5 ${iconClass}`} />
              </div>
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
