"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import type { CategoryRecord } from "../types";
import { Field, inputClass } from "../ui";
import { makeSlug, requestJson } from "../utils";

type CategoryDialogProps = {
  setError: (message: string) => void;
  onClose: () => void;
  onCreated: (category: CategoryRecord) => void;
};

export default function CategoryDialog({ setError, onClose, onCreated }: CategoryDialogProps) {
  const [categoryName, setCategoryName] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingCategory(true);
    setError("");
    try {
      const result = await requestJson<{ category: CategoryRecord }>("/api/admin/categories", {
        method: "POST",
        body: JSON.stringify({ name: categoryName, slug: categorySlug }),
      });
      onCreated(result.category);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The category could not be saved.");
    } finally {
      setSavingCategory(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#211f1a]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="category-form-title">
      <form onSubmit={addCategory} className="w-full max-w-[480px] rounded-[22px] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-start justify-between">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0714f]">Menu organisation</p><h2 id="category-form-title" className="serif mt-1 text-2xl">Add a category</h2></div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]" aria-label="Close category form"><X size={16} /></button>
        </div>
        <div className="grid gap-4">
          <Field label="Category name"><input required minLength={2} maxLength={80} value={categoryName} onChange={(event) => { setCategoryName(event.target.value); setCategorySlug(makeSlug(event.target.value)); }} className={inputClass} placeholder="e.g. Small plates" /></Field>
          <Field label="URL slug"><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={100} value={categorySlug} onChange={(event) => setCategorySlug(event.target.value)} className={inputClass} placeholder="small-plates" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-[10px] font-bold text-[#706d63] hover:bg-[#f7f5ef]">Cancel</button>
          <button type="submit" disabled={savingCategory} className="rounded-full bg-[#e95e25] px-5 py-2.5 text-[10px] font-extrabold text-white hover:bg-[#c94b18] disabled:opacity-60">{savingCategory ? "Saving…" : "Save category"}</button>
        </div>
      </form>
    </div>
  );
}
