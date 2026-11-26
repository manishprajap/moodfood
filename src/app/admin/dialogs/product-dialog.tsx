"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Check, CircleAlert, ImagePlus, X } from "lucide-react";
import {
  CUSTOM_OPTION,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  STATIC_CUISINE,
  blankNutrition,
  blankProduct,
} from "../constants";
import type { CategoryRecord, ProductFields, ProductRecord } from "../types";
import { Field, Toggle, inputClass } from "../ui";
import { makeSlug, requestJson } from "../utils";

type ProductDialogProps = {
  /** null = creating a new product */
  product: ProductRecord | null;
  categories: CategoryRecord[];
  badgeOptions: string[];
  error: string;
  setError: (message: string) => void;
  onClose: () => void;
  onSaved: (product: ProductRecord, isEdit: boolean) => void;
};

export default function ProductDialog({ product, categories, badgeOptions, error, setError, onClose, onSaved }: ProductDialogProps) {
  const [productForm, setProductForm] = useState<ProductFields>(() =>
    product
      ? {
          ...product,
          cuisine: STATIC_CUISINE,
          image: product.image ?? "",
          badge: product.badge ?? null,
          ingredients: product.ingredients ?? null,
        }
      : { ...blankProduct, category: categories[0]?.name ?? "", cuisine: STATIC_CUISINE },
  );
  const [nutritionDraft, setNutritionDraft] = useState(() =>
    product?.nutrition
      ? {
          caloriesKcal: String(product.nutrition.caloriesKcal),
          proteinGrams: String(product.nutrition.proteinGrams),
          carbohydratesGrams: String(product.nutrition.carbohydratesGrams),
          fatGrams: String(product.nutrition.fatGrams),
        }
      : blankNutrition,
  );
  const [savingProduct, setSavingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [badgeCustom, setBadgeCustom] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categoryOptions = useMemo(
    () => [...new Set([...categories.map((category) => category.name), productForm.category])].filter(Boolean),
    [categories, productForm.category],
  );

  async function uploadImage(file: File | undefined | null) {
    if (!file) return;
    setError("");
    if (!IMAGE_TYPES.includes(file.type)) {
      setError("Please choose a JPG, PNG or WebP image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("That image is larger than 5 MB. Please choose a smaller one.");
      return;
    }
    setUploadingImage(true);
    try {
      const body = new FormData();
      body.append("file", file);
      // Let the browser set the multipart boundary for FormData.
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        throw new Error(result.error || "The image could not be uploaded.");
      }
      setProductForm((current) => ({ ...current, image: result.url! }));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The image could not be uploaded.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProduct(true);
    setError("");
    const endpoint = product ? `/api/admin/products/${product.id}` : "/api/admin/products";
    const hasNutrition = Object.values(nutritionDraft).some((value) => value.trim() !== "");
    const hasCompleteNutrition = Object.values(nutritionDraft).every((value) => value.trim() !== "");
    if (hasNutrition && !hasCompleteNutrition) {
      setSavingProduct(false);
      setError("Enter all four verified nutrition values, or leave them all blank.");
      return;
    }
    const nutrition = hasNutrition
      ? {
          caloriesKcal: Number(nutritionDraft.caloriesKcal),
          proteinGrams: Number(nutritionDraft.proteinGrams),
          carbohydratesGrams: Number(nutritionDraft.carbohydratesGrams),
          fatGrams: Number(nutritionDraft.fatGrams),
        }
      : null;
    try {
      const saved = await requestJson<{ product: ProductRecord }>(endpoint, {
        method: product ? "PUT" : "POST",
        body: JSON.stringify({
          ...productForm,
          cuisine: STATIC_CUISINE,
          image: productForm.image,
          badge: productForm.badge?.trim() || null,
          nutrition,
        }),
      });
      onSaved(saved.product, Boolean(product));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The product could not be saved.");
    } finally {
      setSavingProduct(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#211f1a]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
      <form onSubmit={saveProduct} className="my-auto w-full max-w-[680px] rounded-[22px] bg-[#fffdf9] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#efebe3] px-5 py-4 sm:px-7">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0714f]">Your menu, your call</p>
            <h2 id="product-form-title" className="serif mt-1 text-2xl">{product ? "Edit this dish" : "Add a new dish"}</h2>
          </div>
          <button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]" aria-label="Close product form"><X size={16} /></button>
        </div>

        {error && (
          <div role="alert" className="mx-5 mt-4 flex items-start gap-2 rounded-xl border border-[#f1d5ca] bg-[#fbefeb] px-3.5 py-3 text-[11px] leading-5 text-[#99452c] sm:mx-7">
            <CircleAlert className="mt-0.5 shrink-0" size={14} />
            <span className="flex-1">{error}</span>
          </div>
        )}

        <div className="grid max-h-[68vh] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-7">
          <Field label="Product name"><input required minLength={2} value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value, slug: makeSlug(event.target.value) })} className={inputClass} placeholder="e.g. Haryali kebab" /></Field>
          <Field label="URL slug"><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })} className={inputClass} placeholder="haryali-kebab" /></Field>

          <Field label="Category">
            <select required value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className={inputClass}>
              <option value="" disabled>{categories.length ? "Select a category" : "Add a category first"}</option>
              {categoryOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </Field>

          <Field label="Cuisine">
            <select value={STATIC_CUISINE} disabled className={inputClass}>
              <option value="Awadhi">Awadhi</option>
            </select>
            <p className="text-[10px] text-[#8b887e]">Cuisine is fixed to Awadhi.</p>
          </Field>

          <Field label="Price (INR)"><input type="number" min="1" step="1" required value={productForm.price || ""} onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })} className={inputClass} placeholder="325" /></Field>
          <Field label="Pack size"><input required value={productForm.pack} onChange={(event) => setProductForm({ ...productForm, pack: event.target.value })} className={inputClass} placeholder="500 g" /></Field>
          <Field label="Pack weight (grams)"><input type="number" min="1" step="1" required value={productForm.weightGrams} onChange={(event) => setProductForm({ ...productForm, weightGrams: Number(event.target.value) })} className={inputClass} placeholder="500" /></Field>

          <Field label="Menu badge (optional)">
            <>
              <select
                value={badgeCustom ? CUSTOM_OPTION : productForm.badge ?? ""}
                onChange={(event) => {
                  if (event.target.value === CUSTOM_OPTION) {
                    setBadgeCustom(true);
                    setProductForm({ ...productForm, badge: null });
                  } else {
                    setBadgeCustom(false);
                    setProductForm({ ...productForm, badge: event.target.value || null });
                  }
                }}
                className={inputClass}
              >
                <option value="">No badge</option>
                {badgeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                <option value={CUSTOM_OPTION}>+ Custom badge…</option>
              </select>
              {badgeCustom && (
                <input autoFocus maxLength={24} value={productForm.badge ?? ""} onChange={(event) => setProductForm({ ...productForm, badge: event.target.value || null })} className={inputClass} placeholder="e.g. Festival special" />
              )}
            </>
          </Field>

          <div className="sm:col-span-2">
            <p className="mb-2 text-[10px] font-bold text-[#545147]">Product image</p>
            <div
              onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(event) => { event.preventDefault(); setDragActive(false); void uploadImage(event.dataTransfer.files?.[0]); }}
              className={`relative flex min-h-[170px] flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed bg-[#faf8f3] p-4 transition ${dragActive ? "border-[#d95720] bg-orange-50" : "border-[#e3dccf]"}`}
            >
              {productForm.image && (
                <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: `url('${productForm.image.replace(/'/g, "%27")}')` }} aria-hidden="true" />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                className={`relative z-10 inline-flex flex-col items-center gap-1.5 rounded-xl px-4 py-3 text-center text-[10px] font-bold transition disabled:opacity-70 ${productForm.image ? "bg-white/90 text-[#38372f] shadow hover:bg-white" : "text-[#8b887e] hover:text-[#d95720]"}`}
              >
                <ImagePlus size={24} />
                {uploadingImage ? "Uploading…" : productForm.image ? "Replace image" : "Click or drop an image here"}
                {!productForm.image && !uploadingImage && <span className="font-normal text-[9px]">JPG, PNG or WebP · up to 5 MB</span>}
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" tabIndex={-1} onChange={(event) => void uploadImage(event.target.files?.[0])} />
              {productForm.image && !uploadingImage && (
                <button type="button" onClick={() => setProductForm((current) => ({ ...current, image: "" }))} className="relative z-10 mt-2 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-bold text-[#a44d36] shadow hover:bg-white">Remove image</button>
              )}
            </div>
            {productForm.image && (
              <div className="mt-3 overflow-hidden rounded-xl border border-[#e3dccf] bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={productForm.image} alt="Product preview" className="max-h-48 w-full object-contain" />
              </div>
            )}
            <p className="mt-2 text-[10px] leading-4 text-[#8b887e]">Choose a photo from your device or drag and drop it. The image uploads automatically. No image URL field.</p>
          </div>

          <Field label="Short description" full><textarea rows={2} required value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} className={`${inputClass} resize-y`} placeholder="Tell people what makes it lovely." /></Field>
          <Field label="Ingredients (optional)" full><textarea rows={2} value={productForm.ingredients ?? ""} onChange={(event) => setProductForm({ ...productForm, ingredients: event.target.value || null })} className={`${inputClass} resize-y`} placeholder="Add approved ingredient details." /></Field>

          <p className="text-[10px] font-bold text-[#545147] sm:col-span-2">Verified nutrition values per pack (optional)</p>
          <Field label="Calories (kcal)"><input type="number" min="0" step="0.1" value={nutritionDraft.caloriesKcal} onChange={(event) => setNutritionDraft({ ...nutritionDraft, caloriesKcal: event.target.value })} className={inputClass} placeholder="Leave blank until verified" /></Field>
          <Field label="Protein (g)"><input type="number" min="0" step="0.1" value={nutritionDraft.proteinGrams} onChange={(event) => setNutritionDraft({ ...nutritionDraft, proteinGrams: event.target.value })} className={inputClass} placeholder="—" /></Field>
          <Field label="Carbohydrates (g)"><input type="number" min="0" step="0.1" value={nutritionDraft.carbohydratesGrams} onChange={(event) => setNutritionDraft({ ...nutritionDraft, carbohydratesGrams: event.target.value })} className={inputClass} placeholder="—" /></Field>
          <Field label="Fat (g)"><input type="number" min="0" step="0.1" value={nutritionDraft.fatGrams} onChange={(event) => setNutritionDraft({ ...nutritionDraft, fatGrams: event.target.value })} className={inputClass} placeholder="—" /></Field>

          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Toggle checked={productForm.vegetarian} onChange={(vegetarian) => setProductForm({ ...productForm, vegetarian })} label="Vegetarian" />
            <Toggle checked={productForm.frozen} onChange={(frozen) => setProductForm({ ...productForm, frozen })} label="Frozen" />
            <Toggle checked={productForm.isActive} onChange={(isActive) => setProductForm({ ...productForm, isActive })} label="Visible on menu" />
          </div>
          <p className="text-[10px] leading-4 text-[#8b887e] sm:col-span-2">Use approved packaging values only. Enter all four nutrition values together or leave them blank.</p>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#efebe3] px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2.5 text-[10px] font-bold text-[#706d63] hover:bg-[#f7f5ef]">Cancel</button>
          <button disabled={savingProduct || uploadingImage} type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-5 py-2.5 text-[10px] font-extrabold text-white hover:bg-[#c94b18] disabled:opacity-60">
            {savingProduct ? "Saving…" : uploadingImage ? "Uploading image…" : <><Check size={13} /> Save product</>}
          </button>
        </div>
      </form>
    </div>
  );
}
