"use client";

import { BarChart3, Clock3, CookingPot, PackageCheck, Plus, Settings2, Tag } from "lucide-react";
import { statusLabels } from "../constants";
import type { OrderRecord, ProductRecord, PromotionRecord, Section } from "../types";
import { money } from "../utils";

type OverviewSectionProps = {
  products: ProductRecord[];
  orders: OrderRecord[];
  promotions: PromotionRecord[];
  loading: boolean;
  onRefresh: () => void;
  onNavigate: (section: Section) => void;
  onAddProduct: () => void;
};

export default function OverviewSection({ products, orders, promotions, loading, onRefresh, onNavigate, onAddProduct }: OverviewSectionProps) {
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const livePromotions = promotions.filter((promotion) => promotion.enabled).length;
  const totalOrderValue = orders.reduce((sum, order) => sum + Number(order.total), 0);

  const stats = [
    { label: "Menu items", value: products.length, note: `${products.filter((product) => product.isActive).length} currently visible`, icon: CookingPot, color: "bg-[#f9e9dc] text-[#c76536]" },
    { label: "Orders to confirm", value: pendingOrders, note: "Waiting for a little love", icon: PackageCheck, color: "bg-[#eaf0e2] text-[#71834f]" },
    { label: "Total orders", value: orders.length, note: `${money(totalOrderValue)} order value`, icon: BarChart3, color: "bg-[#e6eef0] text-[#52798b]" },
    { label: "Live promotions", value: livePromotions, note: "Campaigns currently running", icon: Tag, color: "bg-[#f3edda] text-[#9c8247]" },
  ];

  return (
    <>
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">Here’s your kitchen at a glance</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">A good day to make something delicious.</h2>
          <p className="mt-2 text-xs text-[#8b887e]">A little snapshot of what’s happening today.</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#e1dccf] bg-white px-4 py-2.5 text-[10px] font-bold text-[#55534b] transition hover:border-[#d95720] disabled:opacity-60"><Clock3 size={13} /> {loading ? "Refreshing…" : "Refresh"}</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, note, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-4 sm:p-5">
            <div className="flex items-center justify-between"><span className="text-[10px] font-bold text-[#77756c]">{label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${color}`}><Icon size={17} /></span></div>
            <p className="mt-5 text-3xl font-extrabold tracking-[-0.05em]">{value}</p>
            <p className="mt-1 text-[10px] text-[#8b887e]">{note}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="rounded-2xl border border-[#e8e4da] bg-[#fffdf9] p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div><h3 className="text-sm font-extrabold">Recent orders</h3><p className="mt-1 text-[10px] text-[#8b887e]">Keep the good things moving.</p></div>
            <button type="button" onClick={() => onNavigate("Orders")} className="text-[10px] font-bold text-[#bc5830] hover:underline">See orders</button>
          </div>
          {orders.length === 0 ? (
            <div className="grid min-h-[170px] place-items-center text-center">
              <div>
                <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-[#f5efe4] text-[#b38762]"><PackageCheck size={18} /></span>
                <p className="mt-3 text-xs font-bold">Your first order will show up here.</p>
                <p className="mt-1 text-[10px] text-[#8b887e]">Orders appear after checkout is connected.</p>
              </div>
            </div>
          ) : (
            <div className="mt-5 divide-y divide-[#f0ece4]">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold">{order.customerName} <span className="font-normal text-[#8b887e]">· #{order.orderNumber}</span></p>
                    <p className="mt-1 text-[10px] text-[#8b887e]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold">{money(Number(order.total))}</p>
                    <p className="mt-1 text-[9px] capitalize text-[#8b887e]">{statusLabels[order.status] ?? order.status.replaceAll("_", " ")}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl bg-[#292821] p-5 text-white sm:p-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-[#f3a277]"><Settings2 size={18} /></span>
          <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.18em] text-[#f3a277]">Quick start</p>
          <h3 className="serif mt-2 text-2xl">Make the menu yours.</h3>
          <p className="mt-2 text-xs leading-5 text-white/60">Add a dish, update a price, or tell your customers about what’s new.</p>
          <button type="button" onClick={onAddProduct} className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#ef9a64] px-4 py-2.5 text-[10px] font-extrabold text-[#292821] transition hover:bg-[#ffc08d]"><Plus size={14} /> Add a menu item</button>
        </section>
      </div>
    </>
  );
}
