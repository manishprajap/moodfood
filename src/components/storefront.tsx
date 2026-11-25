"use client";

import Image from "next/image";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Clock3,
  Leaf,
  Menu,
  Minus,
  Plus,
  ShoppingBag,
  Snowflake,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  advanceOrderHours,
  categories,
  formatPrice,
  minimumOrderGrams,
  products,
  type Product,
  whatsappNumber,
} from "@/lib/catalog";

type Bag = Record<string, number>;
type Promotion = { title: string; code: string | null; message: string };

const translations = {
  en: {
    navMenu: "The menu",
    navStory: "Our story",
    navHow: "How it works",
    account: "My account",
    eyebrow: "Good food. A little less fuss.",
    heroLineOne: "Your kind of",
    heroLineTwo: "good food.",
    heroBody:
      "Small-batch marinades, kebabs and curries for the nights you want something lovely — without starting from scratch.",
    explore: "Find your new favourite",
    ourPicks: "A few of our favourites",
    browse: "Made for a very good meal.",
    browseDescription:
      "Real flavour, proper ingredients, and the sort of dinner that makes everyone ask for seconds.",
    fullMenu: "Explore the full menu",
    all: "Everything",
    footerCta: "Make room for a better dinner.",
    footerButton: "Chat with us",
  },
  hi: {
    navMenu: "हमारा मेन्यू",
    navStory: "हमारी कहानी",
    navHow: "कैसे ऑर्डर करें",
    account: "मेरा अकाउंट",
    eyebrow: "अच्छा खाना। थोड़ी कम मेहनत।",
    heroLineOne: "आपके मूड का",
    heroLineTwo: "अच्छा खाना।",
    heroBody:
      "छोटे बैच में बने मैरिनेड, कबाब और करी — उन शामों के लिए जब कुछ खास खाने का मन हो।",
    explore: "अपना पसंदीदा ढूंढें",
    ourPicks: "हमारे कुछ पसंदीदा",
    browse: "हर खाने को खास बनाएं।",
    browseDescription:
      "असली स्वाद, बेहतरीन सामग्री और ऐसा डिनर जिसे सब दोबारा मांगें।",
    fullMenu: "पूरा मेन्यू देखें",
    all: "सब कुछ",
    footerCta: "आज कुछ खास बनाइए।",
    footerButton: "हमसे बात करें",
  },
} as const;

function whatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function minimumDeliveryDateTimeLocal() {
  const date = new Date(Date.now() + advanceOrderHours * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className="flex items-center gap-2.5"
      href="#home"
      aria-label="Mood Food home"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f1eab5] text-[#c95220]">
        <span className="relative -rotate-12 text-[22px]" aria-hidden="true">
          ♨
        </span>
      </span>
      <span className="leading-none">
        <span
          className={`block font-extrabold tracking-[-0.065em] text-[#d95720] ${
            compact ? "text-[19px]" : "text-[22px]"
          }`}
        >
          Mood Food
        </span>
        <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.15em] text-[#635f54]">
          Marinades · Kebabs · Curries
        </span>
      </span>
    </a>
  );
}

