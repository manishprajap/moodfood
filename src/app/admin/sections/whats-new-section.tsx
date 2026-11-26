"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock3, Plus, Search, Sparkles } from "lucide-react";
import WhatsNewDialog from "../dialogs/whats-new-dialog";
import { ROWS_PER_PAGE } from "../constants";
import type { WhatsNewRecord } from "../types";
import { requestJson } from "../utils";

type WhatsNewSectionProps = {
  setError: (message: string) => void;
};

const GRID = "md:grid-cols-[minmax(200px,1fr)_minmax(240px,1.6fr)_0.5fr_0.5fr]";

const byNewest = (a: WhatsNewRecord, b: WhatsNewRecord) =>
  new Date(b.releasedAt).getTime() - new Date(a.releasedAt).getTime() || b.id - a.id;

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function WhatsNewSection({ setError }: WhatsNewSectionProps) {
  const [entries, setEntries] = useState<WhatsNewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return entries.filter(
      (entry) =>
        !term ||
        entry.title.toLowerCase().includes(term) ||
        entry.description.toLowerCase().includes(term) ||
        (entry.version ?? "").toLowerCase().includes(term),
    );
  }, [entries, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const rows = useMemo(
    () => filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE),
    [filtered, currentPage],
  );
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentPage * ROWS_PER_PAGE, filtered.length);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">Content</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">What’s new.</h2>
          <p className="mt-2 text-xs text-[#8b887e]">{entries.length} updates in your changelog</p>
        </div>
        <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> New update</button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-[#e5e0d6] bg-white px-3.5 py-2.5 text-[#8b887e] sm:w-[320px]">
          <Search size={15} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="w-full bg-transparent text-xs text-[#333229] outline-none" placeholder="Search title, version or description" />
        </label>
        <button type="button" onClick={loadEntries} disabled={loading} className="inline-flex items-center gap-2 rounded-lg border border-[#e5e0d6] bg-white px-3 py-2 text-[10px] font-bold text-[#69665c] disabled:opacity-60"><Clock3 size={12} /> {loading ? "Refreshing…" : "Refresh list"}</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e4da] bg-[#fffdf9]">
        <div className={`hidden gap-3 border-b border-[#efebe3] bg-[#faf8f3] px-5 py-3 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#979387] md:grid ${GRID}`}>
          <span>Update</span><span>Description</span><span>Released</span><span>Status</span>
        </div>
        {rows.map((entry) => (
          <div key={entry.id} className={`grid gap-3 border-b border-[#f0ece4] px-4 py-4 last:border-b-0 sm:px-5 md:items-center ${GRID}`}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f9e9dc] text-[#c76536]"><Sparkles size={18} /></span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{entry.title}</p>
                {entry.version && <span className="mt-1 inline-block rounded-md bg-[#f7f5ef] px-2 py-0.5 font-mono text-[9px] font-bold text-[#7b6743]">{entry.version}</span>}
              </div>
            </div>
            <p className="line-clamp-2 text-[10px] leading-4 text-[#69665c]" title={entry.description}>{entry.description}</p>
            <span className="text-[10px] text-[#69665c]">{formatDate(entry.releasedAt)}</span>
            <span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-bold ${entry.isPublished ? "bg-[#eef2e7] text-[#61764a]" : "bg-[#f1eee8] text-[#8b887e]"}`}>{entry.isPublished ? "Published" : "Draft"}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-14 text-center text-xs text-[#8b887e]">
            {loading ? "Loading updates…" : entries.length ? "No updates match your search." : "No updates yet. Post your first update to start the changelog."}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e8e4da] bg-[#fffdf9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#8b887e]">
            Showing <span className="font-bold text-[#333229]">{rangeStart}–{rangeEnd}</span> of <span className="font-bold text-[#333229]">{filtered.length}</span> updates
          </p>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-xs font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="min-w-[90px] text-center text-xs font-semibold text-[#69665c]">Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-xs font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

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
