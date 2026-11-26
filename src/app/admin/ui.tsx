import type { ReactNode } from "react";
import { Check, CircleAlert, X } from "lucide-react";

export const inputClass =
  "w-full rounded-xl border border-[#e3dccf] bg-white px-3.5 py-3 text-xs text-[#38372f] outline-none transition focus:border-[#d95720]";

export function Field({ label, children, full = false }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <label className={`grid gap-2 text-[10px] font-bold text-[#545147] ${full ? "sm:col-span-2" : ""}`}>
      {label}
      {children}
    </label>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-bold transition ${checked ? "border-[#dfe7d2] bg-[#f0f3e9] text-[#61764a]" : "border-[#e8e4da] bg-white text-[#8b887e]"}`}
    >
      <span className={`grid h-4 w-4 place-items-center rounded-full ${checked ? "bg-[#71834f] text-white" : "border border-[#d7d2c8]"}`}>
        {checked && <Check size={10} />}
      </span>
      {label}
    </button>
  );
}

export function DetailGroup({ title, items }: { title: string; items: [string, ReactNode][] }) {
  const visible = items.filter(([, value]) => value !== null && value !== undefined && value !== "" && value !== "—");
  if (visible.length === 0) return null;
  return (
    <section>
      <h3 className="mb-3 text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#a29e92]">{title}</h3>
      <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {visible.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="text-[10px] text-[#8b887e]">{label}</dt>
            <dd className="mt-0.5 break-words text-xs font-semibold text-[#38372f]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-[#f1d5ca] bg-[#fbefeb] px-4 py-3.5 text-xs leading-5 text-[#99452c]">
      <CircleAlert className="mt-0.5 shrink-0" size={15} />
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss error"><X size={15} /></button>
    </div>
  );
}
