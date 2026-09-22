import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("input", className)} {...props} />;
}
export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn("input min-h-28 resize-y py-3", className)}
      {...props}
    />
  );
}
export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn("input", className)} {...props} />;
}
export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "block space-y-2 text-sm font-medium text-foreground",
        className,
      )}
    >
      <span>{label}</span>
      {children}
      {hint && (
        <span className="block text-xs font-normal leading-relaxed text-muted-foreground">
          {hint}
        </span>
      )}
    </label>
  );
}
export function Feedback({
  error,
  success,
}: {
  error?: string;
  success?: string;
}) {
  return (
    <>
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      {success && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          {success}
        </div>
      )}
    </>
  );
}
