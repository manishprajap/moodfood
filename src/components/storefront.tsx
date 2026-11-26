"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Leaf,
  Mail,
  Menu,
  Minus,
  Phone,
  Plus,
  Quote,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  advanceOrderHours,
  formatPrice,
  minimumOrderGrams,
  products,
  type Product,
  whatsappNumber,
} from "@/lib/catalog";

type Bag = Record<string, number>;
type Promotion = { title: string; code: string | null; message: string };
type BulkOrderForm = {
  name: string;
  phone: string;
  deliveryDate: string;
  area: string;
  address: string;
  note: string;
};
export type StorefrontPage =
  | "home"
  | "products"
  | "about"
  | "whatsNew"
  | "whyUs"
  | "cuisines";

const cuisineFilters = ["Avadhi"] as const;

const translations = {
  en: {
    navProduct: "Our Product",
    navCuisines: "Cuisines",
    navStory: "About Us",
    navNew: "What's New",
    navWhy: "Why Us",
    navOrderNow: "Order Now",
    account: "My account",
    eyebrow: "Good food. A little less fuss.",
    heroLineOne: "Your kind of",
    heroLineTwo: "good food.",
    heroBody:
      "Small-batch marinades, kebabs and curries for the nights you want something lovely — without starting from scratch.",
    explore: "Find your new favourite",
    ourPicks: "Cuisines",
    browse: "Made for a very good meal.",
    browseDescription:
      "Real flavour, proper ingredients, and the sort of dinner that makes everyone ask for seconds.",
   /*  fullMenu: "Explore the full menu", */
    all: "Everything",
    footerCta: "Make room for a better dinner.",
    footerButton: "Chat with us",
  },
  hi: {
    navProduct: "हमारे उत्पाद",
    navCuisines: "व्यंजन",
    navStory: "हमारे बारे में",
    navNew: "नया क्या है",
    navWhy: "हमें क्यों चुनें",
    navOrderNow: "अभी ऑर्डर करें",
    account: "मेरा अकाउंट",
    eyebrow: "अच्छा खाना। थोड़ी कम मेहनत।",
    heroLineOne: "आपके मूड का",
    heroLineTwo: "अच्छा खाना।",
    heroBody:
      "छोटे बैच में बने मैरिनेड, कबाब और करी — उन शामों के लिए जब कुछ खास खाने का मन हो।",
    explore: "अपना पसंदीदा ढूंढें",
    ourPicks: "व्यंजन",
    browse: "हर खाने को खास बनाएं।",
    browseDescription:
      "असली स्वाद, बेहतरीन सामग्री और ऐसा डिनर जिसे सब दोबारा मांगें।",
   /*  fullMenu: "पूरा मेन्यू देखें", */
    all: "सब कुछ",
    footerCta: "आज कुछ खास बनाइए।",
    footerButton: "हमसे बात करें",
  },
} as const;

const contact = {
  phoneDisplay: "+91 95999 44745",
  phoneHref: "tel:+919599944745",
  instagram: "https://www.instagram.com/mood.foodworld",
  // TODO: replace with the real Mood Food Facebook page link
  facebook: "https://www.facebook.com/",
} as const;

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.94 9.94 0 1 0 12.04 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.08.89.9-3-.2-.31a8.12 8.12 0 1 1 6.81 3.73Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06a6.6 6.6 0 0 1-1.95-1.2 7.3 7.3 0 0 1-1.35-1.69c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.2v2.6H7.6v3.3h2.8V22h3.1Z" />
    </svg>
  );
}

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
function GlobalParticleField() {
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

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      className="flex h-[60px] items-center"
      href="/"
      aria-label="Mood Food home"
    >
      <Image
        src="/brand/mood-food-logo-transparent.png"
        alt="Mood Food — Marinades, Kebabs, Curries"
        width={532}
        height={426}
        className={compact ? "h-[52px] w-auto" : "h-[58px] w-auto"}
        priority={!compact}
      />
    </Link>
  );
}

function FssaiMark() {
  return (
    <span className="inline-flex shrink-0 items-center">
      <svg
        viewBox="0 0 160 62"
        width="128"
        height="50"
        role="img"
        aria-label="FSSAI State License"
      >
        <ellipse cx="80" cy="24" rx="72" ry="22" fill="#fff" stroke="#c8c8c8" strokeWidth="1.5" />
        <text
          x="80"
          y="33"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="29"
          fontStyle="italic"
          fill="#243c91"
        >
          fssai
        </text>
        <path d="M124 12c5-7 11-7 15-6-2 6-7 10-15 9" fill="#268f58" />
        <path d="M137 5c1-3 3-4 5-5" fill="none" stroke="#df8b2f" strokeWidth="2" />
        <text
          x="80"
          y="59"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="#f6dc9a"
        >
          FSSAI STATE LICENSE
        </text>
      </svg>
    </span>
  );
}

