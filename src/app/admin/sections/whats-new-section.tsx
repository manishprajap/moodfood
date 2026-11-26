"use client";

import { useCallback, useEffect, useState } from "react";
import { Clock3, Plus, Sparkles } from "lucide-react";
import WhatsNewDialog from "../dialogs/whats-new-dialog";
import type { WhatsNewRecord } from "../types";
import { requestJson } from "../utils";

type WhatsNewSectionProps = {
  setError: (message: string) => void;
};

const byNewest = (a: WhatsNewRecord, b: WhatsNewRecord) =>
  new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime() || b.id - a.id;

export default function WhatsNewSection({ setError }: WhatsNewSectionProps) {
  const [entries, setEntries] = useState<WhatsNewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  // This section loads its own data, so the CMS works independently of the main dashboard load.
  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await requestJson<{ entries: WhatsNewRecord[] }>("/api/admin/whats-new");
      setEntries(result.entries);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "What's New entries could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">Content</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">What’s new.</h2>
          <p className="mt-2 text-xs text-[#8b887e]">{entries.length} updates in your changelog</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={loadEntries} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#e1dccf] bg-white px-4 py-3 text-[10px] font-bold text-[#55534b] transition hover:border-[#d95720] disabled:opacity-60"><Clock3 size={13} /> {loading ? "Refreshing…" : "Refresh"}</button>
          <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> New update</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map((entry) => (
          <article key={entry.id} className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9e9dc] text-[#c76536]"><Sparkles size={18} /></span>
              <span className={`rounded-full px-3 py-1.5 text-[9px] font-bold ${entry.isPublished ? "bg-[#eef2e7] text-[#61764a]" : "bg-[#f1eee8] text-[#8b887e]"}`}>{entry.isPublished ? "Published" : "Draft"}</span>
            </div>
            <h3 className="mt-5 text-sm font-extrabold">{entry.title}</h3>
            <p className="mt-1 text-[10px] text-[#8b887e]">
              {entry.version && <span className="mr-2 rounded-md bg-[#f7f5ef] px-2 py-0.5 font-mono font-bold text-[#7b6743]">{entry.version}</span>}
              {new Date(entry.releasedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            <p className="mt-3 whitespace-pre-line text-xs leading-5 text-[#77756c]">{entry.description}</p>
          </article>
        ))}
        {entries.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#dcd5c9] p-8 text-center sm:col-span-2 xl:col-span-3">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f5efe4] text-[#b38762]"><Sparkles size={20} /></span>
            <p className="mt-3 text-xs font-bold">{loading ? "Loading updates…" : "No updates yet."}</p>
            {!loading && <p className="mt-1 text-[10px] text-[#8b887e]">Post your first update to start the changelog.</p>}
          </div>
        )}
      </div>

      {dialogOpen && (
        <WhatsNewDialog
          onClose={() => setDialogOpen(false)}
          onCreated={(entry) => {
            setEntries((current) => [entry, ...current].sort(byNewest));
            setDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
