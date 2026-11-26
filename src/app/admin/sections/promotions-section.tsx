"use client";

import { useState } from "react";
import { Plus, Tag } from "lucide-react";
import PromotionDialog from "../dialogs/promotion-dialog";
import type { PromotionRecord } from "../types";
import { requestJson } from "../utils";

type PromotionsSectionProps = {
  promotions: PromotionRecord[];
  setPromotions: React.Dispatch<React.SetStateAction<PromotionRecord[]>>;
  setError: (message: string) => void;
  /** Reload admin data after a promotion is created. */
  onCreated: () => void | Promise<void>;
};

export default function PromotionsSection({ promotions, setPromotions, setError, onCreated }: PromotionsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  async function togglePromotion(promotion: PromotionRecord) {
    try {
      await requestJson(`/api/admin/promotions/${promotion.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !promotion.enabled }),
      });
      setPromotions((current) =>
        current.map((entry) => (entry.id === promotion.id ? { ...entry, enabled: !entry.enabled } : entry)),
      );
    } catch (promotionError) {
      setError(promotionError instanceof Error ? promotionError.message : "Promotion could not be updated.");
    }
  }

  async function deletePromotion(promotion: PromotionRecord) {
    if (!window.confirm(`Delete "${promotion.title}"?`)) return;
    try {
      await requestJson(`/api/admin/promotions/${promotion.id}`, { method: "DELETE" });
      setPromotions((current) => current.filter((entry) => entry.id !== promotion.id));
    } catch (promotionError) {
      setError(promotionError instanceof Error ? promotionError.message : "Promotion could not be deleted.");
    }
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">A little something extra</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">Promotions &amp; campaigns.</h2>
          <p className="mt-2 text-xs text-[#8b887e]">Keep track of offers you’re sharing with your customers.</p>
        </div>
        <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> New promotion</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {promotions.map((promotion) => (
          <article key={promotion.id} className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3edda] text-[#a2874c]"><Tag size={18} /></span>
              <button type="button" onClick={() => togglePromotion(promotion)} className={`rounded-full px-3 py-1.5 text-[9px] font-bold ${promotion.enabled ? "bg-[#eef2e7] text-[#61764a]" : "bg-[#f1eee8] text-[#8b887e]"}`}>{promotion.enabled ? "Live" : "Paused"}</button>
            </div>
            <h3 className="mt-5 text-sm font-extrabold">{promotion.title}</h3>
            {promotion.code && <p className="mt-2 w-fit rounded-md bg-[#f7f5ef] px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-[#7b6743]">{promotion.code}</p>}
            <p className="mt-3 text-xs leading-5 text-[#77756c]">{promotion.message}</p>
            <button type="button" onClick={() => deletePromotion(promotion)} className="mt-5 text-[10px] font-bold text-[#a44d36] hover:underline">Delete promotion</button>
          </article>
        ))}
        {promotions.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#dcd5c9] p-8 text-center sm:col-span-2 xl:col-span-3">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3edda] text-[#a2874c]"><Tag size={20} /></span>
            <p className="mt-3 text-xs font-bold">No promotions have been added.</p>
            <p className="mt-1 text-[10px] text-[#8b887e]">Create your first offer or campaign.</p>
          </div>
        )}
      </div>

      {dialogOpen && (
        <PromotionDialog
          setError={setError}
          onClose={() => setDialogOpen(false)}
          onCreated={async () => {
            setDialogOpen(false);
            await onCreated();
          }}
        />
      )}
    </>
  );
}
