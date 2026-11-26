"use client";

import { PackageCheck } from "lucide-react";
import type { OrderRecord } from "../types";
import { money, requestJson } from "../utils";
import { statusLabels } from "../constants";

type OrdersSectionProps = {
  orders: OrderRecord[];
  setOrders: React.Dispatch<React.SetStateAction<OrderRecord[]>>;
  setError: (message: string) => void;
};

export default function OrdersSection({ orders, setOrders, setError }: OrdersSectionProps) {
  const pendingOrders = orders.filter((order) => order.status === "pending").length;
  const outForDelivery = orders.filter((order) => order.status === "out_for_delivery").length;

  async function changeOrderStatus(order: OrderRecord, status: string) {
    setError("");
    try {
      await requestJson(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((entry) => (entry.id === order.id ? { ...entry, status } : entry)));
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
      setOrders((current) => current.map((entry) => (entry.id === order.id ? { ...entry, paymentStatus } : entry)));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Payment status could not be updated.");
    }
  }

  return (
    <>
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">From your kitchen to their table</p>
        <h2 className="serif mt-2 text-3xl sm:text-4xl">The order board.</h2>
        <p className="mt-2 text-xs text-[#8b887e]">Review orders and keep each one moving.</p>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {[["All orders", orders.length], ["Need a reply", pendingOrders], ["On their way", outForDelivery]].map(([label, count]) => (
          <div key={label} className="rounded-xl border border-[#e8e4da] bg-[#fffdf9] p-4">
            <p className="text-[10px] text-[#8b887e]">{label}</p>
            <p className="mt-2 text-2xl font-extrabold">{count}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e8e4da] bg-[#fffdf9]">
        <table className="w-full min-w-[750px] border-collapse text-left">
          <thead>
            <tr className="bg-[#faf8f3] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#979387]">
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Customer &amp; items</th>
              <th className="px-5 py-3">Requested delivery</th>
              <th className="px-5 py-3">Total</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-[#f0ece4] text-xs">
                <td className="px-5 py-4 font-bold">#{order.orderNumber}<p className="mt-1 text-[9px] font-normal text-[#8b887e]">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p></td>
                <td className="px-5 py-4">
                  <p className="font-bold">{order.customerName}</p>
                  <p className="mt-1 text-[10px] text-[#8b887e]">{order.phone}</p>
                  <p className="mt-1 max-w-[220px] truncate text-[9px] text-[#8b887e]" title={order.deliveryAddress}>{order.deliveryAddress}</p>
                  <p className="mt-1 max-w-[220px] text-[9px] leading-4 text-[#8b887e]">{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(", ")}</p>
                </td>
                <td className="px-5 py-4 text-[#69665c]">{new Date(order.requestedDeliveryAt).toLocaleString("en-IN")}</td>
                <td className="px-5 py-4 font-bold">{money(Number(order.total))}</td>
                <td className="px-5 py-4">
                  <label className="sr-only" htmlFor={`payment-${order.id}`}>Update payment status for order {order.orderNumber}</label>
                  <select id={`payment-${order.id}`} value={order.paymentStatus} onChange={(event) => changeOrderPaymentStatus(order, event.target.value)} className="rounded-lg border border-[#e6e1d7] bg-white px-2.5 py-2 text-[10px] capitalize outline-none focus:border-[#d95720]">
                    {["pending", "paid", "refunded"].map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                </td>
                <td className="px-5 py-4">
                  <label className="sr-only" htmlFor={`order-${order.id}`}>Update status for order {order.orderNumber}</label>
                  <select id={`order-${order.id}`} value={order.status} onChange={(event) => changeOrderStatus(order, event.target.value)} className="rounded-lg border border-[#e6e1d7] bg-white px-2.5 py-2 text-[10px] outline-none focus:border-[#d95720]">
                    {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f5efe4] text-[#b38762]"><PackageCheck size={20} /></span>
            <p className="mt-3 text-xs font-bold">No orders just yet.</p>
            <p className="mt-1 text-[10px] text-[#8b887e]">New online orders will appear here when checkout is connected.</p>
          </div>
        )}
      </div>
    </>
  );
}
