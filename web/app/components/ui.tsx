import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

// Reusable Tailwind primitives: Button, Input, Select, Card, Badge, Modal, Table, Toast.

export function Button({
  variant = "primary",
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "dark" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60",
        variant === "primary" && "bg-sand text-ink hover:bg-sand-deep",
        variant === "dark" && "bg-ink text-ivory hover:bg-navy",
        variant === "secondary" && "border border-sand bg-paper text-ink hover:border-ink",
        variant === "ghost" && "text-navy hover:bg-ivory",
        className
      )}
    />
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-xl border border-sand/60 bg-paper px-4 py-3 text-base text-ink placeholder:text-ink/40 outline-none focus:border-navy focus:ring-2 focus:ring-sand-soft",
        className
      )}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-xl border border-sand/60 bg-paper px-4 py-3 text-base text-ink placeholder:text-ink/40 outline-none focus:border-navy focus:ring-2 focus:ring-sand-soft",
        className
      )}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-xl border border-sand/60 bg-paper px-4 py-3 text-base text-ink outline-none focus:border-navy focus:ring-2 focus:ring-sand-soft",
        className
      )}
    >
      {children}
    </select>
  );
}

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-2xl border border-sand/40 bg-paper p-6 shadow-sm", className)}>{children}</div>
  );
}

export function Badge({
  tone = "slate",
  className,
  children,
}: {
  tone?: "slate" | "amber" | "green" | "red" | "indigo" | "blue" | "sand" | "navy";
  className?: string;
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    slate: "bg-ivory text-ink border-sand/50",
    amber: "bg-sand-soft text-ink border-sand",
    sand: "bg-sand-soft text-ink border-sand",
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    red: "bg-rose-100 text-rose-800 border-rose-200",
    indigo: "bg-navy text-ivory border-navy",
    navy: "bg-navy text-ivory border-navy",
    blue: "bg-ivory text-navy border-navy/25",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold", tones[tone], className)}>
      {children}
    </span>
  );
}

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-ink">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink/60">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-semibold text-rose-600">{error}</span>}
    </label>
  );
}

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/60 p-4 sm:items-center" role="dialog" aria-modal="true">
      <div className="w-full max-w-lg rounded-2xl bg-paper p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-extrabold text-ink">{title}</h3>
          <button onClick={onClose} aria-label="Tutup" className="rounded-lg px-3 py-2 text-ink/60 hover:bg-ivory">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Toast({ message, tone = "dark" }: { message: string; tone?: "dark" | "green" | "red" }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className={cn(
        "fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-semibold shadow-xl",
        tone === "dark" && "bg-ink text-ivory",
        tone === "green" && "bg-emerald-600 text-white",
        tone === "red" && "bg-rose-600 text-white"
      )}
    >
      {message}
    </div>
  );
}

export function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-xs font-extrabold tracking-[0.2em] text-navy">{eyebrow}</p>
      <h2 className="font-display mt-2 text-2xl font-extrabold text-ink sm:text-3xl">{title}</h2>
      {desc && <p className="mt-2 text-sm leading-relaxed text-ink/70 sm:text-base">{desc}</p>}
    </div>
  );
}

export function DataTable({ columns, rows }: { columns: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand/40 bg-paper">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead>
          <tr className="border-b border-sand/40 bg-ivory">
            {columns.map((c) => (
              <th key={c} className="px-4 py-3 text-xs font-extrabold uppercase tracking-wider text-navy/70">{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-ivory last:border-0 hover:bg-ivory/60">
              {r.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-ink">{cell}</td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-8 text-center text-ink/60">Tidak ada data yang cocok.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
