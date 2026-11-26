"use client";

import { useState } from "react";
import { Layers3, Plus } from "lucide-react";
import CategoryDialog from "../dialogs/category-dialog";
import type { CategoryRecord, ProductRecord } from "../types";

type CategoriesSectionProps = {
  categories: CategoryRecord[];
  products: ProductRecord[];
  setCategories: React.Dispatch<React.SetStateAction<CategoryRecord[]>>;
  setError: (message: string) => void;
};

export default function CategoriesSection({ categories, products, setCategories, setError }: CategoriesSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">Organise your menu</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">Categories.</h2>
          <p className="mt-2 text-xs text-[#8b887e]">{categories.length} categories in your collection</p>
        </div>
        <button type="button" onClick={() => setDialogOpen(true)} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> Add a category</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.id} className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9e9dc] text-[#c76536]"><Layers3 size={18} /></span>
            </div>
            <h3 className="mt-5 text-sm font-extrabold">{category.name}</h3>
            <p className="mt-1 text-[10px] text-[#8b887e]">{category.slug}</p>
            <p className="mt-3 text-[10px] text-[#69665c]">{products.filter((product) => product.category === category.name).length} menu items</p>
          </article>
        ))}
        {categories.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#dcd5c9] p-8 text-center sm:col-span-2 xl:col-span-3">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f5efe4] text-[#b38762]"><Layers3 size={20} /></span>
            <p className="mt-3 text-xs font-bold">No categories yet.</p>
            <p className="mt-1 text-[10px] text-[#8b887e]">Add a category to start organising your menu.</p>
          </div>
        )}
      </div>

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
