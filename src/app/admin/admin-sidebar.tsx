"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Layers3,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Receipt,
  Sparkles,
  Tag,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { Section } from "./types";

type NavItem = { name: Section; icon: typeof LayoutDashboard };

const workspaceItems: NavItem[] = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Products", icon: UtensilsCrossed },
  { name: "Categories", icon: Layers3 },
  { name: "Orders", icon: PackageCheck },
  { name: "Transactions", icon: Receipt },
  { name: "Promotions", icon: Tag },
];

const cmsItems: NavItem[] = [{ name: "What's New", icon: Sparkles }];

type AdminSidebarProps = {
  section: Section;
  open: boolean;
  pendingOrders: number;
  onSelect: (section: Section) => void;
  onClose: () => void;
  onSignOut: () => void;
};

export default function AdminSidebar({ section, open, pendingOrders, onSelect, onClose, onSignOut }: AdminSidebarProps) {
  const renderItem = ({ name, icon: Icon }: NavItem) => (
    <button
      type="button"
      key={name}
      onClick={() => onSelect(name)}
      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold transition ${section === name ? "bg-[#f8ede5] text-[#c94b18]" : "text-[#77756c] hover:bg-[#f7f5ef] hover:text-[#333229]"}`}
    >
      <Icon size={16} strokeWidth={1.8} /> {name}
      {name === "Orders" && pendingOrders > 0 && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[#e95e25] px-1 text-[9px] font-bold text-white">{pendingOrders}</span>}
    </button>
  );

  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-[#e8e4da] bg-[#fffdf9] transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-[#efebe3] px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#f1eab5] text-lg text-[#c95220]">♨</span>
            <span><span className="block text-[17px] font-extrabold tracking-[-0.07em] text-[#d95720]">Mood Food</span><span className="mt-0.5 block text-[8px] font-bold uppercase tracking-[0.16em] text-[#858176]">Kitchen dashboard</span></span>
          </Link>
          <button type="button" className="grid h-8 w-8 place-items-center rounded-lg lg:hidden" onClick={onClose} aria-label="Close sidebar"><X size={17} /></button>
        </div>
        <div className="px-4 pt-7">
          <p className="px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#a29e92]">Workspace</p>
          <nav className="mt-3 grid gap-1">{workspaceItems.map(renderItem)}</nav>
          <p className="mb-2 mt-9 px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#a29e92]">CMS</p>
          <nav className="grid gap-1">{cmsItems.map(renderItem)}</nav>
          <p className="mb-2 mt-9 px-3 text-[9px] font-extrabold uppercase tracking-[0.18em] text-[#a29e92]">Shortcuts</p>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold text-[#77756c] transition hover:bg-[#f7f5ef] hover:text-[#333229]"><ArrowUpRight size={16} /> View storefront</Link>
        </div>
        <div className="mt-auto border-t border-[#efebe3] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-[#f7f5ef] p-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#e9e1d1] text-xs font-extrabold text-[#706747]">MF</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-xs font-bold">Mood Food team</span><span className="mt-1 block text-[9px] text-[#918d82]">Administrator</span></span>
            <button type="button" onClick={onSignOut} title="Sign out" className="grid h-8 w-8 place-items-center rounded-lg text-[#858176] hover:bg-white hover:text-[#c94b18]"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}
