"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { CircleAlert, X } from "lucide-react";
import type { WhatsNewRecord } from "../types";
import { Field, Toggle, inputClass } from "../ui";
import { requestJson } from "../utils";

type WhatsNewDialogProps = {
  onClose: () => void;
  onCreated: (entry: WhatsNewRecord) => void;
};

export default function WhatsNewDialog({ onClose, onCreated }: WhatsNewDialogProps) {
  const [form, setForm] = useState({
    title: "",
    version: "",
    releasedAt: "",
    description: "",
    isPublished: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const result = await requestJson<{ entry: WhatsNewRecord }>("/api/admin/whats-new", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          version: form.version.trim() || null,
          // Omit the date to let the database default (now) apply.
          releasedAt: form.releasedAt ? new Date(form.releasedAt).toISOString() : undefined,
          isPublished: form.isPublished,
        }),
      });
      onCreated(result.entry);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The update could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#211f1a]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="whats-new-form-title">
      <form onSubmit={save} className="my-auto w-full max-w-[560px] rounded-[22px] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0714f]">Share the news</p>
            <h2 id="whats-new-form-title" className="serif mt-1 text-2xl">New update</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]" aria-label="Close update form"><X size={16} /></button>
        </div>

        {error && (
          <div role="alert" className="mb-4 flex items-start gap-2 rounded-xl border border-[#f1d5ca] bg-[#fbefeb] px-3.5 py-3 text-[11px] leading-5 text-[#99452c]">
            <CircleAlert className="mt-0.5 shrink-0" size={14} />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Title" full><input required maxLength={255} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className={inputClass} placeholder="e.g. Faster checkout" /></Field>
          <Field label="Version (optional)"><input maxLength={50} value={form.version} onChange={(event) => setForm({ ...form, version: event.target.value })} className={inputClass} placeholder="v1.4.0" /></Field>
          <Field label="Release date (optional)"><input type="datetime-local" value={form.releasedAt} onChange={(event) => setForm({ ...form, releasedAt: event.target.value })} className={inputClass} /></Field>
          <Field label="Description" full><textarea required rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={`${inputClass} resize-y`} placeholder="What changed, and why it matters." /></Field>
          <div className="sm:col-span-2"><Toggle checked={form.isPublished} onChange={(isPublished) => setForm({ ...form, isPublished })} label="Published" /></div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-[10px] font-bold text-[#706d63] hover:bg-[#f7f5ef]">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full bg-[#e95e25] px-5 py-2.5 text-[10px] font-extrabold text-white hover:bg-[#c94b18] disabled:opacity-60">{saving ? "Saving…" : "Publish update"}</button>
        </div>
      </form>
    </div>
  );
}
