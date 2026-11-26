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
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useMemo, useRef, useState } from "react";
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

/** Sets the --d CSS variable used for animation / transition delays. */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Reveals children with a one-time GSAP scroll animation. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return () => el.classList.remove("is-visible");
    }
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          delay: delay / 1000,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () => el.classList.add("is-visible"),
          },
        },
      );
    }, el);
    return () => {
      context.revert();
      el.classList.remove("is-visible");
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}

/** Thin gold bar at the very top that fills as the page scrolls. */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        },
      );
    }, el);
    return () => context.revert();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[3px]" aria-hidden="true">
      <div ref={ref} className="scroll-progress h-full origin-left" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/** Soft gold and purple dots that drift upward and twinkle across the whole page. */
function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["241,210,106", "167,78,184", "113,42,130", "255,255,255"];
    type Particle = { x: number; y: number; r: number; vx: number; vy: number; phase: number; speed: number; c: string };
    let width = 0;
    let height = 0;
    let raf = 0;
    let particles: Particle[] = [];

    const make = (initial: boolean): Particle => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.12,
      vy: 0.08 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(24, (width * height) / 26000)));
      particles = Array.from({ length: count }, () => make(true));
    };

    const tick = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(time / 1800 + p.phase) * 0.15;
        if (p.y < -10) Object.assign(p, make(false));
        const alpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin((time / 1000) * p.speed + p.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[5]" aria-hidden="true" />;
}

/** Tracks the pointer so .spotlight can draw a soft light under the cursor, and feeds the hero parallax. */
function trackPointer(event: React.MouseEvent<HTMLElement>) {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  event.currentTarget.style.setProperty("--mx", `${x}px`);
  event.currentTarget.style.setProperty("--my", `${y}px`);
  event.currentTarget.style.setProperty("--px", (x / rect.width - 0.5).toFixed(3));
  event.currentTarget.style.setProperty("--py", (y / rect.height - 0.5).toFixed(3));
}