export function Storefront() {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [catalogPreview, setCatalogPreview] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [frozenOnly, setFrozenOnly] = useState(false);
  const [bag, setBag] = useState<Bag>({});
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryAt, setDeliveryAt] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpMessage, setOtpMessage] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const t = translations[language];

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Live product list unavailable.");
        const result = (await response.json()) as { products: Product[] };
        if (active && result.products.length > 0) setCatalog(result.products);
        if (active) setCatalogPreview(false);
      })
      .catch(() => {
        if (active) setCatalogPreview(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/promotions")
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json()) as { promotions: Promotion[] };
        if (active) setPromotion(result.promotions[0] ?? null);
      })
      .catch(() => {
        if (active) setPromotion(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const productCategories = useMemo(
    () => [
      ...categories,
      ...catalog
        .map((product) => product.category)
        .filter((category) => !categories.includes(category as (typeof categories)[number])),
    ],
    [catalog],
  );

  const visibleProducts = useMemo(
    () =>
      catalog.filter(
        (product) =>
          (activeCategory === "All" || product.category === activeCategory) &&
          (!vegetarianOnly || product.vegetarian) &&
          (!frozenOnly || product.frozen),
      ),
    [activeCategory, catalog, frozenOnly, vegetarianOnly],
  );

  const bagCount = Object.values(bag).reduce((sum, quantity) => sum + quantity, 0);
  const bagItems = products.filter((product) => bag[product.id]);
  const bagGrams = bagItems.reduce(
    (sum, product) => sum + bag[product.id] * product.weightGrams,
    0,
  );
  const bagTotal = bagItems.reduce(
    (sum, product) => sum + bag[product.id] * product.price,
    0,
  );

  function updateBag(productId: string, change: number) {
    setBag((current) => {
      const quantity = Math.max(0, (current[productId] || 0) + change);
      const next = { ...current };
      if (quantity === 0) delete next[productId];
      else next[productId] = quantity;
      return next;
    });
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderSubmitting(true);
    setOrderError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutName,
          phone: checkoutPhone,
          deliveryAddress,
          requestedDeliveryAt: new Date(deliveryAt).toISOString(),
          customerNote,
          items: bagItems.map((product) => ({
            productId: product.id,
            quantity: bag[product.id],
          })),
        }),
      });
      const result = (await response.json()) as {
        orderNumber?: string;
        error?: string;
      };
      if (!response.ok || !result.orderNumber) {
        setOrderError(result.error ?? "We couldn't save your order. Please try WhatsApp instead.");
        return;
      }

      const orderLines = bagItems
        .map((product) => `${product.name} x ${bag[product.id]}`)
        .join("\n");
      const message = `Hello Mood Food! I just placed order ${result.orderNumber}.\n${orderLines}\nTotal: ${formatPrice(bagTotal)}\nRequested delivery: ${new Date(deliveryAt).toLocaleString("en-IN")}\nName: ${checkoutName}\nPhone: +91 ${checkoutPhone}\nAddress: ${deliveryAddress}\n${customerNote ? `Note: ${customerNote}\n` : ""}\nPlease confirm the order and share UPI payment details.`;
      window.location.assign(whatsAppUrl(message));
    } catch {
      setOrderError("We couldn't save your order. Please try again or contact Mood Food on WhatsApp.");
    } finally {
      setOrderSubmitting(false);
    }
  }

  function orderOnWhatsApp() {
    if (bagGrams < minimumOrderGrams) return;
    setOrderError("");
    setDeliveryAt((current) => current || minimumDeliveryDateTimeLocal());
    setCheckoutOpen(true);
  }

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOtpLoading(true);
    setOtpMessage("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = (await response.json()) as { message?: string };
      setOtpMessage(
        result.message ??
          (response.ok
            ? "Check your phone for the sign-in code."
            : "We couldn't send a code. Please try WhatsApp instead."),
      );
    } catch {
      setOtpMessage(
        "We couldn't reach the sign-in service. Please try WhatsApp instead.",
      );
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <main id="home" className="overflow-hidden">
      <div className="bg-[#28271f] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white/90">
        {promotion ? (
          <>
            <span className="font-bold text-[#f3b348]">{promotion.title}</span>
            <span className="mx-2 text-white/50">·</span>
            {promotion.message}
            {promotion.code && <span className="ml-2 rounded bg-white/10 px-2 py-1 font-bold text-[#f3b348]">{promotion.code}</span>}
          </>
        ) : (
          <>A little more delicious, delivered around Gurugram &amp; Noida{" "}
        <span className="mx-1 text-[#f3b348]">✳</span> Order at least{" "}
        {minimumOrderGrams / 1000} kg, 48 hours ahead</>
        )}
      </div>

      <header className="sticky top-0 z-30 border-b border-[#e9e3d8] bg-[#fbf8f2]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <BrandMark />
          <nav className="hidden items-center gap-9 text-[13px] font-semibold text-[#56554d] md:flex">
            <a href="#menu" className="transition-colors hover:text-[#d95720]">
              {t.navMenu}
            </a>
            <a href="#story" className="transition-colors hover:text-[#d95720]">
              {t.navStory}
            </a>
            <a href="#how" className="transition-colors hover:text-[#d95720]">
              {t.navHow}
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="rounded-full px-3 py-2 text-xs font-bold text-[#656258] transition hover:bg-[#f1eadf]"
              aria-label="Change language"
            >
              {language === "en" ? "हि" : "EN"}
            </button>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-[#ded7cb] px-4 py-2.5 text-xs font-bold transition hover:border-[#d95720] hover:text-[#d95720] sm:flex"
            >
              {t.account}
            </button>
            <button
              type="button"
              onClick={() => setBagOpen(true)}
              aria-label={`Open bag, ${bagCount} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-[#e95e25] text-white transition hover:bg-[#c94b18]"
            >
              <ShoppingBag size={17} strokeWidth={2} />
              {bagCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#28271f] px-1 text-[10px] font-bold">
                  {bagCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ded7cb] md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="grid gap-1 border-t border-[#e9e3d8] bg-[#fbf8f2] px-6 py-3 text-sm font-semibold md:hidden">
            <a className="rounded-lg px-3 py-2.5" href="#menu" onClick={() => setMenuOpen(false)}>{t.navMenu}</a>
            <a className="rounded-lg px-3 py-2.5" href="#story" onClick={() => setMenuOpen(false)}>{t.navStory}</a>
            <a className="rounded-lg px-3 py-2.5" href="#how" onClick={() => setMenuOpen(false)}>{t.navHow}</a>
            <button className="rounded-lg px-3 py-2.5 text-left" onClick={() => { setMenuOpen(false); setAccountOpen(true); }}>{t.account}</button>
          </nav>
        )}
      </header>

      <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 pb-16 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-12 lg:pb-24 lg:pt-20">
        <div className="max-w-[550px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#ded7cb] bg-white/70 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#6c6a5e]">
            <Sparkles size={13} className="text-[#d95720]" />
            {t.eyebrow}
          </div>
          <h1 className="serif text-[clamp(3.55rem,7.8vw,6.65rem)] leading-[0.96] text-[#26251f]">
            {t.heroLineOne}
            <br />
            <span className="relative inline-block text-[#df5a22]">
              {t.heroLineTwo}
              <span className="absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-2 rounded-full bg-[#f3d961]/70" />
            </span>
          </h1>
          <p className="mt-7 max-w-[425px] text-[15px] leading-7 text-[#6d6a61] sm:text-base">
            {t.heroBody}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#menu"
              className="inline-flex items-center gap-3 rounded-full bg-[#e95e25] px-6 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c94b18]"
            >
              {t.explore}
              <ArrowRight size={16} />
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-[#4c4a42] transition hover:bg-white"
            >
              See how it works <ArrowDown size={14} />
            </a>
          </div>
          <div className="mt-10 flex items-center gap-4 border-t border-[#e9e3d8] pt-6">
            <div className="flex -space-x-2">
              {["🧑🏽‍🍳", "👩🏻‍🍳", "🧑🏾‍🍳"].map((face, index) => (
                <span
                  key={face}
                  className={`grid h-9 w-9 place-items-center rounded-full border-2 border-[#fbf8f2] text-lg ${
                    index === 1 ? "bg-[#f4d8c6]" : "bg-[#e9dfc9]"
                  }`}
                >
                  {face}
                </span>
              ))}
            </div>
            <p className="text-xs leading-5 text-[#77756c]">
              <span className="font-bold text-[#2b2a25]">Made with care.</span>
              <br />
              From our kitchen to yours.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[650px]">
          <div className="absolute -right-5 -top-7 h-32 w-32 rounded-full bg-[#e7e5c4] blur-2xl sm:-right-8 sm:-top-9 sm:h-44 sm:w-44" />
          <div className="food-photo soft-shadow relative aspect-[1.14/1] overflow-hidden rounded-[30px] bg-[#d7c6a8] sm:rounded-[40px]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90')" }}>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#fffdf9]/90 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#46453d] sm:left-7 sm:top-7">
              <span className="h-2 w-2 rounded-full bg-[#698247]" />
              Good things, made fresh
            </div>
            <div className="absolute bottom-5 left-5 text-white sm:bottom-8 sm:left-8">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/75">A little something for dinner</p>
              <p className="serif text-3xl sm:text-4xl">Ready when you are.</p>
            </div>
          </div>
          <div className="soft-shadow absolute -bottom-6 right-1 flex items-center gap-3 rounded-2xl border border-white/80 bg-[#fffdf9] p-3.5 sm:-right-7 sm:bottom-8 sm:p-4">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f4edd4] text-[#d15a26]">
              <Clock3 size={19} />
            </span>
            <span>
              <span className="block text-xs font-bold text-[#292821]">A little planning</span>
              <span className="mt-1 block text-[10px] text-[#77756c]">Order 48 hours ahead</span>
            </span>
          </div>
        </div>
      </section>

      <section className="border-y border-[#ece5d9] bg-[#f4efe5]">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 divide-x divide-[#ded7cb] px-5 py-5 sm:px-8 md:grid-cols-4 lg:px-12">
          {[
            ["01", "Small-batch", "Made with intention"],
            ["02", "Real ingredients", "Flavour comes first"],
            ["03", "Fresh or frozen", "Good food, your way"],
            ["04", "Easy ordering", "Right here or WhatsApp"],
          ].map(([number, title, caption]) => (
            <div key={number} className="flex items-center gap-3 px-3 py-3 sm:px-5">
              <span className="serif hidden text-xl text-[#d95720] sm:block">{number}</span>
              <div>
                <p className="text-xs font-bold text-[#35342d] sm:text-sm">{title}</p>
                <p className="mt-1 text-[10px] text-[#77756c] sm:text-[11px]">{caption}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="menu" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#d95720]">{t.ourPicks}</p>
            <h2 className="serif max-w-xl text-4xl leading-[1.06] sm:text-5xl">{t.browse}</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#77756c]">{t.browseDescription}</p>
          </div>
          <a
            href={whatsAppUrl("Hello Mood Food! Please share your complete menu.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 self-start text-xs font-bold text-[#39382f] transition hover:text-[#d95720] md:self-auto"
          >
            {t.fullMenu} <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="mb-7 flex flex-col gap-4 border-b border-[#e7e0d4] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {productCategories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition ${
                  activeCategory === category
                    ? "bg-[#292821] text-white"
                    : "border border-[#e4ddd1] bg-[#fffdf9] text-[#5f5c53] hover:border-[#bb8866]"
                }`}
              >
                {category === "All" ? t.all : category}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setVegetarianOnly(!vegetarianOnly)}
              aria-pressed={vegetarianOnly}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition ${
                vegetarianOnly
                  ? "border-[#71834f] bg-[#71834f] text-white"
                  : "border-[#e4ddd1] text-[#58574e] hover:bg-white"
              }`}
            >
              <Leaf size={13} /> Veg
            </button>
            <button
              type="button"
              onClick={() => setFrozenOnly(!frozenOnly)}
              aria-pressed={frozenOnly}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition ${
                frozenOnly
                  ? "border-[#507a8a] bg-[#507a8a] text-white"
                  : "border-[#e4ddd1] text-[#58574e] hover:bg-white"
              }`}
            >
              <Snowflake size={13} /> Frozen
            </button>
          </div>
        </div>
        {catalogPreview && (
          <p className="mb-5 rounded-xl border border-[#e9e3d8] bg-[#f4efe5] px-4 py-3 text-[11px] leading-5 text-[#77756c]">
            Showing the starter menu preview. The live catalogue will appear once the store database is connected.
          </p>
        )}

        {visibleProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#d8d0c3] py-16 text-center text-sm text-[#77756c]">
            No dishes in this combination just yet.{" "}
            <button
              type="button"
              className="font-bold text-[#d95720] underline underline-offset-2"
              onClick={() => {
                setVegetarianOnly(false);
                setFrozenOnly(false);
                setActiveCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[23px] border border-[#e8e1d6] bg-[#fffdf9] transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_38px_rgba(54,39,20,0.09)]"
              >
                <div
                  className="food-photo relative aspect-[1.16/1] overflow-hidden bg-[#eee5d4]"
                  style={{ backgroundImage: `url('${product.image}')`, backgroundPosition: product.imagePosition || "center" }}
                  role="img"
                  aria-label={`${product.name} dish`}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-70" />
                  <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
                    {product.badge && (
                      <span className="rounded-full bg-[#fffdf9]/95 px-2.5 py-1.5 text-[9px] font-bold text-[#4d4a3f]">
                        {product.badge}
                      </span>
                    )}
                    {product.frozen && (
                      <span className="rounded-full bg-[#edf6f6] px-2.5 py-1.5 text-[9px] font-bold text-[#3d7482]">
                        Frozen
                      </span>
                    )}
                  </div>
                  <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-bold text-[#514f47]">
                    <span className={`h-2 w-2 rounded-[2px] border ${product.vegetarian ? "border-[#598647]" : "border-[#b14b3f]"}`}>
                      <span className={`m-[2px] block h-1 w-1 rounded-full ${product.vegetarian ? "bg-[#598647]" : "bg-[#b14b3f]"}`} />
                    </span>
                    {product.vegetarian ? "Vegetarian" : "Non-vegetarian"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setDetailProduct(product)}
                    className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#2b2a25] opacity-0 shadow transition group-hover:opacity-100 focus:opacity-100"
                    aria-label={`More about ${product.name}`}
                  >
                    <ArrowUpRight size={16} />
                  </button>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#9a7560]">{product.cuisine}</span>
                    <span className="text-[10px] text-[#8a877d]">{product.pack}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailProduct(product)}
                    className="text-left"
                  >
                    <h3 className="serif text-[21px] leading-tight text-[#292821]">{product.name}</h3>
                  </button>
                  <p className="mt-2 min-h-[39px] text-[11px] leading-[1.65] text-[#77756c]">{product.description}</p>
                  <div className="mt-4 flex items-center justify-between border-t border-[#eee8de] pt-3.5">
                    <p className="text-sm font-extrabold text-[#2e2c26]">{formatPrice(product.price)} <span className="text-[10px] font-medium text-[#88857b]">/ {product.pack}</span></p>
                    {bag[product.id] ? (
                      <span className="flex items-center gap-2 rounded-full bg-[#f4efe5] px-1.5 py-1">
                        <button type="button" onClick={() => updateBag(product.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white" aria-label={`Remove one ${product.name}`}><Minus size={12} /></button>
                        <span className="min-w-[12px] text-center text-xs font-bold">{bag[product.id]}</span>
                        <button type="button" onClick={() => updateBag(product.id, 1)} className="grid h-6 w-6 place-items-center rounded-full bg-[#e95e25] text-white" aria-label={`Add one ${product.name}`}><Plus size={12} /></button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => updateBag(product.id, 1)}
                        className="grid h-8 w-8 place-items-center rounded-full border border-[#dcd5c9] text-[#333229] transition hover:border-[#e95e25] hover:bg-[#e95e25] hover:text-white"
                        aria-label={`Add ${product.name} to bag`}
                      >
                        <Plus size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#efeadb] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#78834d]"><Check size={16} /></span>
            <p className="text-xs leading-5 text-[#5f5c52]">
              <span className="font-bold text-[#333229]">A heads-up before you add to the bag:</span>{" "}
              minimum order {minimumOrderGrams / 1000} kg · please order at least {advanceOrderHours} hours ahead.
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-semibold text-[#6d6a61]">Prices shown in INR</span>
        </div>
      </section>

      <section id="how" className="scroll-mt-24 bg-[#292821] text-[#fffdf9]">
        <div className="mx-auto grid max-w-[1320px] gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-12 lg:py-24">
          <div className="max-w-md">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ef9a64]">No rush. Just really good food.</p>
            <h2 className="serif text-4xl leading-[1.08] sm:text-5xl">A little plan.<br />A lovely meal.</h2>
            <p className="mt-5 text-sm leading-7 text-white/65">Everything is made in small batches, so we ask for a little notice. You choose the good stuff; we take care of the flavour.</p>
            <a href={whatsAppUrl("Hi Mood Food! I'd like some help planning an order.")} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#ef9a64] px-5 py-3 text-xs font-bold text-[#292821] transition hover:bg-[#ffc08d]">
              Plan an order with us <ArrowUpRight size={15} />
            </a>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              ["01", "Pick your mood", "Discover your favourites — from herb-packed kebabs to easy weeknight curries."],
              ["02", "Order your way", "Add at least 1 kg to your bag, then check in with us on WhatsApp."],
              ["03", "Give us 48 hours", "We’ll confirm availability and your delivery details before we prepare your order."],
            ].map(([step, title, text]) => (
              <div key={step} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 sm:p-5">
                <span className="serif text-3xl text-[#f29a64]">{step}</span>
                <h3 className="mt-7 text-sm font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="story" className="scroll-mt-24 mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:px-12 lg:py-24">
        <div className="relative mx-auto w-full max-w-[550px]">
          <div className="food-photo relative aspect-[1.2/1] rounded-[26px] bg-[#e8ddc8]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85')" }} role="img" aria-label="A home-cooked dinner being prepared">
            <div className="absolute bottom-4 left-4 w-[104px] overflow-hidden rounded-xl border-2 border-white/80 shadow-lg sm:bottom-5 sm:left-5 sm:w-[120px]">
              <Image src="/brand/mood-food-logo.jpeg" alt="Mood Food brand logo" width={768} height={768} className="h-auto w-full" />
            </div>
          </div>
          <div className="absolute -bottom-4 -right-2 grid h-[116px] w-[116px] place-items-center rounded-full border-[5px] border-[#fbf8f2] bg-[#e9dfbd] text-center sm:-right-4 sm:h-[136px] sm:w-[136px]">
            <div>
              <span className="block text-2xl">✳</span>
              <span className="mt-1 block text-[9px] font-extrabold uppercase leading-4 tracking-[0.12em] text-[#5c6040]">Good food<br />good mood</span>
            </div>
          </div>
        </div>
        <div className="max-w-lg pt-3 lg:pt-0">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#d95720]">A bit about us</p>
          <h2 className="serif text-4xl leading-[1.08] sm:text-5xl">We make the good part of dinner <span className="italic text-[#d95720]">easy.</span></h2>
          <p className="mt-5 text-sm leading-7 text-[#6d6a61]">A familiar craving. A long day. Friends turning up. Mood Food brings thoughtfully prepared marinades, kebabs and curries to the moments that deserve a little extra.</p>
          <p className="mt-4 text-sm leading-7 text-[#6d6a61]">Real flavours, handy portions and a menu with both vegetarian and non-vegetarian favourites — ready for your table, on your time.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Andhra", "Lucknowi", "Mughlai", "Made with care"].map((label) => (
              <span key={label} className="rounded-full border border-[#e5ded2] bg-white/60 px-3.5 py-2 text-[10px] font-semibold text-[#57564e]">{label}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[26px] bg-[#eee6d4]">
          <div className="absolute inset-0 grain opacity-40" />
          <div className="relative grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1fr_0.75fr] md:p-12 lg:px-16 lg:py-14">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#9b623d]">Your freezer called</p>
              <h2 className="serif max-w-lg text-3xl leading-tight sm:text-4xl">Save a little room for a very good plan B.</h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#777166]">Our frozen-ready menu is getting ready for its moment. Until then, have a peek at what’s on the way.</p>
              <a href="#frozen-menu" className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#fffdf9] px-5 py-3 text-xs font-bold text-[#39382f] transition hover:bg-white">
                See what’s coming <ArrowDown size={14} />
              </a>
            </div>
            <div id="frozen-menu" className="relative mx-auto w-full max-w-[360px] rotate-1 overflow-hidden rounded-2xl shadow-[0_16px_45px_rgba(54,39,20,0.18)]">
              <Image src="/brand/frozen-menu.png" alt="Mood Food frozen food menu, coming soon" width={720} height={900} className="h-auto w-full" />
              <div className="absolute right-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#358090] shadow">Coming soon</div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <div className="relative overflow-hidden rounded-[28px] bg-[#e65b23] px-6 py-11 text-white sm:px-10 sm:py-14 lg:px-16">
          <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[1px] border-white/20" />
          <div className="absolute -right-2 -top-16 h-56 w-56 rounded-full border-[1px] border-white/15" />
          <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">A good dinner is closer than you think</p>
              <h2 className="serif max-w-xl text-4xl leading-tight sm:text-5xl">{t.footerCta}</h2>
              <p className="mt-4 text-sm text-white/80">Tell us what you’re in the mood for. We’ll take it from there.</p>
            </div>
            <a href={whatsAppUrl("Hello Mood Food! I'd love to know what's on the menu.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#fffdf9] px-6 py-3.5 text-xs font-extrabold text-[#292821] transition hover:-translate-y-0.5 md:self-auto">
              {t.footerButton} <ArrowUpRight size={15} />
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e9e3d8] bg-[#f6f1e8]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto_auto] lg:px-12">
          <div>
            <BrandMark compact />
            <p className="mt-4 max-w-xs text-xs leading-6 text-[#77756c]">Quick food for easy life. Made with care, to bring a little more joy to the table.</p>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#55534b]">Explore</p>
            <div className="grid gap-3 text-xs text-[#77756c]">
              <a href="#menu" className="hover:text-[#d95720]">Our menu</a>
              <a href="#story" className="hover:text-[#d95720]">About Mood Food</a>
              <a href="#how" className="hover:text-[#d95720]">How ordering works</a>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#55534b]">Say hello</p>
            <div className="grid gap-3 text-xs text-[#77756c]">
              <a href={whatsAppUrl("Hello Mood Food!")} target="_blank" rel="noopener noreferrer" className="hover:text-[#d95720]">WhatsApp us</a>
              <a href="tel:+919599944745" className="hover:text-[#d95720]">+91 95999 44745</a>
              <a href="/admin" className="hover:text-[#d95720]">Admin</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#e9e3d8] px-5 py-4 text-center text-[10px] text-[#8b887e]">
          © Mood Food. Made for good moods and good meals.
        </div>
      </footer>

      {bagOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" className="absolute inset-0 bg-[#211f1a]/50 backdrop-blur-[2px]" onClick={() => setBagOpen(false)} aria-label="Close shopping bag" />
          <aside className="relative flex h-full w-full max-w-[440px] flex-col bg-[#fbf8f2] shadow-2xl" aria-label="Shopping bag">
            <div className="flex items-center justify-between border-b border-[#e9e3d8] px-5 py-5 sm:px-7">
              <div><p className="serif text-2xl">Your bag</p><p className="mt-1 text-[11px] text-[#77756c]">{bagCount} {bagCount === 1 ? "item" : "items"}</p></div>
              <button type="button" onClick={() => setBagOpen(false)} aria-label="Close bag" className="grid h-9 w-9 place-items-center rounded-full border border-[#e3dccf]"><X size={17} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7">
              {bagItems.length === 0 ? (
                <div className="grid h-full content-center justify-items-center text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-[#f0e9db] text-[#d95720]"><ShoppingBag size={24} /></span>
                  <p className="serif mt-5 text-2xl">A little space for something lovely.</p>
                  <p className="mt-2 text-xs text-[#77756c]">Your bag is empty for now.</p>
                  <button type="button" onClick={() => setBagOpen(false)} className="mt-6 rounded-full bg-[#e95e25] px-5 py-3 text-xs font-bold text-white">Explore the menu</button>
                </div>
              ) : (
                <div className="divide-y divide-[#e9e3d8]">
                  {bagItems.map((product) => (
                    <div className="flex items-center gap-3 py-4" key={product.id}>
                      <div className="food-photo h-[66px] w-[66px] shrink-0 rounded-xl bg-[#eee5d4]" style={{ backgroundImage: `url('${product.image}')` }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{product.name}</p>
                        <p className="mt-1 text-[10px] text-[#77756c]">{product.pack} · {formatPrice(product.price)}</p>
                        <div className="mt-2 flex w-fit items-center gap-3 rounded-full border border-[#e3dccf] px-2 py-1">
                          <button type="button" onClick={() => updateBag(product.id, -1)} aria-label={`Remove one ${product.name}`}><Minus size={12} /></button>
                          <span className="text-[11px] font-bold">{bag[product.id]}</span>
                          <button type="button" onClick={() => updateBag(product.id, 1)} aria-label={`Add one ${product.name}`}><Plus size={12} /></button>
                        </div>
                      </div>
                      <span className="text-xs font-bold">{formatPrice(product.price * bag[product.id])}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {bagItems.length > 0 && (
              <div className="border-t border-[#e9e3d8] bg-[#fffdf9] px-5 py-5 sm:px-7">
                <div className="mb-3 flex justify-between text-sm"><span className="text-[#77756c]">Subtotal</span><span className="font-bold">{formatPrice(bagTotal)}</span></div>
                <p className={`mb-4 flex items-center gap-2 text-[11px] ${bagGrams >= minimumOrderGrams ? "text-[#637544]" : "text-[#946633]"}`}>
                  {bagGrams >= minimumOrderGrams ? <Check size={14} /> : <ArrowLeft size={14} />}
                  {bagGrams >= minimumOrderGrams ? "Minimum order reached" : `${((minimumOrderGrams - bagGrams) / 1000).toFixed(1)} kg more to reach the 1 kg minimum`}
                </p>
                {checkoutOpen ? (
                  <form onSubmit={placeOrder} className="grid gap-3">
                    <p className="mb-1 text-xs font-bold">Where should we bring it?</p>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#656258]">Your name
                      <input required minLength={2} maxLength={120} value={checkoutName} onChange={(event) => setCheckoutName(event.target.value)} className="rounded-lg border border-[#e3dccf] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#d95720]" placeholder="Name for the order" />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#656258]">Mobile number
                      <div className="flex overflow-hidden rounded-lg border border-[#e3dccf] bg-white focus-within:border-[#d95720]"><span className="grid place-items-center border-r border-[#e3dccf] px-2.5 text-[10px] text-[#77756c]">+91</span><input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required value={checkoutPhone} onChange={(event) => setCheckoutPhone(event.target.value.replace(/\D/g, ""))} className="min-w-0 flex-1 px-3 py-2.5 text-xs outline-none" placeholder="10-digit mobile number" /></div>
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#656258]">Delivery address
                      <textarea required minLength={10} maxLength={2000} rows={2} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} className="resize-y rounded-lg border border-[#e3dccf] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#d95720]" placeholder="House, street, area, city and postcode" />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#656258]">Preferred delivery time
                      <input type="datetime-local" required min={minimumDeliveryDateTimeLocal()} value={deliveryAt} onChange={(event) => setDeliveryAt(event.target.value)} className="rounded-lg border border-[#e3dccf] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#d95720]" />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#656258]">Anything else? <span className="font-normal text-[#89857b]">(optional)</span>
                      <input maxLength={1000} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className="rounded-lg border border-[#e3dccf] bg-white px-3 py-2.5 text-xs outline-none focus:border-[#d95720]" placeholder="A delivery note or request" />
                    </label>
                    {orderError && <p role="alert" className="rounded-lg bg-[#fbefeb] px-3 py-2 text-[10px] leading-4 text-[#99452c]">{orderError}</p>}
                    <button type="submit" disabled={orderSubmitting} className="mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#e95e25] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#c94b18] disabled:cursor-not-allowed disabled:opacity-60">
                      {orderSubmitting ? "Saving your order…" : <>Place order & continue on WhatsApp <ArrowRight size={15} /></>}
                    </button>
                    <p className="text-center text-[10px] leading-4 text-[#88857b]">We’ll confirm availability and UPI payment details in WhatsApp. No payment is taken here.</p>
                  </form>
                ) : (
                  <button type="button" onClick={orderOnWhatsApp} disabled={bagGrams < minimumOrderGrams} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#e95e25] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#c94b18] disabled:cursor-not-allowed disabled:bg-[#c6bdb0]">
                    Add delivery details <ArrowRight size={15} />
                  </button>
                )}
                {!checkoutOpen && <p className="mt-3 text-center text-[10px] leading-4 text-[#88857b]">Orders need at least {advanceOrderHours} hours’ notice. We’ll confirm your delivery slot in chat.</p>}
              </div>
            )}
          </aside>
        </div>
      )}

      {detailProduct && (
        <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#211f1a]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
          <div className="relative my-auto grid w-full max-w-[720px] overflow-hidden rounded-[24px] bg-[#fffdf9] shadow-2xl sm:grid-cols-2">
            <button type="button" onClick={() => setDetailProduct(null)} aria-label="Close product details" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90"><X size={17} /></button>
            <div className="food-photo min-h-[230px] bg-[#eee5d4] sm:min-h-[380px]" style={{ backgroundImage: `url('${detailProduct.image}')` }} />
            <div className="flex flex-col p-6 sm:p-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#d95720]">{detailProduct.cuisine} · {detailProduct.category}</span>
              <h2 id="product-dialog-title" className="serif mt-3 text-3xl">{detailProduct.name}</h2>
              <p className="mt-3 text-sm leading-6 text-[#77756c]">{detailProduct.description}</p>
              <div className="mt-5 grid gap-2 rounded-xl bg-[#f6f1e8] p-4 text-xs text-[#625f56]">
                <p><span className="font-bold text-[#34332c]">Food type:</span> {detailProduct.vegetarian ? "Vegetarian" : "Non-vegetarian"}</p>
                <p><span className="font-bold text-[#34332c]">Storage:</span> {detailProduct.frozen ? "Keep frozen" : "Fresh"}</p>
                <p><span className="font-bold text-[#34332c]">Pack:</span> {detailProduct.pack}</p>
                {detailProduct.ingredients && <p><span className="font-bold text-[#34332c]">Ingredients:</span> {detailProduct.ingredients}</p>}
                {detailProduct.nutrition ? (
                  <p><span className="font-bold text-[#34332c]">Nutrition per pack:</span> {detailProduct.nutrition.caloriesKcal} kcal · {detailProduct.nutrition.proteinGrams} g protein · {detailProduct.nutrition.carbohydratesGrams} g carbohydrates · {detailProduct.nutrition.fatGrams} g fat</p>
                ) : (
                  <p className="pt-1 text-[10px] leading-4 text-[#89857b]">Nutrition values are being confirmed for product packaging. Please ask us about dietary requirements before ordering.</p>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <span className="text-lg font-extrabold">{formatPrice(detailProduct.price)} <span className="text-[10px] font-medium text-[#88857b]">/ {detailProduct.pack}</span></span>
                <button type="button" onClick={() => { updateBag(detailProduct.id, 1); setDetailProduct(null); setBagOpen(true); }} className="inline-flex items-center gap-2 rounded-full bg-[#e95e25] px-4 py-3 text-xs font-bold text-white"><Plus size={14} /> Add to bag</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accountOpen && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-[#211f1a]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
          <div className="relative w-full max-w-[420px] rounded-[24px] bg-[#fffdf9] p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={() => { setAccountOpen(false); setOtpMessage(""); }} aria-label="Close sign in" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[#e9e3d8]"><X size={16} /></button>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#f5eadc] text-[#d95720]"><ShoppingBag size={20} /></span>
            <h2 id="account-dialog-title" className="serif mt-5 text-3xl">Welcome back.</h2>
            <p className="mt-2 text-sm leading-6 text-[#77756c]">Enter your mobile number and we’ll send you a one-time sign-in code.</p>
            <form onSubmit={requestOtp} className="mt-6">
              <label htmlFor="mobile" className="mb-2 block text-xs font-bold text-[#424037]">Mobile number</label>
              <div className="flex overflow-hidden rounded-xl border border-[#e3dccf] bg-white focus-within:border-[#d95720]">
                <span className="grid place-items-center border-r border-[#e3dccf] px-3 text-xs font-semibold text-[#77756c]">+91</span>
                <input id="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" maxLength={10} required value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" />
              </div>
              <button type="submit" disabled={otpLoading} className="mt-4 w-full rounded-full bg-[#e95e25] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#c94b18] disabled:opacity-60">{otpLoading ? "Sending…" : "Send sign-in code"}</button>
              {otpMessage && <p role="status" className="mt-3 rounded-xl bg-[#f6f1e8] p-3 text-xs leading-5 text-[#665f53]">{otpMessage}</p>}
              <p className="mt-4 text-center text-[10px] leading-4 text-[#89857b]">By continuing, you agree to receive a one-time verification code.</p>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
