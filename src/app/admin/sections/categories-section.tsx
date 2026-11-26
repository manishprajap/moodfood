"use client";

import { useMemo, useState } from "react";
import { Layers3, Plus, Search } from "lucide-react";
import CategoryDialog from "../dialogs/category-dialog";
import { ROWS_PER_PAGE } from "../constants";
import type { CategoryRecord, ProductRecord } from "../types";

type CategoriesSectionProps = {
  categories: CategoryRecord[];
  products: ProductRecord[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryRecord[]>>;
  setError: (message: string) => void;
};

const GRID = "md:grid-cols-[minmax(220px,1.4fr)_1fr_0.6fr_0.5fr]";

export default function CategoriesSection({ categories, products, setCategories, setError }: CategoriesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return categories.filter(
      (category) => !term || category.name.toLowerCase().includes(term) || category.slug.toLowerCase().includes(term),
    );
  }, [categories, search]);

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
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">Organise your menu</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">Categories.</h2>
          <p className="mt-2 text-sm text-[#8b887e]">{categories.length} categories in your collection</p>
        </div>
        <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[12px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> Add a category</button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-[#e5e0d6] bg-white px-3.5 py-2.5 text-[#8b887e] sm:w-[320px]">
          <Search size={15} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="w-full bg-transparent text-sm text-[#333229] outline-none" placeholder="Search categories" />
        </label>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e4da] bg-[#fffdf9]">
        <div className={`hidden gap-3 border-b border-[#efebe3] bg-[#faf8f3] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#979387] md:grid ${GRID}`}>
          <span>Category</span><span>Slug</span><span>Menu items</span><span>Status</span>
        </div>
        {rows.map((category) => (
          <div key={category.id} className={`grid gap-3 border-b border-[#f0ece4] px-4 py-4 last:border-b-0 sm:px-5 md:items-center ${GRID}`}>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f9e9dc] text-[#c76536]"><Layers3 size={18} /></span>
              <p className="truncate text-sm font-bold">{category.name}</p>
            </div>
            <span className="truncate text-[12px] text-[#69665c]">{category.slug}</span>
            <span className="text-[12px] text-[#69665c]">{products.filter((product) => product.category === category.name).length} menu items</span>
            <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${category.isActive ? "bg-[#eef2e7] text-[#61764a]" : "bg-[#f1eee8] text-[#8b887e]"}`}>{category.isActive ? "Live" : "Hidden"}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-14 text-center text-sm text-[#8b887e]">
            {categories.length ? "No categories match your search." : "No categories yet. Add a category to start organising your menu."}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e8e4da] bg-[#fffdf9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#8b887e]">
            Showing <span className="font-bold text-[#333229]">{rangeStart}–{rangeEnd}</span> of <span className="font-bold text-[#333229]">{filtered.length}</span> categories
          </p>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-sm font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="min-w-[90px] text-center text-sm font-semibold text-[#69665c]">Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-sm font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {dialogOpen && (
        <CategoryDialog
          setError={setError}
          onClose={() => setDialogOpen(false)}
          onCreated={(category) => {
            setCategories((current) => [...current, category].sort((a, b) => a.name.localeCompare(b.name)));
            setDialogOpen(false);
          }}
        />
      )}
    </>
  );
}