/** Subtle 3D tilt that follows the pointer over a card. */
function tiltCard(event: React.MouseEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width - 0.5;
  const py = (event.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`);
}

function resetTilt(event: React.MouseEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty("--rx");
  event.currentTarget.style.removeProperty("--ry");
}

/** Staggered letter (or word) reveal. Use split="word" for Devanagari so glyphs don't break. */
function SplitText({
  text,
  delay = 0,
  step = 35,
  split = "char",
  unitClassName = "",
}: {
  text: string;
  delay?: number;
  step?: number;
  split?: "char" | "word";
  unitClassName?: string;
}) {
  let i = 0;
  return (
    <span aria-label={text}>
      {text.split(" ").map((word, wi) => (
        <span key={wi} className="word" aria-hidden="true">
          {split === "char" ? (
            Array.from(word).map((ch, ci) => (
              <span key={ci} className={`char ${unitClassName}`} style={d(delay + i++ * step)}>
                {ch}
              </span>
            ))
          ) : (
            <span className={`char ${unitClassName}`} style={d(delay + i++ * 120)}>
              {word}
            </span>
          )}
          {"\u00A0"}
        </span>
      ))}
    </span>
  );
}

/** Button gently follows the cursor. */
function magnet(event: React.MouseEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (event.clientX - rect.left - rect.width / 2) * 0.28;
  const y = (event.clientY - rect.top - rect.height / 2) * 0.28;
  el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
}

function unmagnet(event: React.MouseEvent<HTMLElement>) {
  event.currentTarget.style.transform = "";
}

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className="group flex items-center gap-2.5"
      href="#home"
      aria-label="Mood Food home"
    >
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#f5e6ab] text-[#712a82] transition duration-300 group-hover:scale-110 group-hover:rotate-6">
        <span className="anim-steam relative text-[22px]" aria-hidden="true">
          ♨
        </span>
      </span>
      <span className="leading-none">
        <span
          className={`block font-extrabold tracking-[-0.065em] text-[#712a82] ${
            compact ? "text-[19px]" : "text-[22px]"
          }`}
        >
          Mood Food
        </span>
        <span className="mt-1 block text-[8px] font-bold uppercase tracking-[0.15em] text-[#51465a]">
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
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [signedInPhone, setSignedInPhone] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [bagRing, setBagRing] = useState(0);
  const storefrontRef = useRef<HTMLElement>(null);
  const bagButtonRef = useRef<HTMLButtonElement>(null);
  const t = translations[language];

  useEffect(() => {
    const root = storefrontRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to("[data-gsap-orbit]", {
        rotation: 360,
        duration: 36,
        ease: "none",
        repeat: -1,
        transformOrigin: "50% 50%",
      });
    }, root);
    return () => context.revert();
  }, []);

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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** Flies a gold dot from the clicked button to the bag icon, then rings the bag. */
  function flyToBag(source: HTMLElement) {
    const target = bagButtonRef.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBagRing((n) => n + 1);
      return;
    }
    const s = source.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const dx = tr.left + tr.width / 2 - (s.left + s.width / 2);
    const dy = tr.top + tr.height / 2 - (s.top + s.height / 2);
    const dot = document.createElement("span");
    dot.className = "fly-dot";
    dot.style.left = `${s.left + s.width / 2 - 9}px`;
    dot.style.top = `${s.top + s.height / 2 - 9}px`;
    document.body.appendChild(dot);
    const anim = dot.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 90}px) scale(0.85)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.4 },
      ],
      { duration: 800, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    );
    anim.onfinish = () => {
      dot.remove();
      setBagRing((n) => n + 1);
    };
  }

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
  // Uses the live catalog (not the static starter list) so admin-added products work in the bag
  const bagItems = catalog.filter((product) => bag[product.id]);
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

  function closeAccount() {
    setAccountOpen(false);
    setOtpMessage("");
    setOtpCode("");
    setOtpSent(false);
  }

  async function requestOtp(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setOtpLoading(true);
    setOtpMessage("");
    setOtpCode("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = (await response.json()) as { message?: string };
      setOtpSent(response.ok);
      setOtpMessage(
        result.message ??
          (response.ok
            ? "Check your phone for the sign-in code."
            : "We couldn't send a code. Please try WhatsApp instead."),
      );
    } catch {
      setOtpSent(false);
      setOtpMessage(
        "We couldn't reach the sign-in service. Please try WhatsApp instead.",
      );
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOtpLoading(true);
    setOtpMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const result = (await response.json()) as { verified?: boolean; message?: string };
      if (response.ok && result.verified) {
        setSignedInPhone(phone);
        setOtpSent(false);
        setOtpCode("");
        setOtpMessage(result.message ?? "You're signed in.");
        // Pre-fill checkout phone for convenience
        setCheckoutPhone((current) => current || phone);
      } else {
        setOtpMessage(result.message ?? "That code isn't correct. Please try again.");
      }
    } catch {
      setOtpMessage("We couldn't verify the code. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <main ref={storefrontRef} id="home" className="overflow-hidden">
      <ScrollProgress />
      <ParticleField />
      <div className="bg-[#35153b] px-4 py-2 text-center text-[11px] font-medium tracking-wide text-white/90">
        {promotion ? (
          <>
            <span className="font-bold text-[#f1d26a]">{promotion.title}</span>
            <span className="mx-2 text-white/50">·</span>
            {promotion.message}
            {promotion.code && <span className="ml-2 rounded bg-white/10 px-2 py-1 font-bold text-[#f1d26a]">{promotion.code}</span>}
          </>
        ) : (
          <>A little more delicious, delivered around Gurugram &amp; Noida{" "}
        <span className="mx-1 inline-block animate-spin text-[#f1d26a]" style={{ animationDuration: "8s" }}>✳</span> Order at least{" "}
        {minimumOrderGrams / 1000} kg, 48 hours ahead</>
        )}
      </div>

      <header className={`site-header sticky top-0 z-30 border-b border-[#e9e1ef] bg-[#fff]/95 backdrop-blur-md ${scrolled ? "is-scrolled" : ""}`}>
        <div className={`mx-auto flex max-w-[1320px] items-center justify-between px-5 transition-[height] duration-300 sm:px-8 lg:px-12 ${scrolled ? "h-[62px]" : "h-[76px]"}`}>
          <BrandMark />
          <nav className="hidden items-center gap-9 text-[13px] font-semibold text-[#51465a] md:flex">
            {[
              ["#menu", t.navMenu],
              ["#story", t.navStory],
              ["#how", t.navHow],
            ].map(([href, label]) => (
              <a key={href} href={href} className="nav-link transition-colors hover:text-[#712a82]">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="rounded-full px-3 py-2 text-xs font-bold text-[#51465a] transition hover:bg-[#f5f0f8] active:scale-90"
              aria-label="Change language"
            >
              {language === "en" ? "हि" : "EN"}
            </button>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-[#e1d4e7] px-4 py-2.5 text-xs font-bold transition hover:border-[#712a82] hover:text-[#712a82] active:scale-95 sm:flex"
            >
              {signedInPhone ? `+91 ${signedInPhone.slice(0, 2)}••••${signedInPhone.slice(-2)}` : t.account}
            </button>
            <button
              ref={bagButtonRef}
              type="button"
              onClick={() => setBagOpen(true)}
              aria-label={`Open bag, ${bagCount} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-[#712a82] text-white transition hover:scale-105 hover:bg-[#54205c] active:scale-90"
            >
              <span key={bagRing} className={`grid place-items-center ${bagRing ? "anim-bag-ring" : ""}`}>
                <ShoppingBag size={17} strokeWidth={2} />
              </span>
              {bagCount > 0 && (
                <span
                  key={bagCount}
                  className="anim-bump absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#35153b] px-1 text-[10px] font-bold"
                >
                  {bagCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#e1d4e7] md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="anim-drop grid gap-1 border-t border-[#e9e1ef] bg-[#fff] px-6 py-3 text-sm font-semibold md:hidden">
            <a className="rounded-lg px-3 py-2.5 transition hover:bg-[#f5f0f8]" href="#menu" onClick={() => setMenuOpen(false)}>{t.navMenu}</a>
            <a className="rounded-lg px-3 py-2.5 transition hover:bg-[#f5f0f8]" href="#story" onClick={() => setMenuOpen(false)}>{t.navStory}</a>
            <a className="rounded-lg px-3 py-2.5 transition hover:bg-[#f5f0f8]" href="#how" onClick={() => setMenuOpen(false)}>{t.navHow}</a>
            <button className="rounded-lg px-3 py-2.5 text-left transition hover:bg-[#f5f0f8]" onClick={() => { setMenuOpen(false); setAccountOpen(true); }}>{t.account}</button>
          </nav>
        )}
      </header>

      <section onMouseMove={trackPointer} className="hero-banner spotlight-section relative isolate overflow-hidden bg-gradient-to-br from-[#35113c] via-[#481454] to-[#2c1036] text-white">
        <div className="spotlight" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
          {[
            ["left-[8%] top-[18%]", "0ms"],
            ["left-[24%] top-[72%]", "500ms"],
            ["left-[42%] top-[12%]", "1000ms"],
            ["left-[58%] top-[84%]", "1500ms"],
            ["left-[74%] top-[22%]", "2000ms"],
            ["left-[91%] top-[65%]", "2500ms"],
          ].map(([position, delay]) => (
            <span
              key={position}
              className={`absolute ${position} h-1 w-1 rounded-full bg-[#f1d26a] opacity-70 blur-[1px] animate-bounce`}
              style={{ animationDelay: delay, animationDuration: "4s" }}
            />
          ))}
        </div>
        <div className="absolute -left-20 -top-32 h-72 w-72 rounded-full bg-[#a74eb8]/20 blur-3xl animate-pulse" aria-hidden="true" />
        <div className="anim-float-slow absolute -bottom-24 right-[30%] h-64 w-64 rounded-full bg-[#f1d26a]/10 blur-3xl" aria-hidden="true" />
        <div className="relative z-10 mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-16 lg:px-12 lg:py-20">
          <div className="max-w-[550px]">
            <div
              className="anim-fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85"
              style={d(100)}
            >
              <Sparkles size={13} className="animate-pulse text-[#f1d26a]" />
              {t.eyebrow}
            </div>
            <h1
              key={language}
              className="serif text-[clamp(3.55rem,7.8vw,6.65rem)] leading-[0.96] text-white"
            >
              <SplitText text={t.heroLineOne} delay={300} split={language === "en" ? "char" : "word"} />
              <br />
              <span className="relative inline-block">
                <SplitText text={t.heroLineTwo} delay={750} split="word" unitClassName="text-shimmer" />
                <span className="anim-draw absolute -bottom-1 left-0 -z-10 h-3 w-full -rotate-2 rounded-full bg-[#f1d26a]/35" />
              </span>
            </h1>
            <p
              className="anim-fade-up mt-7 max-w-[425px] text-[15px] leading-7 text-white/75 sm:text-base"
              style={d(450)}
            >
              {t.heroBody}
            </p>
            <div className="anim-fade-up mt-8 flex flex-wrap items-center gap-3" style={d(650)}>
              <a
                href="#menu"
                onMouseMove={magnet}
                onMouseLeave={unmagnet}
                className="magnetic btn-shine group inline-flex items-center gap-3 rounded-full bg-[#f1d26a] px-6 py-3.5 text-sm font-bold text-[#35153b] transition hover:-translate-y-0.5 hover:bg-[#f4dfa0] hover:shadow-[0_10px_30px_rgba(241,210,106,0.35)]"
              >
                {t.explore}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
              </a>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white/90 transition hover:bg-white/10"
              >
                See how it works <ArrowDown size={14} className="animate-bounce" />
              </a>
            </div>
            <div
              className="anim-fade-up mt-10 flex items-center gap-4 border-t border-white/20 pt-6"
              style={d(850)}
            >
              <div className="flex -space-x-2">
                {["🧑🏽‍🍳", "👩🏻‍🍳", "🧑🏾‍🍳"].map((face, i) => (
                  <span
                    key={face}
                    className="anim-pop-in grid h-9 w-9 place-items-center rounded-full border-2 border-[#35153b] bg-[#eee2f2] text-lg transition hover:z-10 hover:-translate-y-1 hover:scale-110"
                    style={{ animationDelay: `${1000 + i * 150}ms` }}
                  >
                    {face}
                  </span>
                ))}
              </div>
              <p className="text-xs leading-5 text-white/70">
                <span className="font-bold text-white">Made with care.</span>
                <br />
                From our kitchen to yours.
              </p>
            </div>
          </div>

          <div className="anim-fade-up parallax relative mx-auto w-full max-w-[650px]" style={d(300)}>
            <div className="absolute -right-5 -top-7 h-32 w-32 rounded-full bg-[#f1d26a]/20 blur-2xl sm:-right-8 sm:-top-9 sm:h-44 sm:w-44" />
            <div
              data-gsap-orbit
              className="pointer-events-none absolute inset-[3%_3%_12%] rounded-[48%] border border-dashed border-[#f1d26a]/60"
              aria-hidden="true"
            />
            <div
              className="food-photo soft-shadow anim-float relative z-10 aspect-[1.14/1] overflow-hidden rounded-[30px] bg-[#e5d6e9] sm:rounded-[40px]"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90')" }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/5" />
              <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-[#fff]/90 px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#51465a] sm:left-7 sm:top-7">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#698247] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#698247]" />
                </span>
                Good things, made fresh
              </div>
              <div className="absolute bottom-5 left-5 text-white sm:bottom-8 sm:left-8">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.17em] text-white/75">A little something for dinner</p>
                <p className="serif text-3xl sm:text-4xl">Ready when you are.</p>
              </div>
            </div>
            <div className="anim-float-slow soft-shadow absolute -bottom-6 right-1 z-20 flex items-center gap-3 rounded-2xl border border-white/80 bg-[#fff] p-3.5 sm:-right-7 sm:bottom-8 sm:p-4">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eee2f2] text-[#712a82]">
                <Clock3 size={19} />
              </span>
              <span>
                <span className="block text-xs font-bold text-[#35153b]">A little planning</span>
                <span className="mt-1 block text-[10px] text-[#766b7d]">Order 48 hours ahead</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="banner-marquee" aria-label="Marinades, kebabs, curries, quick food for easy life">
        <p className="sr-only">Marinades, kebabs, curries — quick food for easy life.</p>
        <div className="banner-marquee__track" aria-hidden="true">
          {[0, 1].map((group) => (
            <div className="banner-marquee__group" key={group}>
              <span>MARINADES</span><span>✦</span>
              <span>KEBABS</span><span>✦</span>
              <span>CURRIES</span><span>✦</span>
              <span>QUICK FOOD FOR EASY LIFE</span><span>✦</span>
            </div>
          ))}
        </div>
      </div>

      <section className="border-y border-[#e9e1ef] bg-[#f8f4fa]">
        <div className="mx-auto grid max-w-[1320px] grid-cols-2 divide-x divide-[#e1d4e7] px-5 py-5 sm:px-8 md:grid-cols-4 lg:px-12">
          {[
            ["01", "Small-batch", "Made with intention"],
            ["02", "Real ingredients", "Flavour comes first"],
            ["03", "Fresh or frozen", "Good food, your way"],
            ["04", "Easy ordering", "Right here or WhatsApp"],
          ].map(([number, title, caption], i) => (
            <Reveal key={number} delay={i * 100}>
              <div className="group flex items-center gap-3 px-3 py-3 sm:px-5">
                <span className="serif hidden text-xl text-[#712a82] transition duration-300 group-hover:scale-125 sm:block">{number}</span>
                <div>
                  <p className="text-xs font-bold text-[#35153b] sm:text-sm">{title}</p>
                  <p className="mt-1 text-[10px] text-[#766b7d] sm:text-[11px]">{caption}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="menu" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <Reveal className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-3 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.19em] text-[#712a82]">{t.ourPicks}</p>
            <h2 className="serif max-w-xl text-4xl leading-[1.06] sm:text-5xl">{t.browse}</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#766b7d]">{t.browseDescription}</p>
          </div>
          <a
            href={whatsAppUrl("Hello Mood Food! Please share your complete menu.")}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 self-start text-xs font-bold text-[#35153b] transition hover:text-[#712a82] md:self-auto"
          >
            {t.fullMenu}{" "}
            <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </Reveal>
        <Reveal delay={100} className="mb-7 flex flex-col gap-4 border-b border-[#e9e1ef] pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {productCategories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition duration-200 active:scale-95 ${
                  activeCategory === category
                    ? "bg-[#35153b] text-white shadow-[0_6px_16px_rgba(53,21,59,0.25)]"
                    : "border border-[#e9e1ef] bg-[#fff] text-[#51465a] hover:-translate-y-0.5 hover:border-[#897b90]"
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
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition duration-200 active:scale-95 ${
                vegetarianOnly
                  ? "border-[#71834f] bg-[#71834f] text-white"
                  : "border-[#e9e1ef] text-[#51465a] hover:bg-white"
              }`}
            >
              <Leaf size={13} className={vegetarianOnly ? "anim-wiggle" : ""} /> Veg
            </button>
            <button
              type="button"
              onClick={() => setFrozenOnly(!frozenOnly)}
              aria-pressed={frozenOnly}
              className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition duration-200 active:scale-95 ${
                frozenOnly
                  ? "border-[#507a8a] bg-[#507a8a] text-white"
                  : "border-[#e9e1ef] text-[#51465a] hover:bg-white"
              }`}
            >
              <Snowflake size={13} className={frozenOnly ? "animate-spin" : ""} style={{ animationDuration: "6s" }} /> Frozen
            </button>
          </div>
        </Reveal>
        {catalogPreview && (
          <p className="mb-5 rounded-xl border border-[#e9e1ef] bg-[#f8f4fa] px-4 py-3 text-[11px] leading-5 text-[#766b7d]">
            Showing the starter menu preview. The live catalogue will appear once the store database is connected.
          </p>
        )}

        {visibleProducts.length === 0 ? (
          <div className="anim-pop-in rounded-3xl border border-dashed border-[#e1d4e7] py-16 text-center text-sm text-[#766b7d]">
            No dishes in this combination just yet.{" "}
            <button
              type="button"
              className="font-bold text-[#712a82] underline underline-offset-2"
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
          <div
            key={`${activeCategory}-${vegetarianOnly}-${frozenOnly}`}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            {visibleProducts.map((product, index) => (
              <div key={product.id} style={d((index % 8) * 70)} className="anim-card-in h-full">
                <article onMouseMove={tiltCard} onMouseLeave={resetTilt} className="glow-card tilt-card group h-full overflow-hidden rounded-[23px] border border-[#e9e1ef] bg-[#fff] transition duration-300 hover:-translate-y-1.5">
                  <div className="img-skeleton relative aspect-[1.16/1] overflow-hidden">
                    <div
                      className="food-photo absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
                      style={{ backgroundImage: `url('${product.image}')`, backgroundPosition: product.imagePosition || "center" }}
                      role="img"
                      aria-label={`${product.name} dish`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-70" />
                    <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
                      {product.badge && (
                        <span className="rounded-full bg-[#fff]/95 px-2.5 py-1.5 text-[9px] font-bold text-[#51465a]">
                          {product.badge}
                        </span>
                      )}
                      {product.frozen && (
                        <span className="rounded-full bg-[#edf6f6] px-2.5 py-1.5 text-[9px] font-bold text-[#3d7482]">
                          Frozen
                        </span>
                      )}
                    </div>
                    <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-bold text-[#51465a]">
                      <span className={`h-2 w-2 rounded-[2px] border ${product.vegetarian ? "border-[#598647]" : "border-[#b14b3f]"}`}>
                        <span className={`m-[2px] block h-1 w-1 rounded-full ${product.vegetarian ? "bg-[#598647]" : "bg-[#b14b3f]"}`} />
                      </span>
                      {product.vegetarian ? "Vegetarian" : "Non-vegetarian"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white/95 text-[#35153b] opacity-0 shadow transition duration-300 hover:rotate-45 focus:translate-y-0 focus:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
                      aria-label={`More about ${product.name}`}
                    >
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#897b90]">{product.cuisine}</span>
                      <span className="text-[10px] text-[#766b7d]">{product.pack}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailProduct(product)}
                      className="text-left"
                    >
                      <h3 className="serif text-[21px] leading-tight text-[#35153b] transition-colors group-hover:text-[#712a82]">{product.name}</h3>
                    </button>
                    <p className="mt-2 min-h-[39px] text-[11px] leading-[1.65] text-[#766b7d]">{product.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-[#e9e1ef] pt-3.5">
                      <p className="text-sm font-extrabold text-[#35153b]">{formatPrice(product.price)} <span className="text-[10px] font-medium text-[#766b7d]">/ {product.pack}</span></p>
                      {bag[product.id] ? (
                        <span className="anim-pop-in flex items-center gap-2 rounded-full bg-[#f8f4fa] px-1.5 py-1">
                          <button type="button" onClick={() => updateBag(product.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white transition active:scale-75" aria-label={`Remove one ${product.name}`}><Minus size={12} /></button>
                          <span key={bag[product.id]} className="anim-bump min-w-[12px] text-center text-xs font-bold">{bag[product.id]}</span>
                          <button
                            type="button"
                            onClick={(e) => { flyToBag(e.currentTarget); updateBag(product.id, 1); }}
                            className="grid h-6 w-6 place-items-center rounded-full bg-[#712a82] text-white transition active:scale-75"
                            aria-label={`Add one ${product.name}`}
                          ><Plus size={12} /></button>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => { flyToBag(e.currentTarget); updateBag(product.id, 1); }}
                          className="grid h-8 w-8 place-items-center rounded-full border border-[#e1d4e7] text-[#35153b] transition duration-200 hover:rotate-90 hover:scale-110 hover:border-[#712a82] hover:bg-[#712a82] hover:text-white active:scale-90"
                          aria-label={`Add ${product.name} to bag`}
                        >
                          <Plus size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
        <Reveal className="mt-8">
          <div className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#f2eaf5] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#78834d]"><Check size={16} /></span>
              <p className="text-xs leading-5 text-[#51465a]">
                <span className="font-bold text-[#35153b]">A heads-up before you add to the bag:</span>{" "}
                minimum order {minimumOrderGrams / 1000} kg · please order at least {advanceOrderHours} hours ahead.
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-[#766b7d]">Prices shown in INR</span>
          </div>
        </Reveal>
      </section>

      <section id="how" onMouseMove={trackPointer} className="spotlight-section relative scroll-mt-24 overflow-hidden bg-gradient-to-b from-[#1d0a23] via-[#2a0f31] to-[#35153b] text-[#fff]">
        <div className="spotlight" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <Reveal>
            <p className="eyebrow mb-4 flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[#f5a524]">How it works</p>
            <h2 className="serif heading-gold max-w-3xl text-[clamp(2.4rem,5.5vw,4.4rem)] font-extrabold leading-[1.05]">Three steps to an easy dinner.</h2>
          </Reveal>

          <Reveal delay={150} className="relative mt-14 grid gap-12 sm:mt-16 sm:grid-cols-3 sm:gap-6">
            <span className="step-line pointer-events-none absolute left-[10%] right-[10%] top-8 hidden sm:block" aria-hidden="true" />
            {[
              ["1", "Choose", "Pick marinades, kebabs or curries. Add at least 1 kg in total."],
              ["2", "Schedule", "Choose a delivery day at least 48 hours ahead and order on the site or WhatsApp."],
              ["3", "Cook and enjoy", "Grill, pan-cook or heat. Pay by UPI and enjoy a lovely dinner."],
            ].map(([step, title, text], i) => (
              <Reveal key={step} delay={350 + i * 220} className="relative text-center">
                <span className="step-dot relative z-10 mx-auto grid h-16 w-16 place-items-center rounded-full text-xl font-extrabold text-[#2a0f31]">{step}</span>
                <h3 className="mt-5 text-lg font-bold">{title}</h3>
                <p className="mx-auto mt-2 max-w-[260px] text-sm leading-6 text-white/65">{text}</p>
              </Reveal>
            ))}
          </Reveal>

          <Reveal delay={200} className="mt-14 flex flex-col items-center gap-4 text-center sm:mt-16">
            <p className="max-w-md text-sm leading-7 text-white/65">Everything is made in small batches, so we ask for a little notice. You choose the good stuff; we take care of the flavour.</p>
            <a href={whatsAppUrl("Hi Mood Food! I'd like some help planning an order.")} target="_blank" rel="noopener noreferrer" className="btn-shine anim-glow-gold inline-flex items-center gap-2 rounded-full bg-[#edc967] px-6 py-3.5 text-xs font-bold text-[#35153b] transition hover:-translate-y-0.5 hover:bg-[#f4dfa0]">
              Plan an order with us <ArrowUpRight size={15} />
            </a>
          </Reveal>
        </div>
      </section>

      <section id="story" className="scroll-mt-24 mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:px-12 lg:py-24">
        <Reveal className="relative mx-auto w-full max-w-[550px]">
          <div className="food-photo relative aspect-[1.2/1] rounded-[26px] bg-[#eee2f2]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85')" }} role="img" aria-label="A home-cooked dinner being prepared">
            <div className="absolute bottom-4 left-4 w-[104px] overflow-hidden rounded-xl border-2 border-white/80 shadow-lg transition duration-300 hover:-rotate-3 hover:scale-105 sm:bottom-5 sm:left-5 sm:w-[120px]">
              <Image src="/brand/mood-food-logo.jpeg" alt="Mood Food brand logo" width={768} height={768} className="h-auto w-full" />
            </div>
          </div>
          <div className="anim-float absolute -bottom-4 -right-2 grid h-[116px] w-[116px] place-items-center rounded-full border-[5px] border-[#fff] bg-[#eee2f2] text-center sm:-right-4 sm:h-[136px] sm:w-[136px]">
            <div>
              <span className="block animate-spin text-2xl" style={{ animationDuration: "10s" }}>✳</span>
              <span className="mt-1 block text-[9px] font-extrabold uppercase leading-4 tracking-[0.12em] text-[#51465a]">Good food<br />good mood</span>
            </div>
          </div>
        </Reveal>
        <Reveal delay={150} className="max-w-lg pt-3 lg:pt-0">
          <p className="eyebrow mb-3 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.19em] text-[#712a82]">A bit about us</p>
          <h2 className="serif text-4xl leading-[1.08] sm:text-5xl">We make the good part of dinner <span className="italic text-[#712a82]">easy.</span></h2>
          <p className="mt-5 text-sm leading-7 text-[#766b7d]">A familiar craving. A long day. Friends turning up. Mood Food brings thoughtfully prepared marinades, kebabs and curries to the moments that deserve a little extra.</p>
          <p className="mt-4 text-sm leading-7 text-[#766b7d]">Real flavours, handy portions and a menu with both vegetarian and non-vegetarian favourites — ready for your table, on your time.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              ["Andhra", "Fiery, tangy and bold.", "#e0793a"],
              ["Lucknowi", "Soft, aromatic Awadhi flavours.", "#d9a62f"],
              ["Mughlai", "Rich, creamy and slow-cooked.", "#c0405a"],
              ["Made with care", "Small batches, real ingredients.", "#712a82"],
            ].map(([label, text, color], i) => (
              <div key={label} className="glow-card relative overflow-hidden rounded-2xl border border-[#e9e1ef] bg-white/70 p-4 transition duration-300 hover:-translate-y-1">
                <span className="cuisine-orb absolute -bottom-6 -right-6 h-20 w-20 rounded-full" style={{ background: color, animationDelay: `${i * 400}ms` }} aria-hidden="true" />
                <p className="relative text-sm font-bold text-[#35153b]">{label}</p>
                <p className="relative mt-1 text-[11px] leading-4 text-[#766b7d]">{text}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <Reveal>
          <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[26px] bg-[#f2eaf5]">
            <div className="absolute inset-0 grain opacity-40" />
            <div className="relative grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1fr_0.75fr] md:p-12 lg:px-16 lg:py-14">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#897b90]">Your freezer called</p>
                <h2 className="serif max-w-lg text-3xl leading-tight sm:text-4xl">Save a little room for a very good plan B.</h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-[#766b7d]">Our frozen-ready menu is getting ready for its moment. Until then, have a peek at what’s on the way.</p>
                <a href="#frozen-menu" className="btn-shine mt-6 inline-flex items-center gap-2 rounded-full bg-[#fff] px-5 py-3 text-xs font-bold text-[#35153b] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                  See what’s coming <ArrowDown size={14} className="animate-bounce" />
                </a>
              </div>
              <div id="frozen-menu" className="anim-float-slow relative mx-auto w-full max-w-[360px] rotate-1 overflow-hidden rounded-2xl shadow-[0_16px_45px_rgba(54,39,20,0.18)] transition duration-500 hover:rotate-0 hover:scale-[1.03]">
                <Image src="/brand/frozen-menu.png" alt="Mood Food frozen food menu, coming soon" width={720} height={900} className="h-auto w-full" />
                <div className="absolute right-3 top-3 animate-pulse rounded-full bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#358090] shadow">Coming soon</div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
        <Reveal>
          <div className="cta-flow relative overflow-hidden rounded-[28px] px-6 py-11 text-white sm:px-10 sm:py-14 lg:px-16">
            <div className="absolute -right-10 -top-24 h-72 w-72 animate-pulse rounded-full border-[1px] border-white/20" />
            <div className="anim-float-slow absolute -right-2 -top-16 h-56 w-56 rounded-full border-[1px] border-white/15" />
            <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">A good dinner is closer than you think</p>
                <h2 className="serif max-w-xl text-4xl leading-tight sm:text-5xl">{t.footerCta}</h2>
                <p className="mt-4 text-sm text-white/80">Tell us what you’re in the mood for. We’ll take it from there.</p>
              </div>
              <a href={whatsAppUrl("Hello Mood Food! I'd love to know what's on the menu.")} target="_blank" rel="noopener noreferrer" className="btn-shine group inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#fff] px-6 py-3.5 text-xs font-extrabold text-[#35153b] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)] md:self-auto">
                {t.footerButton} <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="border-t border-[#e9e1ef] bg-[#f9f6fb]">
        <div className="mx-auto grid max-w-[1320px] gap-10 px-5 py-12 sm:px-8 md:grid-cols-[1fr_auto_auto] lg:px-12">
          <div>
            <BrandMark compact />
            <p className="mt-4 max-w-xs text-xs leading-6 text-[#766b7d]">Quick food for easy life. Made with care, to bring a little more joy to the table.</p>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#51465a]">Explore</p>
            <div className="grid gap-3 text-xs text-[#766b7d]">
              <a href="#menu" className="transition hover:translate-x-1 hover:text-[#712a82]">Our menu</a>
              <a href="#story" className="transition hover:translate-x-1 hover:text-[#712a82]">About Mood Food</a>
              <a href="#how" className="transition hover:translate-x-1 hover:text-[#712a82]">How ordering works</a>
            </div>
          </div>
          <div>
            <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#51465a]">Say hello</p>
            <div className="grid gap-3 text-xs text-[#766b7d]">
              <a href={whatsAppUrl("Hello Mood Food!")} target="_blank" rel="noopener noreferrer" className="transition hover:translate-x-1 hover:text-[#712a82]">WhatsApp us</a>
              <a href="tel:+919599944745" className="transition hover:translate-x-1 hover:text-[#712a82]">+91 95999 44745</a>
              <a href="/admin" className="transition hover:translate-x-1 hover:text-[#712a82]">Admin</a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#e9e1ef] px-5 py-4 text-center text-[10px] text-[#766b7d]">
          © Mood Food. Made for good moods and good meals.
        </div>
      </footer>

      {bagOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" className="anim-fade-in absolute inset-0 bg-[#35153b]/50 backdrop-blur-[2px]" onClick={() => setBagOpen(false)} aria-label="Close shopping bag" />
          <aside className="anim-slide-right relative flex h-full w-full max-w-[440px] flex-col bg-[#fff] shadow-2xl" aria-label="Shopping bag">
            <div className="flex items-center justify-between border-b border-[#e9e1ef] px-5 py-5 sm:px-7">
              <div><p className="serif text-2xl">Your bag</p><p className="mt-1 text-[11px] text-[#766b7d]">{bagCount} {bagCount === 1 ? "item" : "items"}</p></div>
              <button type="button" onClick={() => setBagOpen(false)} aria-label="Close bag" className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e1ef] transition hover:rotate-90 hover:bg-[#f5f0f8]"><X size={17} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7">
              {bagItems.length === 0 ? (
                <div className="grid h-full content-center justify-items-center text-center">
                  <span className="anim-float grid h-16 w-16 place-items-center rounded-full bg-[#f4eff7] text-[#712a82]"><ShoppingBag size={24} /></span>
                  <p className="serif mt-5 text-2xl">A little space for something lovely.</p>
                  <p className="mt-2 text-xs text-[#766b7d]">Your bag is empty for now.</p>
                  <button type="button" onClick={() => setBagOpen(false)} className="btn-shine mt-6 rounded-full bg-[#712a82] px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 active:scale-95">Explore the menu</button>
                </div>
              ) : (
                <div className="divide-y divide-[#e9e1ef]">
                  {bagItems.map((product, i) => (
                    <div className="anim-fade-up flex items-center gap-3 py-4" style={d(i * 60)} key={product.id}>
                      <div className="food-photo h-[66px] w-[66px] shrink-0 rounded-xl bg-[#f2eaf5]" style={{ backgroundImage: `url('${product.image}')` }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{product.name}</p>
                        <p className="mt-1 text-[10px] text-[#766b7d]">{product.pack} · {formatPrice(product.price)}</p>
                        <div className="mt-2 flex w-fit items-center gap-3 rounded-full border border-[#e9e1ef] px-2 py-1">
                          <button type="button" className="transition active:scale-75" onClick={() => updateBag(product.id, -1)} aria-label={`Remove one ${product.name}`}><Minus size={12} /></button>
                          <span key={bag[product.id]} className="anim-bump text-[11px] font-bold">{bag[product.id]}</span>
                          <button type="button" className="transition active:scale-75" onClick={() => updateBag(product.id, 1)} aria-label={`Add one ${product.name}`}><Plus size={12} /></button>
                        </div>
                      </div>
                      <span className="text-xs font-bold">{formatPrice(product.price * bag[product.id])}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {bagItems.length > 0 && (
              <div className="border-t border-[#e9e1ef] bg-[#fff] px-5 py-5 sm:px-7">
                <div className="mb-3 flex justify-between text-sm"><span className="text-[#766b7d]">Subtotal</span><span key={bagTotal} className="anim-bump font-bold">{formatPrice(bagTotal)}</span></div>
                <p className={`mb-4 flex items-center gap-2 text-[11px] ${bagGrams >= minimumOrderGrams ? "text-[#637544]" : "text-[#897b90]"}`}>
                  {bagGrams >= minimumOrderGrams ? <Check size={14} className="anim-pop-in" /> : <ArrowLeft size={14} />}
                  {bagGrams >= minimumOrderGrams ? "Minimum order reached" : `${((minimumOrderGrams - bagGrams) / 1000).toFixed(1)} kg more to reach the 1 kg minimum`}
                </p>
                {checkoutOpen ? (
                  <form onSubmit={placeOrder} className="anim-fade-up grid gap-3">
                    <p className="mb-1 text-xs font-bold">Where should we bring it?</p>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">Your name
                      <input required minLength={2} maxLength={120} value={checkoutName} onChange={(event) => setCheckoutName(event.target.value)} className="rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" placeholder="Name for the order" />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">Mobile number
                      <div className="flex overflow-hidden rounded-lg border border-[#e9e1ef] bg-white transition focus-within:border-[#712a82] focus-within:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]"><span className="grid place-items-center border-r border-[#e9e1ef] px-2.5 text-[10px] text-[#766b7d]">+91</span><input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required value={checkoutPhone} onChange={(event) => setCheckoutPhone(event.target.value.replace(/\D/g, ""))} className="min-w-0 flex-1 px-3 py-2.5 text-xs outline-none" placeholder="10-digit mobile number" /></div>
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">Delivery address
                      <textarea required minLength={10} maxLength={2000} rows={2} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} className="resize-y rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" placeholder="House, street, area, city and postcode" />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">Preferred delivery time
                      <input type="datetime-local" required min={minimumDeliveryDateTimeLocal()} value={deliveryAt} onChange={(event) => setDeliveryAt(event.target.value)} className="rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">Anything else? <span className="font-normal text-[#766b7d]">(optional)</span>
                      <input maxLength={1000} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className="rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" placeholder="A delivery note or request" />
                    </label>
                    {orderError && <p role="alert" className="anim-shake rounded-lg bg-[#fbefeb] px-3 py-2 text-[10px] leading-4 text-[#815287]">{orderError}</p>}
                    <button type="submit" disabled={orderSubmitting} className="btn-shine mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                      {orderSubmitting ? "Saving your order…" : <>Place order & continue on WhatsApp <ArrowRight size={15} /></>}
                    </button>
                    <p className="text-center text-[10px] leading-4 text-[#766b7d]">We’ll confirm availability and UPI payment details in WhatsApp. No payment is taken here.</p>
                  </form>
                ) : (
                  <button type="button" onClick={orderOnWhatsApp} disabled={bagGrams < minimumOrderGrams} className={`btn-shine flex w-full items-center justify-center gap-2 rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#b9a7c2] ${bagGrams >= minimumOrderGrams ? "anim-glow" : ""}`}>
                    Add delivery details <ArrowRight size={15} />
                  </button>
                )}
                {!checkoutOpen && <p className="mt-3 text-center text-[10px] leading-4 text-[#766b7d]">Orders need at least {advanceOrderHours} hours’ notice. We’ll confirm your delivery slot in chat.</p>}
              </div>
            )}
          </aside>
        </div>
      )}

      {detailProduct && (
        <div className="anim-fade-in fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#35153b]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
          <div className="anim-pop-in relative my-auto grid w-full max-w-[720px] overflow-hidden rounded-[24px] bg-[#fff] shadow-2xl sm:grid-cols-2">
            <button type="button" onClick={() => setDetailProduct(null)} aria-label="Close product details" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 transition hover:rotate-90"><X size={17} /></button>
            <div className="food-photo anim-kenburns min-h-[230px] bg-[#f2eaf5] sm:min-h-[380px]" style={{ backgroundImage: `url('${detailProduct.image}')` }} />
            <div className="flex flex-col p-6 sm:p-8">
              <span className="anim-fade-up text-[10px] font-bold uppercase tracking-[0.15em] text-[#712a82]" style={d(100)}>{detailProduct.cuisine} · {detailProduct.category}</span>
              <h2 id="product-dialog-title" className="serif anim-fade-up mt-3 text-3xl" style={d(180)}>{detailProduct.name}</h2>
              <p className="anim-fade-up mt-3 text-sm leading-6 text-[#766b7d]" style={d(260)}>{detailProduct.description}</p>
              <div className="anim-fade-up mt-5 grid gap-2 rounded-xl bg-[#f9f6fb] p-4 text-xs text-[#51465a]" style={d(340)}>
                <p><span className="font-bold text-[#35153b]">Food type:</span> {detailProduct.vegetarian ? "Vegetarian" : "Non-vegetarian"}</p>
                <p><span className="font-bold text-[#35153b]">Storage:</span> {detailProduct.frozen ? "Keep frozen" : "Fresh"}</p>
                <p><span className="font-bold text-[#35153b]">Pack:</span> {detailProduct.pack}</p>
                {detailProduct.ingredients && <p><span className="font-bold text-[#35153b]">Ingredients:</span> {detailProduct.ingredients}</p>}
                {detailProduct.nutrition ? (
                  <p><span className="font-bold text-[#35153b]">Nutrition per pack:</span> {detailProduct.nutrition.caloriesKcal} kcal · {detailProduct.nutrition.proteinGrams} g protein · {detailProduct.nutrition.carbohydratesGrams} g carbohydrates · {detailProduct.nutrition.fatGrams} g fat</p>
                ) : (
                  <p className="pt-1 text-[10px] leading-4 text-[#766b7d]">Nutrition values are being confirmed for product packaging. Please ask us about dietary requirements before ordering.</p>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <span className="text-lg font-extrabold">{formatPrice(detailProduct.price)} <span className="text-[10px] font-medium text-[#766b7d]">/ {detailProduct.pack}</span></span>
                <button type="button" onClick={() => { updateBag(detailProduct.id, 1); setDetailProduct(null); setBagOpen(true); }} className="btn-shine inline-flex items-center gap-2 rounded-full bg-[#712a82] px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#54205c] active:scale-95"><Plus size={14} /> Add to bag</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accountOpen && (
        <div className="anim-fade-in fixed inset-0 z-[60] grid place-items-center bg-[#35153b]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
          <div className="anim-pop-in relative w-full max-w-[420px] rounded-[24px] bg-[#fff] p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={closeAccount} aria-label="Close sign in" className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[#e9e1ef] transition hover:rotate-90"><X size={16} /></button>
            <span className="anim-float grid h-12 w-12 place-items-center rounded-full bg-[#f4eff7] text-[#712a82]"><ShoppingBag size={20} /></span>

            {signedInPhone ? (
              <>
                <h2 id="account-dialog-title" className="serif mt-5 text-3xl">You’re signed in.</h2>
                <p className="mt-2 text-sm leading-6 text-[#766b7d]">Signed in as +91 {signedInPhone}.</p>
                <button
                  type="button"
                  onClick={closeAccount}
                  className="btn-shine mt-6 w-full rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98]"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                <h2 id="account-dialog-title" className="serif mt-5 text-3xl">Welcome back.</h2>
                <p className="mt-2 text-sm leading-6 text-[#766b7d]">
                  {otpSent
                    ? `Enter the 4-digit code for +91 ${phone}.`
                    : "Enter your mobile number and we’ll send you a one-time sign-in code."}
                </p>

                {!otpSent ? (
                  <form onSubmit={requestOtp} className="anim-fade-up mt-6">
                    <label htmlFor="mobile" className="mb-2 block text-xs font-bold text-[#51465a]">Mobile number</label>
                    <div className="flex overflow-hidden rounded-xl border border-[#e9e1ef] bg-white transition focus-within:border-[#712a82] focus-within:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]">
                      <span className="grid place-items-center border-r border-[#e9e1ef] px-3 text-xs font-semibold text-[#766b7d]">+91</span>
                      <input id="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" maxLength={10} required value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} placeholder="10-digit mobile number" className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" />
                    </div>
                    <button type="submit" disabled={otpLoading} className="btn-shine mt-4 w-full rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:opacity-60">{otpLoading ? "Sending…" : "Send sign-in code"}</button>
                    {otpMessage && <p role="status" className="anim-fade-up mt-3 rounded-xl bg-[#f9f6fb] p-3 text-xs leading-5 text-[#51465a]">{otpMessage}</p>}
                    <p className="mt-4 text-center text-[10px] leading-4 text-[#766b7d]">By continuing, you agree to receive a one-time verification code.</p>
                  </form>
                ) : (
                  <form onSubmit={verifyOtp} className="anim-fade-up mt-6">
                    {otpMessage && <p role="status" className="mb-4 rounded-xl bg-[#f9f6fb] p-3 text-xs leading-5 text-[#51465a]">{otpMessage}</p>}
                    <label htmlFor="otp" className="mb-2 block text-xs font-bold text-[#51465a]">4-digit code</label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      required
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))}
                      placeholder="1234"
                      className="w-full rounded-xl border border-[#e9e1ef] bg-white px-3 py-3 text-center text-lg font-bold tracking-[0.5em] outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]"
                    />
                    <button type="submit" disabled={otpLoading || otpCode.length !== 4} className="btn-shine mt-4 w-full rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:opacity-60">{otpLoading ? "Verifying…" : "Verify & sign in"}</button>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#712a82]">
                      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); setOtpMessage(""); }}>Change number</button>
                      <button type="button" disabled={otpLoading} onClick={() => void requestOtp()}>Resend code</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}