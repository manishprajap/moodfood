"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CookingPot, Plus, Search } from "lucide-react";
import ProductDialog from "../dialogs/product-dialog";

import type { CategoryRecord, ProductRecord } from "../types";
import { money, requestJson } from "../utils";
import { PRODUCTS_PER_PAGE, suggestedBadges } from "../constants";

type ProductsSectionProps = {
  products: ProductRecord[];
  categories: CategoryRecord[];
  loading: boolean;
  error: string;
  setProducts: React.Dispatch<React.SetStateAction<ProductRecord[]>>;
  setError: (message: string) => void;
  onRefresh: () => void;
  /** When true, the "new product" dialog opens immediately (used by the Overview shortcut). */
  startNew: boolean;
  onStartNewHandled: () => void;
};

type DialogState = { product: ProductRecord | null } | null;

export default function ProductsSection({ products, categories, loading, error, setProducts, setError, onRefresh, startNew, onStartNewHandled }: ProductsSectionProps) {
  const [search, setSearch] = useState("");
  const [productPage, setProductPage] = useState(1);
  const [dialog, setDialog] = useState<DialogState>(null);

  const handleStartNew = useCallback(onStartNewHandled, [onStartNewHandled]);
  useEffect(() => {
    if (startNew) {
      setDialog({ product: null });
      handleStartNew();
    }
  }, [startNew, handleStartNew]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      (product) =>
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        (product.cuisine ?? "").toLowerCase().includes(term),
    );
  }, [products, search]);

  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const currentProductPage = Math.min(productPage, totalProductPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentProductPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, currentProductPage]);
  const rangeStart = filteredProducts.length === 0 ? 0 : (currentProductPage - 1) * PRODUCTS_PER_PAGE + 1;
  const rangeEnd = Math.min(currentProductPage * PRODUCTS_PER_PAGE, filteredProducts.length);

  // Badge options: suggested ones plus every badge already used in the database.
  const badgeOptions = useMemo(
    () => [
      ...new Set([
        ...suggestedBadges,
        ...products.map((product) => product.badge?.trim()).filter((value): value is string => Boolean(value)),
      ]),
    ],
    [products],
  );

  async function deleteProduct(product: ProductRecord) {
    if (!window.confirm(`Permanently delete ${product.name}?`)) return;
    try {
      await requestJson(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((entry) => entry.id !== product.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The product could not be deleted.");
    }
  }

  function handleSaved(saved: ProductRecord, isEdit: boolean) {
    setProducts((current) =>
      isEdit ? current.map((product) => (product.id === saved.id ? saved : product)) : [...current, saved],
    );
    setDialog(null);
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">What’s cooking?</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">The menu, your way.</h2>
          <p className="mt-2 text-xs text-[#8b887e]">{products.length} items in your collection</p>
        </div>
        <button type="button" onClick={() => setDialog({ product: null })} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> Add a product</button>
      </div>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-[#e5e0d6] bg-white px-3.5 py-2.5 text-[#8b887e] sm:w-[320px]">
          <Search size={15} />
          <input value={search} onChange={(event) => { setSearch(event.target.value); setProductPage(1); }} className="w-full bg-transparent text-xs text-[#333229] outline-none" placeholder="Search products or categories" />
        </label>
        <button type="button" onClick={onRefresh} className="rounded-lg border border-[#e5e0d6] bg-white px-3 py-2 text-[10px] font-bold text-[#69665c]">Refresh list</button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#e8e4da] bg-[#fffdf9]">
        <div className="hidden grid-cols-[minmax(220px,1.3fr)_0.75fr_0.65fr_0.6fr_0.55fr_90px] gap-3 border-b border-[#efebe3] bg-[#faf8f3] px-5 py-3 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#979387] md:grid"><span>Product</span><span>Category</span><span>Cuisine</span><span>Price</span><span>Visibility</span><span /></div>
        {paginatedProducts.map((product) => (
          <div key={product.id} className="grid gap-3 border-b border-[#f0ece4] px-4 py-4 last:border-b-0 sm:px-5 md:grid-cols-[minmax(220px,1.3fr)_0.75fr_0.65fr_0.6fr_0.55fr_90px] md:items-center">
            <div className="flex items-center gap-3">
              <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-[#f5efe4] text-[#b38762]">
                {product.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <CookingPot size={18} />
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold">{product.name}{product.badge && <span className="ml-2 rounded-full bg-[#f8ede5] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wide text-[#c94b18]">{product.badge}</span>}</p>
                <p className="mt-1 truncate text-[9px] text-[#8b887e]">{product.pack} · {product.vegetarian ? "Vegetarian" : "Non-vegetarian"}{product.frozen ? " · Frozen" : ""}</p>
              </div>
            </div>
            <span className="text-[10px] text-[#69665c]">{product.category}</span>
            <span className="text-[10px] text-[#69665c]">{product.cuisine}</span>
            <span className="text-xs font-bold">{money(Number(product.price))}</span>
            <span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-bold ${product.isActive ? "bg-[#eef2e7] text-[#61764a]" : "bg-[#f1eee8] text-[#8b887e]"}`}>{product.isActive ? "Live" : "Hidden"}</span>
            <div className="flex gap-2 md:justify-end">
              <button type="button" onClick={() => setDialog({ product })} className="rounded-lg border border-[#e6e1d7] px-3 py-2 text-[9px] font-bold text-[#68665d] hover:border-[#d95720] hover:text-[#d95720]">Edit</button>
              <button type="button" onClick={() => deleteProduct(product)} className="rounded-lg border border-[#eee1db] px-2.5 py-2 text-[9px] font-bold text-[#a44d36] hover:bg-[#fbefeb]">Delete</button>
            </div>
          </div>
        ))}
        {filteredProducts.length === 0 && <div className="px-5 py-14 text-center text-xs text-[#8b887e]">{loading ? "Loading your products…" : products.length ? "No products match your search." : "No menu items yet. Add your first product to get started."}</div>}
      </div>

      {filteredProducts.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-[#e8e4da] bg-[#fffdf9] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-[#8b887e]">
            Showing <span className="font-bold text-[#333229]">{rangeStart}–{rangeEnd}</span> of <span className="font-bold text-[#333229]">{filteredProducts.length}</span> products
          </p>
          <div className="flex items-center justify-between gap-2 sm:justify-end">
            <button type="button" onClick={() => setProductPage((page) => Math.max(1, page - 1))} disabled={currentProductPage <= 1} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-xs font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
            <span className="min-w-[90px] text-center text-xs font-semibold text-[#69665c]">Page {currentProductPage} of {totalProductPages}</span>
            <button type="button" onClick={() => setProductPage((page) => Math.min(totalProductPages, page + 1))} disabled={currentProductPage >= totalProductPages} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-xs font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
          </div>
        </div>
      )}

      {dialog && (
        <ProductDialog
          key={dialog.product?.id ?? "new"}
          product={dialog.product}
          categories={categories}
          badgeOptions={badgeOptions}
          error={error}
          setError={setError}
          onClose={() => setDialog(null)}
          onSaved={handleSaved}
        />
      )}
    </>
  );
}
