"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { X } from "lucide-react";
import { Field, inputClass } from "../ui";
import { requestJson } from "../utils";

type PromotionDialogProps = {
  setError: (message: string) => void;
  onClose: () => void;
  onCreated: () => void | Promise<void>;
};

export default function PromotionDialog({ setError, onClose, onCreated }: PromotionDialogProps) {
  const [promotionForm, setPromotionForm] = useState({ title: "", code: "", message: "" });

  async function addPromotion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    try {
      await requestJson("/api/admin/promotions", {
        method: "POST",
        body: JSON.stringify({
          ...promotionForm,
          code: promotionForm.code.trim() ? promotionForm.code.trim().toUpperCase() : null,
          enabled: true,
        }),
      });
      await onCreated();
    } catch (promotionError) {
      setError(promotionError instanceof Error ? promotionError.message : "Promotion could not be saved.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#211f1a]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="promotion-form-title">
      <form onSubmit={addPromotion} className="w-full max-w-[480px] rounded-[22px] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
        <div className="mb-5 flex items-start justify-between">
          <div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0714f]">A reason to celebrate</p><h2 id="promotion-form-title" className="serif mt-1 text-2xl">New promotion</h2></div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]" aria-label="Close promotion form"><X size={16} /></button>
        </div>
        <div className="grid gap-4">
          <Field label="Campaign title"><input required value={promotionForm.title} onChange={(event) => setPromotionForm({ ...promotionForm, title: event.target.value })} className={inputClass} placeholder="Weekend dinner, sorted" /></Field>
          <Field label="Discount code (optional)"><input value={promotionForm.code} onChange={(event) => setPromotionForm({ ...promotionForm, code: event.target.value.toUpperCase() })} className={`${inputClass} uppercase`} placeholder="GOODMOOD" /></Field>
          <Field label="Campaign message"><textarea required rows={3} value={promotionForm.message} onChange={(event) => setPromotionForm({ ...promotionForm, message: event.target.value })} className={`${inputClass} resize-y`} placeholder="What should customers know?" /></Field>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-[10px] font-bold text-[#706d63] hover:bg-[#f7f5ef]">Cancel</button>
          <button type="submit" className="rounded-full bg-[#e95e25] px-5 py-2.5 text-[10px] font-extrabold text-white hover:bg-[#c94b18]">Create promotion</button>
        </div>
      </form>
    </div>
  );
}
