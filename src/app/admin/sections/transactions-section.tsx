"use client";

import { useMemo, useState } from "react";
import { Clock3, CreditCard, Search } from "lucide-react";
import TransactionDetailsDialog from "../dialogs/transaction-details-dialog";
import { SUCCESS_STATUSES, TRANSACTIONS_PER_PAGE, TX_PROVIDERS, TX_STATUSES } from "../constants";
import type { TransactionRecord } from "../types";
import { formatDateTime, txMoney, txStatusClass } from "../utils";

type TransactionsSectionProps = {
  transactions: TransactionRecord[];
  loading: boolean;
  onRefresh: () => void;
};

export default function TransactionsSection({ transactions, loading, onRefresh }: TransactionsSectionProps) {
  const [txSearch, setTxSearch] = useState("");
  const [txStatus, setTxStatus] = useState("all");
  const [txProvider, setTxProvider] = useState("all");
  const [txPage, setTxPage] = useState(1);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  const filteredTransactions = useMemo(() => {
    const term = txSearch.trim().toLowerCase();
    return transactions.filter((t) => {
      if (txStatus !== "all" && t.status !== txStatus) return false;
      if (txProvider !== "all" && t.provider !== txProvider) return false;
      if (!term) return true;
      return [
        t.transactionId,
        t.providerTransactionId,
        t.gatewayOrderId,
        t.gatewayPaymentId,
        t.utr,
        t.upiId,
        t.orderNumber,
        t.customerName,
        t.transactionName,
      ].some((value) => value?.toLowerCase().includes(term));
    });
  }, [transactions, txSearch, txStatus, txProvider]);

  const totalTxPages = Math.max(1, Math.ceil(filteredTransactions.length / TRANSACTIONS_PER_PAGE));
  const currentTxPage = Math.min(txPage, totalTxPages);
  const paginatedTransactions = useMemo(() => {
    const start = (currentTxPage - 1) * TRANSACTIONS_PER_PAGE;
    return filteredTransactions.slice(start, start + TRANSACTIONS_PER_PAGE);
  }, [filteredTransactions, currentTxPage]);

  const txStats = useMemo(() => {
    const paid = transactions.filter((t) => t.type === "payment" && SUCCESS_STATUSES.includes(t.status));
    const refunds = transactions.filter((t) => t.type === "refund" || t.status === "refunded");
    return {
      collected: paid.reduce((sum, t) => sum + t.amount, 0),
      refunded: refunds.reduce((sum, t) => sum + t.amount, 0),
      failed: transactions.filter((t) => t.status === "failed").length,
      pending: transactions.filter((t) => ["pending", "created", "authorized"].includes(t.status)).length,
    };
  }, [transactions]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#b0714f]">Follow the money</p>
          <h2 className="serif mt-2 text-3xl sm:text-4xl">Transactions.</h2>
          <p className="mt-2 text-xs text-[#8b887e]">{transactions.length} payments and refunds recorded</p>
        </div>
        <button type="button" onClick={onRefresh} disabled={loading} className="inline-flex items-center gap-2 rounded-full border border-[#e1dccf] bg-white px-4 py-2.5 text-[10px] font-bold text-[#55534b] transition hover:border-[#d95720] disabled:opacity-60">
          <Clock3 size={13} /> {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Collected", txMoney(txStats.collected)],
          ["Refunded", txMoney(txStats.refunded)],
          ["Pending", txStats.pending],
          ["Failed", txStats.failed],
        ].map(([label, value]) => (
          <div key={label as string} className="rounded-xl border border-[#e8e4da] bg-[#fffdf9] p-4">
            <p className="text-[10px] text-[#8b887e]">{label}</p>
            <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex min-w-[220px] flex-1 items-center gap-2 rounded-xl border border-[#e5e0d6] bg-white px-3.5 py-2.5 text-[#8b887e] sm:max-w-[360px]">
          <Search size={15} />
          <input value={txSearch} onChange={(event) => { setTxSearch(event.target.value); setTxPage(1); }} className="w-full bg-transparent text-xs text-[#333229] outline-none" placeholder="Search ID, UTR, UPI, order, customer" />
        </label>
        <select value={txStatus} onChange={(event) => { setTxStatus(event.target.value); setTxPage(1); }} aria-label="Filter by status" className="rounded-xl border border-[#e5e0d6] bg-white px-3 py-2.5 text-xs capitalize outline-none focus:border-[#d95720]">
          <option value="all">All statuses</option>
          {TX_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <select value={txProvider} onChange={(event) => { setTxProvider(event.target.value); setTxPage(1); }} aria-label="Filter by provider" className="rounded-xl border border-[#e5e0d6] bg-white px-3 py-2.5 text-xs capitalize outline-none focus:border-[#d95720]">
          <option value="all">All providers</option>
          {TX_PROVIDERS.map((provider) => <option key={provider} value={provider}>{provider}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#e8e4da] bg-[#fffdf9]">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="bg-[#faf8f3] text-[9px] font-extrabold uppercase tracking-[0.1em] text-[#979387]">
              <th className="px-5 py-3">Transaction</th>
              <th className="px-5 py-3">Order &amp; customer</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((t) => (
              <tr key={t.id} className="border-t border-[#f0ece4] text-xs">
                <td className="px-5 py-4">
                  <p className="max-w-[220px] truncate font-bold" title={t.transactionId}>{t.transactionId}</p>
                  <p className="mt-1 text-[9px] text-[#8b887e]">{formatDateTime(t.createdAt)}</p>
                  <p className="mt-1 text-[9px] capitalize text-[#8b887e]">{t.type}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold">{t.orderNumber ? `#${t.orderNumber}` : t.orderId ? `Order ${t.orderId}` : "—"}</p>
                  <p className="mt-1 text-[10px] text-[#8b887e]">{t.customerName ?? (t.userId ? `User ${t.userId}` : "Guest")}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="font-bold capitalize">{t.provider}{t.paymentMode ? ` · ${t.paymentMode.replaceAll("_", " ")}` : ""}</p>
                  <p className="mt-1 max-w-[200px] truncate text-[10px] text-[#8b887e]">
                    {t.upiId || (t.cardNetwork && t.cardLast4 ? `${t.cardNetwork} •••• ${t.cardLast4}` : t.bankName) || t.utr || "—"}
                  </p>
                </td>
                <td className="px-5 py-4 font-bold">{txMoney(t.amount)}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold capitalize ${txStatusClass(t.status)}`}>{t.status}</span>
                </td>
                <td className="px-5 py-4 text-right">
                  <button type="button" onClick={() => setSelectedTx(t)} className="rounded-lg border border-[#e6e1d7] px-3 py-2 text-[9px] font-bold text-[#68665d] hover:border-[#d95720] hover:text-[#d95720]">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredTransactions.length === 0 && (
          <div className="px-5 py-14 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#f5efe4] text-[#b38762]"><CreditCard size={20} /></span>
            <p className="mt-3 text-xs font-bold">{loading ? "Loading transactions…" : transactions.length ? "No transactions match your filters." : "No transactions yet."}</p>
          </div>
        )}
      </div>

      {filteredTransactions.length > 0 && (
        <div className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-[#e8e4da] bg-[#fffdf9] px-4 py-3">
          <button type="button" onClick={() => setTxPage((page) => Math.max(1, page - 1))} disabled={currentTxPage <= 1} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-xs font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
          <span className="text-center text-xs font-semibold text-[#69665c]">Page {currentTxPage} of {totalTxPages} · {filteredTransactions.length} results</span>
          <button type="button" onClick={() => setTxPage((page) => Math.min(totalTxPages, page + 1))} disabled={currentTxPage >= totalTxPages} className="rounded-lg border border-[#e5e0d6] bg-white px-4 py-2 text-xs font-bold text-[#69665c] transition hover:border-[#d95720] hover:text-[#d95720] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
        </div>
      )}

      {selectedTx && <TransactionDetailsDialog transaction={selectedTx} onClose={() => setSelectedTx(null)} />}
    </>
  );
}