function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

const heroSlides = [
  {
    tag: "Good food. A little less fuss.",
    lineOne: "Your kind of",
    lineTwo: "good food.",
    body: "Small-batch marinades, kebabs and curries for the nights you want something lovely — without starting from scratch.",
    cta: "Find your new favourite",
    href: "#menu",
    image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90",
    badge: "Good things, made fresh",
    caption: "A little something for dinner",
    quote: "Ready when you are.",
  },
  {
    tag: "Kebabs",
    lineOne: "Smoky, tender,",
    lineTwo: "kebab nights.",
    body: "Haryali, tikka, shammi and seekh — grill or pan-cook in minutes and bring the tandoor home.",
    cta: "Explore kebabs",
    href: "#menu",
    image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1400&q=90",
    badge: "Hot, fresh & ready",
    caption: "Straight off the grill",
    quote: "Char, spice, repeat.",
  },
  {
    tag: "Curries",
    lineOne: "Rich curries,",
    lineTwo: "zero stress.",
    body: "Slow-simmered gravies like Mughlai chicken curry — heat, add a naan and dinner is done.",
    cta: "Explore curries",
    href: "#menu",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1400&q=90",
    badge: "Comfort in a bowl",
    caption: "Slow-simmered flavour",
    quote: "Heat. Serve. Smile.",
  },
  {
    tag: "Marinades",
    lineOne: "Marinated and",
    lineTwo: "ready to cook.",
    body: "Andhra-style and classic marinades, ready for your pan, oven or grill — all the flavour, none of the prep.",
    cta: "Explore marinades",
    href: "#menu",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=90",
    badge: "Flavour, locked in",
    caption: "Small-batch marinades",
    quote: "Just add fire.",
  },
  {
    tag: "Order now",
    lineOne: "Hot, fresh &",
    lineTwo: "ready for your mood.",
    body: "Order on the site or message us on WhatsApp at 95998 44475 — at least 1 kg, 48 hours ahead.",
    cta: "Chat on WhatsApp",
    href: "whatsapp",
    image: "/brand/banner-poster.jpeg",
    badge: "@mood.foodworld",
    caption: "Quick food for easy life",
    quote: "Your mood, our kitchen.",
    contain: true,
  },
] as const;

