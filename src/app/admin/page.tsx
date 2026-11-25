"use client";

import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleAlert,
  Clock3,
  CookingPot,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Plus,
  Search,
  Settings2,
  Tag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/catalog";

type ProductFields = {
  name: string;
  slug: string;
  category: string;
  cuisine: string;
  description: string;
  price: number;
  pack: string;
  weightGrams: number;
  vegetarian: boolean;
  frozen: boolean;
  badge: string | null;
  image: string;
  ingredients: string | null;
  isActive: boolean;
};

type ProductRecord = ProductFields & Pick<Product, "nutrition"> & { id: string };
type OrderRecord = {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  deliveryAddress: string;
  requestedDeliveryAt: string;
  total: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  items: { productName: string; quantity: number }[];
};
type PromotionRecord = {
  id: string;
  title: string;
  code: string | null;
  message: string;
  enabled: boolean;
};
type Section = "Overview" | "Products" | "Orders" | "Promotions";
type RequestResult<T> = T & { error?: string };

const blankProduct: ProductFields = {
  name: "",
  slug: "",
  category: "Kebabs",
  cuisine: "House special",
  description: "",
  price: 0,
  pack: "500 g",
  weightGrams: 500,
  vegetarian: true,
  frozen: false,
  badge: null,
  image: "",
  ingredients: null,
  isActive: true,
};
const blankNutrition = {
  caloriesKcal: "",
  proteinGrams: "",
  carbohydratesGrams: "",
  fatGrams: "",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

async function requestJson<T>(url: string, init?: RequestInit): Promise<RequestResult<T>> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const result = (await response.json()) as RequestResult<T>;
  if (!response.ok) throw new Error(result.error || "Something went wrong. Please try again.");
  return result;
}

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [section, setSection] = useState<Section>("Overview");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [promotions, setPromotions] = useState<PromotionRecord[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [productForm, setProductForm] = useState<ProductFields>(blankProduct);
  const [nutritionDraft, setNutritionDraft] = useState(blankNutrition);
  const [savingProduct, setSavingProduct] = useState(false);
  const [promotionDialog, setPromotionDialog] = useState(false);
  const [promotionForm, setPromotionForm] = useState({ title: "", code: "", message: "" });
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const loadAdminData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [productResult, orderResult, promotionResult] = await Promise.all([
        requestJson<{ products: ProductRecord[] }>("/api/admin/products"),
        requestJson<{ orders: OrderRecord[] }>("/api/admin/orders"),
        requestJson<{ promotions: PromotionRecord[] }>("/api/admin/promotions"),
      ]);
      setProducts(productResult.products);
      setOrders(orderResult.orders);
      setPromotions(promotionResult.promotions);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "The admin data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/session")
      .then(async (response) => {
        const result = (await response.json()) as { authenticated: boolean };
        if (active) setAuthenticated(result.authenticated);
        if (result.authenticated && active) await loadAdminData();
      })
      .catch(() => {
        if (active) {
          setAuthenticated(false);
          setError("Could not reach the admin service.");
        }
      });
    return () => {
      active = false;
    };
  }, [loadAdminData]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter(
      (product) =>
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term),
    );
  }, [products, search]);

  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const livePromotions = promotions.filter((promotion) => promotion.enabled).length;
  const totalOrderValue = orders.reduce((sum, order) => sum + Number(order.total), 0);

  async function signIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setAuthenticated(true);
      setPassword("");
      await loadAdminData();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthenticated(false);
    setProducts([]);
    setOrders([]);
    setPromotions([]);
    setSection("Overview");
  }

  function openNewProduct() {
    setEditingProduct(null);
    setProductForm(blankProduct);
    setNutritionDraft(blankNutrition);
    setProductDialog(true);
  }

  function openEditProduct(product: ProductRecord) {
    setEditingProduct(product);
    setProductForm({
      ...product,
      badge: product.badge ?? null,
      ingredients: product.ingredients ?? null,
    });
    setNutritionDraft(
      product.nutrition
        ? {
            caloriesKcal: String(product.nutrition.caloriesKcal),
            proteinGrams: String(product.nutrition.proteinGrams),
            carbohydratesGrams: String(product.nutrition.carbohydratesGrams),
            fatGrams: String(product.nutrition.fatGrams),
          }
        : blankNutrition,
    );
    setProductDialog(true);
  }

  async function saveProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProduct(true);
    setError("");
    const endpoint = editingProduct
      ? `/api/admin/products/${editingProduct.id}`
      : "/api/admin/products";
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
        method: editingProduct ? "PUT" : "POST",
        body: JSON.stringify({ ...productForm, nutrition }),
      });
      if (editingProduct) {
        setProducts((current) =>
          current.map((product) =>
            product.id === editingProduct.id ? saved.product : product,
          ),
        );
      } else {
        setProducts((current) => [...current, saved.product]);
      }
      setProductDialog(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "The product could not be saved.");
    } finally {
      setSavingProduct(false);
    }
  }

  async function deleteProduct(product: ProductRecord) {
    if (!window.confirm(`Permanently delete ${product.name}?`)) return;
    try {
      await requestJson(`/api/admin/products/${product.id}`, { method: "DELETE" });
      setProducts((current) => current.filter((entry) => entry.id !== product.id));
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "The product could not be deleted.");
    }
  }

  async function changeOrderStatus(order: OrderRecord, status: string) {
    setError("");
    try {
      await requestJson(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((current) =>
        current.map((entry) => (entry.id === order.id ? { ...entry, status } : entry)),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Order status could not be updated.");
    }
  }

  async function changeOrderPaymentStatus(order: OrderRecord, paymentStatus: string) {
    setError("");
    try {
      await requestJson(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: order.status, paymentStatus }),
      });
      setOrders((current) =>
        current.map((entry) =>
          entry.id === order.id ? { ...entry, paymentStatus } : entry,
        ),
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Payment status could not be updated.");
    }
  }

  async function addPromotion(event: React.FormEvent<HTMLFormElement>) {
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
      setPromotionDialog(false);
      setPromotionForm({ title: "", code: "", message: "" });
      await loadAdminData();
    } catch (promotionError) {
      setError(promotionError instanceof Error ? promotionError.message : "Promotion could not be saved.");
    }
  }

  async function togglePromotion(promotion: PromotionRecord) {
    try {
      await requestJson(`/api/admin/promotions/${promotion.id}`, {
        method: "PATCH",
        body: JSON.stringify({ enabled: !promotion.enabled }),
      });
      setPromotions((current) =>
        current.map((entry) =>
          entry.id === promotion.id ? { ...entry, enabled: !entry.enabled } : entry,
        ),
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

  if (authenticated === null) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f5ef] text-sm text-[#747166]">
        <p>Opening your workspace…</p>
      </main>
    );
  }

  if (!authenticated) {
    return (
      <main className="grid min-h-screen bg-[#f7f5ef] lg:grid-cols-[1fr_0.85fr]">
        <section className="relative hidden overflow-hidden bg-[#27271f] p-12 text-white lg:flex lg:flex-col lg:justify-between xl:p-16">
          <Link href="/" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-[#f0dfab] text-xl text-[#d95720]">♨</span>
            <span className="text-xl font-extrabold tracking-[-0.06em] text-[#ef7846]">Mood Food</span>
          </Link>
          <div className="relative z-10 max-w-xl">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef9a64]">The kitchen, behind the scenes</p>
            <h1 className="serif text-6xl leading-[1.04]">Good food<br />starts with<br /><span className="italic text-[#ef9a64]">good people.</span></h1>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/60">Your calm, considered space to look after the things that make Mood Food what it is.</p>
          </div>
          <p className="text-[10px] text-white/40">Mood Food · Admin workspace</p>
          <span className="absolute -bottom-28 -right-20 h-96 w-96 rounded-full border border-white/10" />
          <span className="absolute -bottom-16 -right-8 h-72 w-72 rounded-full border border-white/10" />
        </section>
        <section className="grid place-items-center px-5 py-12">
          <div className="w-full max-w-[390px]">
            <Link href="/" className="mb-12 inline-flex items-center gap-2 text-xs font-bold text-[#757166] transition hover:text-[#d95720] lg:hidden"><ArrowLeft size={14} /> Back to Mood Food</Link>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#d95720]">Admin sign in</p>
            <h2 className="serif mt-3 text-4xl">Welcome back.</h2>
            <p className="mt-3 text-sm leading-6 text-[#77756c]">Sign in to manage the menu, orders and promotions.</p>
            <form onSubmit={signIn} className="mt-8 grid gap-4">
              <label className="grid gap-2 text-xs font-bold text-[#414037]">Email address
                <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-xl border border-[#e1dacd] bg-white px-4 py-3.5 text-sm font-normal outline-none transition focus:border-[#d95720]" placeholder="you@moodfood.in" />
              </label>
              <label className="grid gap-2 text-xs font-bold text-[#414037]">Password
                <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-xl border border-[#e1dacd] bg-white px-4 py-3.5 text-sm font-normal outline-none transition focus:border-[#d95720]" placeholder="Your password" />
              </label>
              {error && <p role="alert" className="rounded-xl bg-[#f8e6e1] px-4 py-3 text-xs leading-5 text-[#a64129]">{error}</p>}
              <button type="submit" disabled={loading} className="mt-1 flex items-center justify-center gap-2 rounded-full bg-[#e95e25] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#c94b18] disabled:opacity-60">{loading ? "Signing in…" : "Sign in to your workspace"} <ArrowUpRight size={14} /></button>
            </form>
            <p className="mt-5 text-[10px] leading-5 text-[#8b887e]">Set ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_SESSION_SECRET in your environment to enable access.</p>
            {error && <p className="sr-only" aria-live="polite">{error}</p>}
          </div>
        </section>
      </main>
    );
  }

  const navItems: { name: Section; icon: typeof LayoutDashboard }[] = [
    { name: "Overview", icon: LayoutDashboard },
    { name: "Products", icon: UtensilsCrossed },
    { name: "Orders", icon: PackageCheck },
    { name: "Promotions", icon: Tag },
  ];

  return (
    <main className="min-h-screen bg-[#f7f5ef] text-[#28271f]">
      {mobileSidebar && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileSidebar(false)} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[#e8e4da] bg-[#fffdf9] transition-transform lg:translate-x-0 ${mobileSidebar ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-[#efebe3] px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f1eab5] text-lg text-[#c95220]">♨</span>
            <span><span className="block text-[17px] font-extrabold tracking-[-0.07em] text-[#d95720]">Mood Food</span><span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.16em] text-[#858176]">Kitchen dashboard</span></span>
          </Link>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg lg:hidden" onClick={() => setMobileSidebar(false)} aria-label="Close sidebar"><X size={17} /></button>
        </div>
        <div className="px-4 pt-7">
          <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#a29e92]">Workspace</p>
          <nav className="mt-3 grid gap-1">
            {navItems.map(({ name, icon: Icon }) => (
              <button type="button" key={name} onClick={() => { setSection(name); setMobileSidebar(false); }} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${section === name ? "bg-[#f8ede5] text-[#c94b18]" : "text-[#77756c] hover:bg-[#f7f5ef] hover:text-[#333229]"}`}>
                <Icon size={16} strokeWidth={1.8} /> {name}
                {name === "Orders" && pendingOrders > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#e95e25] px-1 text-[9px] font-bold text-white">{pendingOrders}</span>}
              </button>
            ))}
          </nav>
          <p className="mb-2 mt-9 px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#a29e92]">Shortcuts</p>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-[#77756c] transition hover:bg-[#f7f5ef] hover:text-[#333229]"><ArrowUpRight size={16} /> View storefront</Link>
        </div>
        <div className="mt-auto border-t border-[#efebe3] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#f7f5ef] p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e1d1] text-xs font-extrabold text-[#706747]">MF</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">Mood Food team</span><span className="mt-1 block text-[9px] text-[#918d82]">Administrator</span></span>
            <button type="button" onClick={signOut} title="Sign out" className="grid h-8 w-8 place-items-center rounded-lg text-[#858176] hover:bg-white hover:text-[#c94b18]"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      <div className="min-h-screen lg:pl-[250px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e8e4da] bg-[#f7f5ef]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMobileSidebar(true)} className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1dccf] bg-white lg:hidden" aria-label="Open navigation"><Menu size={17} /></button>
            <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#a19d91]">Mood Food / {section}</p><h1 className="mt-0.5 text-sm font-extrabold">{section}</h1></div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden items-center gap-2 rounded-full border border-[#dfe5d4] bg-[#f4f6ed] px-3 py-2 text-[10px] font-bold text-[#647448] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#7d9655]" /> Admin workspace</span>
            <Link href="/" className="grid h-9 w-9 place-items-center rounded-full border border-[#e1dccf] bg-white text-[#77756c] transition hover:text-[#d95720]" title="Open storefront"><ArrowUpRight size={15} /></Link>
          </div>
        </header>

        <div className="mx-auto max-w-[1400px] px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          {error && (
            <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-[#f1d5ca] bg-[#fbefeb] px-4 py-3.5 text-xs leading-5 text-[#99452c]">
              <CircleAlert className="mt-0.5 shrink-0" size={15} />
              <span className="flex-1">{error}</span>
              <button type="button" onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button>
            </div>
          )}

          {section === "Overview" && (
            <>
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">Here’s your kitchen at a glance</p><h2 className="serif mt-2 text-3xl sm:text-4xl">A good day to make something delicious.</h2><p className="mt-2 text-xs text-[#8b887e]">A little snapshot of what’s happening today.</p></div>
                <button type="button" onClick={loadAdminData} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#e1dccf] bg-white px-4 py-2.5 text-[10px] font-bold text-[#55534b] transition hover:border-[#d95720] disabled:opacity-60"><Clock3 size={13} /> {loading ? "Refreshing…" : "Refresh"}</button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Menu items", value: products.length, note: `${products.filter((product) => product.isActive).length} currently visible`, icon: CookingPot, color: "bg-[#f9e9dc] text-[#c76536]" },
                  { label: "Orders to confirm", value: pendingOrders, note: "Waiting for a little love", icon: PackageCheck, color: "bg-[#eaf0e2] text-[#71834f]" },
                  { label: "Total orders", value: orders.length, note: `${money(totalOrderValue)} order value`, icon: BarChart3, color: "bg-[#e6eef0] text-[#52798b]" },
                  { label: "Live promotions", value: livePromotions, note: "Campaigns currently running", icon: Tag, color: "bg-[#f3edda] text-[#9c8247]" },
                ].map(({ label, value, note, icon: Icon, color }) => (
                  <div key={label} className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-4 sm:p-5">
                    <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#77756c]">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}><Icon size={17} /></span></div>
                    <p className="mt-5 text-3xl font-extrabold tracking-[-0.05em]">{value}</p><p className="mt-1 text-[10px] text-[#8b887e]">{note}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
                <section className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-5 sm:p-6">
                  <div className="flex items-center justify-between"><div><h3 className="text-sm font-extrabold">Recent orders</h3><p className="mt-1 text-[10px] text-[#8b887e]">Keep the good things moving.</p></div><button type="button" onClick={() => setSection("Orders")} className="text-[10px] font-bold text-[#bc5830] hover:underline">See orders</button></div>
                  {orders.length === 0 ? <div className="grid min-h-[170px] place-items-center text-center"><div><span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f5efe4] text-[#b38762]"><PackageCheck size={18} /></span><p className="mt-3 text-xs font-bold">Your first order will show up here.</p><p className="mt-1 text-[10px] text-[#8b887e]">Orders appear after checkout is connected.</p></div></div> : <div className="mt-5 divide-y divide-[#f0ece4]">{orders.slice(0, 5).map((order) => <div key={order.id} className="flex items-center justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate text-xs font-bold">{order.customerName} <span className="font-normal text-[#8b887e]">· #{order.orderNumber}</span></p><p className="mt-1 text-[10px] text-[#8b887e]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p></div><div className="text-right"><p className="text-xs font-bold">{money(Number(order.total))}</p><p className="mt-1 text-[9px] capitalize text-[#8b887e]">{statusLabels[order.status] ?? order.status.replaceAll("_", " ")}</p></div></div>)}</div>}
                </section>
                <section className="rounded-2xl bg-[#292821] p-5 text-white sm:p-6">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#f3a277]"><Settings2 size={18} /></span>
                  <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.18em] text-[#f3a277]">Quick start</p><h3 className="serif mt-2 text-2xl">Make the menu yours.</h3><p className="mt-2 text-xs leading-5 text-white/60">Add a dish, update a price, or tell your customers about what’s new.</p>
                  <button type="button" onClick={() => { setSection("Products"); openNewProduct(); }} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ef9a64] px-4 py-2.5 text-[10px] font-extrabold text-[#292821] transition hover:bg-[#ffc08d]"><Plus size={14} /> Add a menu item</button>
                </section>
              </div>
            </>
          )}

          {section === "Products" && (
            <>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">What’s cooking?</p><h2 className="serif mt-2 text-3xl sm:text-4xl">The menu, your way.</h2><p className="mt-2 text-xs text-[#8b887e]">{products.length} items in your collection</p></div>
                <button type="button" onClick={openNewProduct} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> Add a product</button>
              </div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <label className="flex min-w-[220px] items-center gap-2 rounded-xl border border-[#e5e0d6] bg-white px-3.5 py-2.5 text-[#8b887e] sm:w-[320px]"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-full bg-transparent text-xs text-[#333229] outline-none" placeholder="Search products or categories" /></label>
                <button type="button" onClick={loadAdminData} className="rounded-lg border border-[#e5e0d6] bg-white px-3 py-2 text-[10px] font-bold text-[#69665c]">Refresh list</button>
              </div>
              <div className="overflow-hidden rounded-2xl border border-[#e8e4da] bg-[#fffdf9]">
                <div className="hidden grid-cols-[minmax(220px,1.3fr)_0.75fr_0.65fr_0.6fr_0.55fr_90px] gap-3 border-b border-[#efebe3] bg-[#faf8f3] px-5 py-3 text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#979387] md:grid"><span>Product</span><span>Category</span><span>Cuisine</span><span>Price</span><span>Visibility</span><span /></div>
                {filteredProducts.map((product) => (
                  <div key={product.id} className="grid gap-3 border-b border-[#f0ece4] px-4 py-4 last:border-b-0 sm:px-5 md:grid-cols-[minmax(220px,1.3fr)_0.75fr_0.65fr_0.6fr_0.55fr_90px] md:items-center">
                    <div className="flex items-center gap-3">
                      <span className="h-12 w-12 shrink-0 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url('${product.image}')` }} />
                      <div className="min-w-0"><p className="truncate text-xs font-bold">{product.name}</p><p className="mt-1 truncate text-[9px] text-[#8b887e]">{product.pack} · {product.vegetarian ? "Vegetarian" : "Non-vegetarian"}{product.frozen ? " · Frozen" : ""}</p></div>
                    </div>
                    <span className="text-[10px] text-[#69665c]">{product.category}</span><span className="text-[10px] text-[#69665c]">{product.cuisine}</span><span className="text-xs font-bold">{money(Number(product.price))}</span>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[9px] font-bold ${product.isActive ? "bg-[#eef2e7] text-[#61764a]" : "bg-[#f1eee8] text-[#8b887e]"}`}>{product.isActive ? "Live" : "Hidden"}</span>
                    <div className="flex gap-2 md:justify-end"><button type="button" onClick={() => openEditProduct(product)} className="rounded-lg border border-[#e6e1d7] px-3 py-2 text-[9px] font-bold text-[#68665d] hover:border-[#d95720] hover:text-[#d95720]">Edit</button><button type="button" onClick={() => deleteProduct(product)} className="rounded-lg border border-[#eee1db] px-2.5 py-2 text-[9px] font-bold text-[#a44d36] hover:bg-[#fbefeb]">Delete</button></div>
                  </div>
                ))}
                {filteredProducts.length === 0 && <div className="px-5 py-14 text-center text-xs text-[#8b887e]">{loading ? "Loading your products…" : products.length ? "No products match your search." : "No menu items yet. Add your first product to get started."}</div>}
              </div>
            </>
          )}

          {section === "Orders" && (
            <>
              <div className="mb-6"><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">From your kitchen to their table</p><h2 className="serif mt-2 text-3xl sm:text-4xl">The order board.</h2><p className="mt-2 text-xs text-[#8b887e]">Review orders and keep each one moving.</p></div>
              <div className="mb-5 grid gap-3 sm:grid-cols-3">
                {[["All orders", orders.length], ["Need a reply", pendingOrders], ["On their way", orders.filter((order) => order.status === "out_for_delivery").length]].map(([label, count]) => <div key={label} className="rounded-xl border border-[#e8e4da] bg-[#fffdf9] p-4"><p className="text-[10px] text-[#8b887e]">{label}</p><p className="mt-2 text-2xl font-extrabold">{count}</p></div>)}
              </div>
              <div className="overflow-x-auto rounded-2xl border border-[#e8e4da] bg-[#fffdf9]">
                <table className="w-full min-w-[750px] border-collapse text-left">
                  <thead><tr className="bg-[#faf8f3] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#979387]"><th className="px-5 py-3">Order</th><th className="px-5 py-3">Customer &amp; items</th><th className="px-5 py-3">Requested delivery</th><th className="px-5 py-3">Total</th><th className="px-5 py-3">Payment</th><th className="px-5 py-3">Status</th></tr></thead>
                  <tbody>{orders.map((order) => <tr key={order.id} className="border-t border-[#f0ece4] text-xs"><td className="px-5 py-4 font-bold">#{order.orderNumber}<p className="mt-1 text-[9px] font-normal text-[#8b887e]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p></td><td className="px-5 py-4"><p className="font-bold">{order.customerName}</p><p className="mt-1 text-[10px] text-[#8b887e]">{order.phone}</p><p className="mt-1 max-w-[220px] truncate text-[9px] text-[#8b887e]" title={order.deliveryAddress}>{order.deliveryAddress}</p><p className="mt-1 max-w-[220px] text-[9px] leading-4 text-[#8b887e]">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p></td><td className="px-5 py-4 text-[#69665c]">{new Date(order.requestedDeliveryAt).toLocaleString("en-IN")}</td><td className="px-5 py-4 font-bold">{money(Number(order.total))}</td><td className="px-5 py-4"><label className="sr-only" htmlFor={`payment-${order.id}`}>Update payment status for order {order.orderNumber}</label><select id={`payment-${order.id}`} value={order.paymentStatus} onChange={(event) => changeOrderPaymentStatus(order, event.target.value)} className="rounded-lg border border-[#e6e1d7] bg-white px-2.5 py-2 text-[10px] capitalize outline-none focus:border-[#d95720]">{["pending", "paid", "refunded"].map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td className="px-5 py-4"><label className="sr-only" htmlFor={`order-${order.id}`}>Update status for order {order.orderNumber}</label><select id={`order-${order.id}`} value={order.status} onChange={(event) => changeOrderStatus(order, event.target.value)} className="rounded-lg border border-[#e6e1d7] bg-white px-2.5 py-2 text-[10px] outline-none focus:border-[#d95720]">{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></td></tr>)}</tbody>
                </table>
                {orders.length === 0 && <div className="px-5 py-14 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f5efe4] text-[#b38762]"><PackageCheck size={20} /></span><p className="mt-3 text-xs font-bold">No orders just yet.</p><p className="mt-1 text-[10px] text-[#8b887e]">New online orders will appear here when checkout is connected.</p></div>}
              </div>
            </>
          )}

          {section === "Promotions" && (
            <>
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">A little something extra</p><h2 className="serif mt-2 text-3xl sm:text-4xl">Promotions & campaigns.</h2><p className="mt-2 text-xs text-[#8b887e]">Keep track of offers you’re sharing with your customers.</p></div><button type="button" onClick={() => setPromotionDialog(true)} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-[10px] font-extrabold text-white transition hover:bg-[#c94b18]"><Plus size={15} /> New promotion</button></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {promotions.map((promotion) => <article key={promotion.id} className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-5"><div className="flex items-start justify-between gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3edda] text-[#a2874c]"><Tag size={18} /></span><button type="button" onClick={() => togglePromotion(promotion)} className={`rounded-full px-3 py-1.5 text-[9px] font-bold ${promotion.enabled ? "bg-[#eef2e7] text-[#61764a]" : "bg-[#f1eee8] text-[#8b887e]"}`}>{promotion.enabled ? "Live" : "Paused"}</button></div><h3 className="mt-5 text-sm font-extrabold">{promotion.title}</h3>{promotion.code && <p className="mt-2 w-fit rounded-md bg-[#f7f5ef] px-2 py-1 font-mono text-[10px] font-bold tracking-wider text-[#7b6743]">{promotion.code}</p>}<p className="mt-3 text-xs leading-5 text-[#77756c]">{promotion.message}</p><button type="button" onClick={() => deletePromotion(promotion)} className="mt-5 text-[10px] font-bold text-[#a44d36] hover:underline">Delete promotion</button></article>)}
                {promotions.length === 0 && <div className="rounded-2xl border border-dashed border-[#dcd5c9] p-8 text-center sm:col-span-2 xl:col-span-3"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f3edda] text-[#a2874c]"><Tag size={20} /></span><p className="mt-3 text-xs font-bold">No promotions have been added.</p><p className="mt-1 text-[10px] text-[#8b887e]">Create your first offer or campaign.</p></div>}
              </div>
            </>
          )}
        </div>
      </div>

      {productDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#211f1a]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
          <form onSubmit={saveProduct} className="my-auto w-full max-w-[680px] rounded-[22px] bg-[#fffdf9] shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#efebe3] px-5 py-4 sm:px-7"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0714f]">Your menu, your call</p><h2 id="product-form-title" className="serif mt-1 text-2xl">{editingProduct ? "Edit this dish" : "Add a new dish"}</h2></div><button type="button" onClick={() => setProductDialog(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]" aria-label="Close product form"><X size={16} /></button></div>
            <div className="grid max-h-[68vh] gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-7">
              <Field label="Product name"><input required minLength={2} value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value, slug: makeSlug(event.target.value) })} className={inputClass} placeholder="e.g. Haryali kebab" /></Field>
              <Field label="URL slug"><input required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={productForm.slug} onChange={(event) => setProductForm({ ...productForm, slug: event.target.value })} className={inputClass} placeholder="haryali-kebab" /></Field>
              <Field label="Category"><select value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} className={inputClass}>{["Kebabs", "Marinades", "Curries", "Snacks", "Starters", "Main course", "Breads and Raita"].map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Cuisine"><select value={productForm.cuisine} onChange={(event) => setProductForm({ ...productForm, cuisine: event.target.value })} className={inputClass}>{["House special", "Andhra", "Lucknowi", "Mughlai"].map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="Price (INR)"><input type="number" min="1" step="1" required value={productForm.price || ""} onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })} className={inputClass} placeholder="325" /></Field>
              <Field label="Pack size"><input required value={productForm.pack} onChange={(event) => setProductForm({ ...productForm, pack: event.target.value })} className={inputClass} placeholder="500 g" /></Field>
              <Field label="Pack weight (grams)"><input type="number" min="1" step="1" required value={productForm.weightGrams} onChange={(event) => setProductForm({ ...productForm, weightGrams: Number(event.target.value) })} className={inputClass} placeholder="500" /></Field>
              <Field label="Product image URL"><input type="url" required value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} className={inputClass} placeholder="https://…" /></Field>
              <Field label="Optional menu badge"><input value={productForm.badge ?? ""} onChange={(event) => setProductForm({ ...productForm, badge: event.target.value || null })} className={inputClass} placeholder="Bestseller" /></Field>
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
            <div className="flex justify-end gap-2 border-t border-[#efebe3] px-5 py-4 sm:px-7"><button type="button" onClick={() => setProductDialog(false)} className="rounded-full px-4 py-2.5 text-[10px] font-bold text-[#706d63] hover:bg-[#f7f5ef]">Cancel</button><button disabled={savingProduct} type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-5 py-2.5 text-[10px] font-extrabold text-white hover:bg-[#c94b18] disabled:opacity-60">{savingProduct ? "Saving…" : <><Check size={13} /> Save product</>}</button></div>
          </form>
        </div>
      )}

      {promotionDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[#211f1a]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="promotion-form-title">
          <form onSubmit={addPromotion} className="w-full max-w-[480px] rounded-[22px] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
            <div className="mb-5 flex items-start justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#b0714f]">A reason to celebrate</p><h2 id="promotion-form-title" className="serif mt-1 text-2xl">New promotion</h2></div><button type="button" onClick={() => setPromotionDialog(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]" aria-label="Close promotion form"><X size={16} /></button></div>
            <div className="grid gap-4"><Field label="Campaign title"><input required value={promotionForm.title} onChange={(event) => setPromotionForm({ ...promotionForm, title: event.target.value })} className={inputClass} placeholder="Weekend dinner, sorted" /></Field><Field label="Discount code (optional)"><input value={promotionForm.code} onChange={(event) => setPromotionForm({ ...promotionForm, code: event.target.value.toUpperCase() })} className={`${inputClass} uppercase`} placeholder="GOODMOOD" /></Field><Field label="Campaign message"><textarea required rows={3} value={promotionForm.message} onChange={(event) => setPromotionForm({ ...promotionForm, message: event.target.value })} className={`${inputClass} resize-y`} placeholder="What should customers know?" /></Field></div>
            <div className="mt-6 flex justify-end gap-2"><button type="button" onClick={() => setPromotionDialog(false)} className="rounded-full px-4 py-2.5 text-[10px] font-bold text-[#706d63] hover:bg-[#f7f5ef]">Cancel</button><button type="submit" className="rounded-full bg-[#e95e25] px-5 py-2.5 text-[10px] font-extrabold text-white hover:bg-[#c94b18]">Create promotion</button></div>
          </form>
        </div>
      )}
    </main>
  );
}

const inputClass = "w-full rounded-xl border border-[#e3dccf] bg-white px-3.5 py-3 text-xs text-[#38372f] outline-none transition focus:border-[#d95720]";

function Field({ label, children, full = false }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <label className={`grid gap-2 text-[10px] font-bold text-[#545147] ${full ? "sm:col-span-2" : ""}`}>{label}{children}</label>;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return <button type="button" aria-pressed={checked} onClick={() => onChange(!checked)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[10px] font-bold transition ${checked ? "border-[#dfe7d2] bg-[#f0f3e9] text-[#61764a]" : "border-[#e8e4da] bg-white text-[#8b887e]"}`}><span className={`grid h-4 w-4 place-items-center rounded-full ${checked ? "bg-[#71834f] text-white" : "border border-[#d7d2c8]"}`}>{checked && <Check size={10} />}</span>{label}</button>;
}
