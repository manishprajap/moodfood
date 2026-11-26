"use client";

import { ArrowUpRight, Menu } from "lucide-react";
import Link from "next/link";
import { Section } from "./types";


export function AdminHeader({ section, onOpenSidebar }: { section: Section; onOpenSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-[#e8e4da] bg-[#f7f5ef]/95 px-5 backdrop-blur-md sm:px-8 lg:px-10">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onOpenSidebar} className="grid h-9 w-9 place-items-center rounded-lg border border-[#e1dccf] bg-white lg:hidden" aria-label="Open navigation"><Menu size={17} /></button>
        <div><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#a19d91]">Mood Food / {section}</p><h1 className="mt-0.5 text-sm font-extrabold">{section}</h1></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <span className="hidden items-center gap-2 rounded-full border border-[#dfe5d4] bg-[#f4f6ed] px-3 py-2 text-[10px] font-bold text-[#647448] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#7d9655]" /> Admin workspace</span>
        <Link href="/" className="grid h-9 w-9 place-items-center rounded-full border border-[#e1dccf] bg-white text-[#77756c] transition hover:text-[#d95720]" title="Open storefront"><ArrowUpRight size={15} /></Link>
      </div>
    </header>
  );
}