function HeroSlider() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const total = heroSlides.length;

  const go = useCallback((index: number) => setActive((index + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % total), 5500);
    return () => window.clearInterval(timer);
  }, [paused, total, active]);

  return (
    <section
      className="hero-banner relative"
      aria-roledescription="carousel"
      aria-label="Mood Food highlights"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        if (Math.abs(delta) > 45) go(active + (delta < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* Full-width background banners */}
      <div className="hero-bgs" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <div key={slide.tag} className={`hero-bg ${index === active ? "is-active" : ""}`}>
            <div
              className={`hero-bg-photo ${"contain" in slide && slide.contain ? "is-blurred" : ""}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            {"contain" in slide && slide.contain && (
              <div
                className="hero-poster absolute inset-y-8 right-[5%] hidden w-[40%] lg:block"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
            )}
            <div className="hero-bg-overlay" />
          </div>
        ))}
      </div>
      <ParticleField />

      <div className="mx-auto flex min-h-[400px] max-w-[1320px] flex-col justify-between px-5 pb-5 pt-8 sm:min-h-[420px] sm:px-8 sm:pt-9 lg:min-h-[430px] lg:px-12 lg:pt-9">
        <div className="hero-stage">
          {heroSlides.map((slide, index) => {
            const isActive = index === active;
            const href = slide.href === "whatsapp" ? whatsAppUrl("Hello Mood Food! I'd like to place an order.") : slide.href;
            return (
              <div
                key={slide.tag}
                className={`hero-slide ${isActive ? "is-active" : ""}`}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${total}`}
                aria-hidden={!isActive}
              >
                <div className="hero-copy max-w-[560px]">
                  <div className="hero-anim mb-3 inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#ffffff]/15 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm" style={{ "--d": "0.05s" } as React.CSSProperties}>
                    <Sparkles size={13} className="text-white" />
                    {slide.badge}
                  </div>
                  <h1 className="hero-anim serif text-[clamp(2rem,4.2vw,3.7rem)] leading-[1.02] text-white" style={{ "--d": "0.15s" } as React.CSSProperties}>
                    {slide.lineOne}
                    <br />
                    <span className="hero-underline relative inline-block text-[#f6dc9a]">{slide.lineTwo}</span>
                  </h1>
                  <p className="hero-anim mt-4 max-w-[460px] text-[15px] leading-7 text-white/90 sm:text-base" style={{ "--d": "0.28s" } as React.CSSProperties}>{slide.body}</p>
                  <div className="hero-anim mt-5 flex flex-wrap items-center gap-3" style={{ "--d": "0.4s" } as React.CSSProperties}>
                    <a
                      href={href}
                      tabIndex={isActive ? 0 : -1}
                      {...(slide.href === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex items-center gap-3 rounded-full bg-[#ffffff] px-6 py-3.5 text-sm font-bold text-[#4a2477] transition hover:-translate-y-0.5 hover:bg-[#f6dc9a]"
                    >
                      {slide.cta}
                      <ArrowRight size={16} />
                    </a>
                    <a href="#how" tabIndex={isActive ? 0 : -1} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ffffff]/15">
                      See how it works <ArrowDown size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(active - 1)} aria-label="Previous banner" className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-[#000000]/20 text-white backdrop-blur-sm transition hover:bg-[#ffffff] hover:text-[#4a2477]"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => go(active + 1)} aria-label="Next banner" className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-[#000000]/20 text-white backdrop-blur-sm transition hover:bg-[#ffffff] hover:text-[#4a2477]"><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-2" role="tablist" aria-label="Choose banner">
            {heroSlides.map((slide, index) => (
              <button
                key={slide.tag}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Show banner ${index + 1}`}
                onClick={() => go(index)}
                className={`hero-dot ${index === active ? "is-active" : ""}`}
              >
                <span key={`${index}-${active}`} className="hero-dot-fill" style={{ animationPlayState: paused ? "paused" : "running" }} />
              </button>
            ))}
          </div>
          <p className="hidden text-xs font-semibold text-white/80 sm:block">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <div className="ml-auto hidden items-center gap-3 rounded-2xl border border-white/30 bg-[#3a1462]/70 p-3 backdrop-blur-md md:flex">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffffff]/15 text-white"><Clock3 size={18} /></span>
            <span>
              <span className="block text-xs font-bold text-white">A little planning</span>
              <span className="mt-0.5 block text-[10px] text-white/75">Order 48 hours ahead</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.19em] text-[#a97b1e]">{eyebrow}</p>
      <h2 className="serif text-4xl leading-[1.08] text-[#4a2477] sm:text-5xl">{title}</h2>
      {text && <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#6e5a86]">{text}</p>}
    </div>
  );
}

function WhatsNew() {
  const items = [
    { tag: "Coming soon", title: "Our frozen-ready menu", text: "Cook straight from the freezer. Frozen kebabs and snacks are on their way.", href: "#frozen-menu" },
    { tag: "New", title: "Order right on the site", text: "Build your bag, pick a delivery slot and confirm on WhatsApp in a minute.", href: "#menu" },
    { tag: "Fresh batch", title: "Awadhi shammi & rustic seekh", text: "Soft Lucknowi shammi and juicy chicken seekh, now on the menu.", href: "#menu" },
  ];
  return (
    <section id="whats-new" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <SectionHead eyebrow="Fresh off the kitchen" title="What's new at Mood Food" />
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <a key={item.title} href={item.href} className="group relative overflow-hidden rounded-[24px] border border-[#e9c46a]/40 bg-[#ffffff] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(74,36,119,0.14)]">
            <span className="inline-flex rounded-full bg-[#4a2477] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f6dc9a]">{item.tag}</span>
            <h3 className="serif mt-5 text-2xl leading-tight text-[#4a2477]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#6e5a86]">{item.text}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#a97b1e] transition group-hover:gap-3">Take a look <ArrowUpRight size={14} /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

function WhyUs() {
  const reasons = [
    { icon: ChefHat, title: "Small-batch cooking", text: "Made in careful batches, so every pack tastes like it was made for you." },
    { icon: Leaf, title: "Real ingredients", text: "Proper spices, fresh herbs and honest marinades. Flavour comes first." },
    { icon: Truck, title: "Delivered to you", text: "We deliver around Gurugram & Noida, right on the day you choose." },
    { icon: ShieldCheck, title: "Easy and reliable", text: "Order on the site or WhatsApp, pay by UPI and get your invoice." },
  ];
  return (
    <section id="why" className="scroll-mt-24 bg-gradient-to-b from-[#fffaf0] via-[#fbefcc] to-[#fffaf0]">
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <SectionHead eyebrow="Why Mood Food" title="Good food, without the fuss." text="Everything we make is built around one idea: a really good dinner should be easy." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-[24px] border border-[#e9c46a]/40 bg-[#ffffff]/80 p-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#5b2a91] to-[#8a5cc4] text-[#f6dc9a] ring-4 ring-[#e9c46a]/30"><Icon size={22} /></span>
              <h3 className="mt-5 text-base font-bold text-[#4a2477]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6e5a86]">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  // Sample reviews: replace with real customer reviews.
  const reviews = [
    { name: "Priya S.", area: "Gurugram", text: "The Haryali kebab was a hit at our dinner party. Ten minutes on the pan and everyone asked for the recipe!" },
    { name: "Rahul M.", area: "Noida", text: "Ordering on WhatsApp was so easy. The Andhra chicken marinade had real flavour, and nothing tasted like a shortcut." },
    { name: "Ananya K.", area: "Gurugram", text: "Mughlai chicken curry on a busy weeknight is a lifesaver. Heat, add naan, done." },
  ];
  return (
    <section id="testimonials" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <SectionHead eyebrow="Kind words" title="Loved at tables around town" />
      <div className="grid gap-5 md:grid-cols-3">
        {reviews.map((review) => (
          <figure key={review.name} className="relative rounded-[24px] border border-[#e9c46a]/40 bg-[#ffffff] p-7">
            <Quote size={34} className="absolute right-6 top-6 text-[#e9c46a]/60" aria-hidden="true" />
            <div className="flex gap-1 text-[#e0a923]" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <blockquote className="mt-4 text-sm leading-7 text-[#4a3b63]">“{review.text}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#4a2477] text-sm font-bold text-[#f6dc9a]">{review.name[0]}</span>
              <span>
                <span className="block text-sm font-bold text-[#4a2477]">{review.name}</span>
                <span className="block text-[11px] text-[#6e5a86]">{review.area}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = [
    ["What is the minimum order?", "Please add at least 1 kg in total. You can mix marinades, kebabs and curries."],
    ["How early should I order?", "Choose a delivery day at least 48 hours ahead so we can prepare your order fresh."],
    ["Where do you deliver?", "We deliver around Gurugram & Noida. Message us on WhatsApp if you're unsure about your area."],
    ["How do I pay?", "No payment is taken on the site. We confirm your order on WhatsApp, you pay by UPI and get your invoice."],
    ["Do you have vegetarian options?", "Yes! Use the Veg filter in the menu to see all vegetarian kebabs, snacks and more."],
    ["How do I cook the food?", "Grill, pan-cook or heat. Each pack is made to be quick and easy."],
  ];
  return (
    <section id="faq" className="scroll-mt-24 mx-auto max-w-[900px] px-5 py-16 sm:px-8 sm:py-20">
      <SectionHead eyebrow="Questions" title="Frequently asked questions" />
      <div className="grid gap-3">
        {faqs.map(([question, answer], index) => {
          const isOpen = open === index;
          return (
            <div key={question} className={`rounded-2xl border bg-[#ffffff] transition ${isOpen ? "border-[#e9c46a]" : "border-[#e9c46a]/40"}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
                <span className="text-sm font-bold text-[#4a2477] sm:text-base">{question}</span>
                <ChevronDown size={18} className={`shrink-0 text-[#a97b1e] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-7 text-[#6e5a86] sm:px-6">{answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks() {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const steps = [
    ["1", "Choose", "Pick marinades, kebabs or curries. Add at least 1 kg in total."],
    ["2", "Schedule", "Choose a delivery day at least 48 hours ahead and send the order on the site or WhatsApp."],
    ["3", "Cook and enjoy", "Grill, pan-cook or heat. Pay by UPI and get your invoice."],
  ];

  return (
    <section id="how" ref={ref} className={`how-section scroll-mt-24 ${seen ? "is-visible" : ""}`}>
      <ParticleField />
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="how-heading">
          <div className="mb-4 flex items-center gap-3">
            <span className="how-eyebrow-line" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a97b1e]">How it works</p>
          </div>
          <h2 className="serif text-4xl leading-[1.08] text-[#fff] sm:text-5xl lg:text-6xl">Three steps to an easy dinner.</h2>
        </div>
        <div className="step-track relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {steps.map(([step, title, text]) => (
            <article key={step} className="how-step relative z-10 text-center">
              <span className="how-step-number mx-auto grid h-[68px] w-[68px] place-items-center rounded-full text-2xl font-extrabold text-[#fff]">
                {step}
              </span>
              <h3 className="mt-5 text-lg font-bold text-[#fff]">{title}</h3>
              <p className="mx-auto mt-2 max-w-[330px] text-sm leading-6 text-[#fff]">{text}</p>
            </article>
          ))}
        </div>
        <div className="how-cta mt-10 text-center">
          <a href={whatsAppUrl("Hi Mood Food! I'd like some help planning an order.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#4a2477] px-5 py-3 text-xs font-bold text-[#f6dc9a] transition hover:-translate-y-0.5 hover:bg-[#3a1462]">
            Plan an order with us <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Cuisines() {
  const cuisines = [
    ["Andhra", "Fiery, tangy and bold.", "#e0793a"],
    ["Lucknowi", "Soft, aromatic Awadhi flavours.", "#d9a62f"],
    ["Mughlai", "Rich, creamy and slow-cooked.", "#c0405a"],
    ["Made with care", "Small batches, real ingredients.", "#712a82"],
  ];

  return (
    <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <SectionHead
        eyebrow="A little something for every mood"
        title="Explore our cuisines"
        text="Discover the regional flavours behind our small-batch menu."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cuisines.map(([label, text, color], index) => (
          <article
            key={label}
            className="glow-card relative overflow-hidden rounded-2xl border border-[#e9c46a]/40 bg-white/80 p-6 transition duration-300 hover:-translate-y-1"
          >
            <span
              className="cuisine-orb absolute -bottom-6 -right-6 h-20 w-20 rounded-full"
              style={{ background: color, animationDelay: `${index * 400}ms` }}
              aria-hidden="true"
            />
            <h2 className="relative text-lg font-bold text-[#35153b]">{label}</h2>
            <p className="relative mt-2 text-sm leading-6 text-[#766b7d]">{text}</p>
            <Link
              href="/products"
              className="relative mt-5 inline-flex text-xs font-bold text-[#712a82] hover:text-[#a97b1e]"
            >
              Explore products <ArrowRight size={14} className="ml-1" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Storefront({ page = "home" }: { page?: StorefrontPage }) {
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [catalogPreview, setCatalogPreview] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Avadhi");
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [frozenOnly, setFrozenOnly] = useState(false);
  const [bag, setBag] = useState<Bag>({});
  const [bulkForm, setBulkForm] = useState<BulkOrderForm>({
    name: "",
    phone: "",
    deliveryDate: "",
    area: "Gurugram",
    address: "",
    note: "",
  });
  const [bulkError, setBulkError] = useState("");
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
  const [bagRing, setBagRing] = useState(0);
  const bagButtonRef = useRef<HTMLButtonElement>(null);
  const t = translations[language];
  const isHome = page === "home";
  const showProducts = isHome || page === "products";
  const showAbout = isHome || page === "about";
  const navLinks = [
    { href: "/why-us", label: t.navWhy, page: "whyUs" },
    { href: "/cuisines", label: t.navCuisines, page: "cuisines" },
    { href: "/products", label: t.navProduct, page: "products" },
    { href: "/about-us", label: t.navStory, page: "about" },
    { href: "/whats-new", label: t.navNew, page: "whatsNew" },
  ];

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

  const visibleProducts = useMemo(
    () =>
      catalog.filter(
        (product) =>
          (activeCategory === "Avadhi" || product.category === activeCategory) &&
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

  function placeBulkOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBulkError("");

    const requestedDeliveryAt = new Date(`${bulkForm.deliveryDate}T23:59:00`);
    if (
      Number.isNaN(requestedDeliveryAt.getTime()) ||
      requestedDeliveryAt.getTime() < new Date(minimumDeliveryDateTimeLocal()).getTime()
    ) {
      setBulkError(`Please choose a delivery date at least ${advanceOrderHours} hours ahead.`);
      return;
    }

    const message = `Hi Mood Food, I’d like to enquire about a bulk order.\nRequested delivery date: ${requestedDeliveryAt.toLocaleDateString("en-IN")}\nDelivery time: Please confirm with Mood Food\nArea: ${bulkForm.area}\nName: ${bulkForm.name}\nPhone: +91 ${bulkForm.phone}\nAddress: ${bulkForm.address}\n${bulkForm.note.trim() ? `Note: ${bulkForm.note.trim()}\n` : ""}I’ll share the products and quantities in this chat. Please confirm availability and share UPI payment details.`;
    window.location.assign(whatsAppUrl(message));
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
    <main id={isHome ? "home" : undefined} className="overflow-hidden">
      <ScrollProgress />
      <GlobalParticleField />
      <div className="border-y border-[#e9c46a]/50 bg-gradient-to-r from-[#fffaf0] via-[#fbefcc] to-[#fffaf0]">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-2 px-5 py-2 text-[11px] font-medium tracking-wide sm:px-8 md:flex-row lg:px-12">
          <p className="hidden text-center md:block md:text-left">
            {promotion ? (
              <>
                <span className="font-bold text-[#5b2a91]">{promotion.title}</span>
                <span className="mx-2 text-[#3a1462]/50">·</span>
                {promotion.message}
                {promotion.code && <span className="ml-2 rounded bg-[#ffffff]/60 px-2 py-1 font-bold text-[#3a1462]">{promotion.code}</span>}
              </>
            ) : (
              <>A little more delicious, delivered around Gurugram &amp; Noida{" "}
                <span className="mx-1 text-[#7a4cb0]">✳</span> Order at least{" "}
                {minimumOrderGrams / 1000} kg, 48 hours ahead</>
            )}
          </p>
          <div className="flex items-center gap-4 sm:gap-5">
            <a href={contact.phoneHref} className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label={`Call Mood Food on ${contact.phoneDisplay}`}>
              <Phone size={14} /> {contact.phoneDisplay}
            </a>
            <span className="h-4 w-px bg-[#3a1462]/25" aria-hidden="true" />
            <a href={whatsAppUrl("Hello Mood Food!")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label="Chat with Mood Food on WhatsApp">
              <WhatsAppIcon /> <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label="Mood Food on Instagram">
              <InstagramIcon /> <span className="hidden sm:inline">Instagram</span>
            </a>
            <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label="Mood Food on Facebook">
              <FacebookIcon /> <span className="hidden sm:inline">Facebook</span>
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-[#f6dc9a]/30 bg-[#542670]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <BrandMark />
            <FssaiMark />
          </div>
          <nav className="hidden items-center gap-6 text-[13px] font-semibold text-white xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={page === link.page ? "page" : undefined}
                className="whitespace-nowrap transition-colors hover:text-[#f6dc9a]"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/products" className="whitespace-nowrap rounded-full bg-[#f6dc9a] px-4 py-2 text-[#4a2477] transition hover:bg-white">
              {t.navOrderNow}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="rounded-full px-3 py-2 text-xs font-bold text-white transition hover:bg-[#ffffff]/15"
              aria-label="Change language"
            >
              {language === "en" ? "हि" : "EN"}
            </button>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-[#ffffff]/40 px-4 py-2.5 text-xs font-bold text-white transition hover:border-[#f6dc9a] hover:text-[#f6dc9a] sm:flex"
            >
              {signedInPhone ? `+91 ${signedInPhone.slice(0, 2)}••••${signedInPhone.slice(-2)}` : t.account}
            </button>
            <button
              ref={bagButtonRef}
              type="button"
              onClick={() => setBagOpen(true)}
              aria-label={`Open bag, ${bagCount} items`}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-[#f6dc9a] text-[#4a2477] transition hover:bg-[#ffffff]"
            >
              <span key={bagRing} className={`grid place-items-center ${bagRing ? "anim-bag-ring" : ""}`}>
                <ShoppingBag size={17} strokeWidth={2} />
              </span>
              {bagCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#4a2477] px-1 text-[10px] font-bold text-white">
                  {bagCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ffffff]/40 text-white xl:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="grid gap-1 border-t border-[#f6dc9a]/30 bg-[#5a1030] px-6 py-3 text-sm font-semibold text-white xl:hidden">
            {navLinks.map((link) => (
              <Link key={link.href} className="rounded-lg px-3 py-2.5" href={link.href} aria-current={page === link.page ? "page" : undefined} onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
            <Link className="rounded-lg bg-[#f6dc9a] px-3 py-2.5 font-bold text-[#4a2477]" href="/products" onClick={() => setMenuOpen(false)}>{t.navOrderNow}</Link>
            <button className="rounded-lg px-3 py-2.5 text-left" onClick={() => { setMenuOpen(false); setAccountOpen(true); }}>{t.account}</button>
          </nav>
        )}
      </header>

      {isHome && <HeroSlider />}
      {isHome && (
        <div
          id="mq"
          className="menu-marquee"
          role="region"
          aria-label="Featured dishes"
        >
          <p className="sr-only">{catalog.map((product) => product.name).join(", ")}</p>
          <div
            className="menu-marquee__track"
            style={{ animation: "menu-marquee-scroll 28s linear infinite" }}
            aria-hidden="true"
          >
            {[0, 1].map((group) => (
              <div className="menu-marquee__group" key={group}>
                {catalog.map((product) => (
                  <span className="menu-marquee__item" key={product.id}>
                    {product.name}
                    <span className="menu-marquee__separator">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {isHome && (
        <section className="border-y border-[#e9c46a]/50 bg-gradient-to-r from-[#fffaf0] via-[#fbefcc] to-[#fffaf0]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 divide-x divide-[#ded7cb] px-5 py-5 sm:px-8 md:grid-cols-4 lg:px-12">
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
      )}

      {showProducts && (
        <section id="menu" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <Reveal className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-3 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.19em] text-[#712a82]">{t.ourPicks}</p>
              <h2 className="serif max-w-xl text-4xl leading-[1.06] sm:text-5xl">{t.browse}</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#766b7d]">{t.browseDescription}</p>
            </div>
            {/* <a
              href={whatsAppUrl("Hello Mood Food! Please share your complete menu.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 self-start text-xs font-bold text-[#35153b] transition hover:text-[#712a82] md:self-auto"
            >
              {t.fullMenu}{" "}
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a> */}
          </Reveal>
          <Reveal delay={100} className="mb-7 flex flex-col gap-4 border-b border-[#e9e1ef] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {cuisineFilters.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition duration-200 active:scale-95 ${activeCategory === category
                      ? "bg-[#35153b] text-white shadow-[0_6px_16px_rgba(53,21,59,0.25)]"
                      : "border border-[#e9e1ef] bg-[#fff] text-[#51465a] hover:-translate-y-0.5 hover:border-[#897b90]"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVegetarianOnly(!vegetarianOnly)}
                aria-pressed={vegetarianOnly}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition duration-200 active:scale-95 ${vegetarianOnly
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
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition duration-200 active:scale-95 ${frozenOnly
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
                  setActiveCategory("Avadhi");
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
      )}

      {showProducts && (
        <section id="order" className="scroll-mt-24 bg-[#fbf8f2] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1320px]">
            <Reveal className="mb-10 max-w-2xl">
              <p className="eyebrow mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#712a82]">Bulk ordering</p>
              <h2 className="serif text-4xl leading-[1.06] text-[#35153b] sm:text-5xl">Let’s plan your bulk order.</h2>
              <p className="mt-4 text-sm leading-6 text-[#766b7d]">
                Share your delivery details and we’ll help arrange your bulk order on WhatsApp.
              </p>
            </Reveal>

            <form onSubmit={placeBulkOrder} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-[#e9e1ef] bg-white p-5 sm:p-7">
                <h3 className="serif mb-6 text-2xl text-[#35153b]">Delivery details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bulk-name" className="mb-1.5 block text-xs font-bold text-[#51465a]">Name</label>
                    <input
                      id="bulk-name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={120}
                      value={bulkForm.name}
                      onChange={(event) => setBulkForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-phone" className="mb-1.5 block text-xs font-bold text-[#51465a]">Mobile number</label>
                    <input
                      id="bulk-phone"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      minLength={10}
                      placeholder="98XXXXXXXX"
                      required
                      value={bulkForm.phone}
                      onChange={(event) => setBulkForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-date" className="mb-1.5 block text-xs font-bold text-[#51465a]">Delivery date (48 hours ahead)</label>
                    <input
                      id="bulk-date"
                      type="date"
                      required
                      value={bulkForm.deliveryDate}
                      onChange={(event) => setBulkForm((current) => ({ ...current, deliveryDate: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-area" className="mb-1.5 block text-xs font-bold text-[#51465a]">Area</label>
                    <select
                      id="bulk-area"
                      value={bulkForm.area}
                      onChange={(event) => setBulkForm((current) => ({ ...current, area: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    >
                      <option>Gurugram</option>
                      <option>Noida</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="bulk-address" className="mb-1.5 block text-xs font-bold text-[#51465a]">Address</label>
                    <input
                      id="bulk-address"
                      autoComplete="street-address"
                      required
                      minLength={10}
                      maxLength={2000}
                      value={bulkForm.address}
                      onChange={(event) => setBulkForm((current) => ({ ...current, address: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="bulk-note" className="mb-1.5 block text-xs font-bold text-[#51465a]">Additional note (optional)</label>
                    <textarea
                      id="bulk-note"
                      maxLength={500}
                      rows={3}
                      value={bulkForm.note}
                      onChange={(event) => setBulkForm((current) => ({ ...current, note: event.target.value }))}
                      className="w-full resize-y rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                </div>
                <p className="mt-5 text-[11px] leading-5 text-[#766b7d]">
                  Payment is by UPI. We’ll share payment details on WhatsApp after confirming your order.
                </p>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-[#e9e1ef] bg-[#35153b] sm:min-h-[520px] lg:min-h-[640px]">
                <Image
                  src="/brand/banner-poster.jpeg"
                  alt="Mood Food kebabs and curries"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover object-[center_48%]"
                />
              </div>

              <div className="lg:col-span-2">
                {bulkError && (
                  <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{bulkError}</p>
                )}
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#712a82] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#35153b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send bulk request on WhatsApp
                  <ArrowUpRight size={16} />
                </button>
                <p className="mt-3 text-[11px] leading-5 text-[#766b7d]">WhatsApp opens with your delivery details. Share product names and quantities there; we’ll confirm your order with you.</p>
              </div>
            </form>
          </div>
        </section>
      )}

      {(isHome || page === "whyUs") && <WhyUs />}
      {(isHome || page === "whatsNew") && <WhatsNew />}

      {isHome && <HowItWorks />}

      {showAbout && (
        <section id="story" className="scroll-mt-24 mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:px-12 lg:py-24">
          <Reveal className="relative mx-auto w-full max-w-[550px]">
            <div className="food-photo relative aspect-[1.2/1] rounded-[26px] bg-[#e8ddc8]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85')" }} role="img" aria-label="A home-cooked dinner being prepared">
              <div className="absolute bottom-4 left-4 w-[104px] overflow-hidden rounded-xl border-2 border-white/80 shadow-lg sm:bottom-5 sm:left-5 sm:w-[120px]">
                <Image src="/brand/mood-food-logo-transparent.png" alt="Mood Food brand logo" width={532} height={426} className="h-auto w-full" />
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
          </Reveal>
        </section>
      )}
      {(isHome || page === "cuisines") && <Cuisines />}

      {isHome && <Testimonials />}

      {isHome && (
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
      )}

      {isHome && <Faq />}

      {isHome && (
        <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4a2477] via-[#6a3aa2] to-[#8a5cc4] px-6 py-11 text-white sm:px-10 sm:py-14 lg:px-16">
              <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[1px] border-white/20" />
              <div className="absolute -right-2 -top-16 h-56 w-56 rounded-full border-[1px] border-white/15" />
              <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6dc9a]">A good dinner is closer than you think</p>
                  <h2 className="serif max-w-xl text-4xl leading-tight sm:text-5xl">{t.footerCta}</h2>
                  <p className="mt-4 text-sm text-white/80">Tell us what you’re in the mood for. We’ll take it from there.</p>
                </div>
                <a href={whatsAppUrl("Hello Mood Food! I'd love to know what's on the menu.")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#f6dc9a] px-6 py-3.5 text-xs font-extrabold text-[#3a1462] transition hover:-translate-y-0.5 md:self-auto">
                  {t.footerButton} <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <footer className="relative overflow-hidden border-t border-[#e9e3d8] bg-[#5c3190]">
        <div className="mx-auto max-w-[1320px] px-5 pt-14 sm:px-8 lg:px-12">
          <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
            <div>
              <BrandMark compact />
              <div className="mt-4">
                <FssaiMark />
              </div>
              <p className="mt-4 max-w-xs text-xs leading-6 text-[#fff]">Quick food for easy life. Made with care, to bring a little more joy to the table.</p>
              <div className="mt-5 flex items-center gap-2">
                {[
                  { href: whatsAppUrl("Hello Mood Food!"), label: "WhatsApp", icon: <WhatsAppIcon size={16} /> },
                  { href: contact.instagram, label: "Instagram", icon: <InstagramIcon size={16} /> },
                  { href: contact.facebook, label: "Facebook", icon: <FacebookIcon size={16} /> },
                ].map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="grid h-10 w-10 place-items-center rounded-full border border-[#f6dc9a]/40 text-[#f6dc9a] transition hover:-translate-y-0.5 hover:bg-[#f6dc9a] hover:text-[#4a2477]">
                    {social.icon}
                  </a>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Pay by UPI", "Min. 1 kg", "48 hrs ahead"].map((chip) => (
                  <span key={chip} className="rounded-full bg-[#ffffff]/12 px-3 py-1.5 text-[10px] font-semibold text-[#f6dc9a]">{chip}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f6dc9a]">Explore</p>
              <div className="grid gap-3 text-xs text-[#fff]">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="transition hover:text-[#f6dc9a]">{link.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f6dc9a]">Our menu</p>
              <div className="grid gap-3 text-xs text-[#fff]">
                {["Kebabs", "Marinades", "Curries", "Snacks"].map((item) => (
                  <Link key={item} href="/products" className="transition hover:text-[#f6dc9a]">{item}</Link>
                ))}
                <Link href="/#frozen-menu" className="transition hover:text-[#f6dc9a]">Frozen menu (soon)</Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f6dc9a]">Say hello</p>
              <div className="grid gap-3 text-xs text-[#fff]">
                {[
                  { href: whatsAppUrl("Hello Mood Food!"), label: "WhatsApp us", icon: <WhatsAppIcon size={15} />, external: true },
                  { href: "tel:+919599944745", label: "+91 95999 44745", icon: <Phone size={15} /> },
                  { href: "mailto:hello@moodfood.com", label: "hello@moodfood.com", icon: <Mail size={15} /> },
                  { href: contact.instagram, label: "@mood.foodworld", icon: <InstagramIcon size={15} />, external: true },
                  { href: contact.facebook, label: "Facebook", icon: <FacebookIcon size={15} />, external: true },
                ].map((item) => (
                  <a key={item.label} href={item.href} {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center gap-3 transition hover:text-[#f6dc9a]">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ffffff]/15 text-[#f6dc9a] transition group-hover:bg-[#f6dc9a] group-hover:text-[#4a2477]">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
              <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-[#fff]/80">
                <Truck size={14} className="mt-0.5 shrink-0 text-[#f6dc9a]" /> Delivering around Gurugram &amp; Noida
              </p>
            </div>
          </div>
        </div>

        <p aria-hidden="true" className="serif pointer-events-none select-none whitespace-nowrap text-center text-[clamp(4rem,15vw,13rem)] leading-[0.8] text-[#ffffff]/[0.07]">Mood Food</p>

        <div className="relative border-t border-[#f6dc9a]/25 px-5 py-4 text-center text-[13px] text-[#fff]">
          © Mood Food. Made for good moods and good meals.
        </div>
      </footer>

      <a
        href={whatsAppUrl("Hi Mood Food, I would like to place an order.")}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className="floating-whatsapp"
      >
        <WhatsAppIcon size={28} />
      </a>

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